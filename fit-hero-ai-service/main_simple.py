from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import logging
from datetime import datetime, timedelta
import asyncio
from config_simple import API_CONFIG
from services.simple_ai_service import SimpleAIService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(**API_CONFIG)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI service
try:
    ai_service = SimpleAIService()
    logger.info("✅ AI Service initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize AI service: {e}")
    ai_service = None

# Pydantic models
class WorkoutRequest(BaseModel):
    fitness_level: Optional[str] = "beginner"
    goals: Optional[str] = "general fitness"
    available_time: Optional[str] = "30 minutes"
    equipment: Optional[str] = "basic"

class MealRequest(BaseModel):
    goals: Optional[str] = "general health"
    dietary_preferences: Optional[str] = "no restrictions"
    activity_level: Optional[str] = "moderate"
    allergies: Optional[str] = "none"

class ProgressRequest(BaseModel):
    current_stats: Optional[Dict[str, Any]] = {}
    goals: Optional[Dict[str, Any]] = {}
    time_period: Optional[str] = "30 days"

class DailyPlanRequest(BaseModel):
    user_id: str
    fitness_level: Optional[str] = "beginner"
    goals: Optional[List[str]] = ["general fitness"]
    available_time: Optional[int] = 30
    equipment: Optional[List[str]] = ["basic"]
    dietary_preferences: Optional[List[str]] = ["no restrictions"]
    calorie_target: Optional[int] = 2000
    allergies: Optional[List[str]] = []

# Daily plan generation
async def generate_daily_plans_for_user(user_data: DailyPlanRequest):
    """Generate both workout and meal plans for a user"""
    try:
        # Generate workout plan
        workout_request = WorkoutRequest(
            fitness_level=user_data.fitness_level,
            goals=", ".join(user_data.goals),
            available_time=f"{user_data.available_time} minutes",
            equipment=", ".join(user_data.equipment)
        )
        
        workout_plan = ai_service.generate_workout_plan(workout_request.dict())
        
        # Generate meal plan
        meal_request = MealRequest(
            goals=", ".join(user_data.goals),
            dietary_preferences=", ".join(user_data.dietary_preferences),
            allergies=", ".join(user_data.allergies) if user_data.allergies else "none"
        )
        
        meal_plan = ai_service.generate_meal_recommendations(meal_request.dict())
        
        return {
            "user_id": user_data.user_id,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "workout_plan": workout_plan,
            "meal_plan": meal_plan,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating daily plans for user {user_data.user_id}: {e}")
        raise e

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Fit Hero AI Service",
        "ai_available": ai_service is not None
    }

# Workout plan endpoint
@app.post("/api/workout-plan")
async def generate_workout_plan(request: WorkoutRequest):
    if not ai_service:
        raise HTTPException(status_code=503, detail="AI service not available")
    
    try:
        result = ai_service.generate_workout_plan(request.dict())
        return result
    except Exception as e:
        logger.error(f"Error generating workout plan: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Meal recommendations endpoint
@app.post("/api/meal-recommendations")
async def generate_meal_recommendations(request: MealRequest):
    if not ai_service:
        raise HTTPException(status_code=503, detail="AI service not available")
    
    try:
        result = ai_service.generate_meal_recommendations(request.dict())
        return result
    except Exception as e:
        logger.error(f"Error generating meal recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Progress analysis endpoint
@app.post("/api/progress-analysis")
async def analyze_progress(request: ProgressRequest):
    if not ai_service:
        raise HTTPException(status_code=503, detail="AI service not available")
    
    try:
        result = ai_service.analyze_progress(request.dict())
        return result
    except Exception as e:
        logger.error(f"Error analyzing progress: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Daily plan generation endpoint
@app.post("/api/generate-daily-plans")
async def generate_daily_plans(request: DailyPlanRequest):
    if not ai_service:
        raise HTTPException(status_code=503, detail="AI service not available")
    
    try:
        result = await generate_daily_plans_for_user(request)
        logger.info(f"✅ Generated daily plans for user {request.user_id}")
        return result
    except Exception as e:
        logger.error(f"Error generating daily plans for user {request.user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Batch daily plan generation for multiple users
@app.post("/api/generate-daily-plans-batch")
async def generate_daily_plans_batch(requests: List[DailyPlanRequest], background_tasks: BackgroundTasks):
    if not ai_service:
        raise HTTPException(status_code=503, detail="AI service not available")
    
    # Process in background to avoid timeout
    async def process_batch():
        results = []
        for user_request in requests:
            try:
                result = await generate_daily_plans_for_user(user_request)
                results.append(result)
                logger.info(f"✅ Generated daily plans for user {user_request.user_id}")
            except Exception as e:
                logger.error(f"❌ Failed to generate plans for user {user_request.user_id}: {e}")
                results.append({
                    "user_id": user_request.user_id,
                    "error": str(e),
                    "date": datetime.now().strftime("%Y-%m-%d")
                })
        return results
    
    background_tasks.add_task(process_batch)
    
    return {
        "message": f"Started generating daily plans for {len(requests)} users",
        "status": "processing",
        "user_count": len(requests)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
