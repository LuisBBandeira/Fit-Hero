from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv

from services.crew_service import CrewService

# Load environment variables
load_dotenv()

app = FastAPI(title="Fit Hero AI Service", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize CrewAI service
crew_service = CrewService()

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "fit-hero-ai"}

# Pydantic models for request/response
class WorkoutPlanRequest(BaseModel):
    user_id: str
    fitness_level: str  # beginner, intermediate, advanced
    goals: List[str]  # weight_loss, muscle_gain, endurance, etc.
    available_time: int  # minutes per session
    equipment: List[str]  # gym, home, bodyweight, etc.
    injuries_limitations: Optional[List[str]] = None
    preferred_activities: Optional[List[str]] = None

class ProgressAnalysisRequest(BaseModel):
    user_id: str
    workout_data: Dict[str, Any]
    weight_data: Dict[str, Any]
    meal_data: Dict[str, Any]
    goals: List[str]

class MealRecommendationRequest(BaseModel):
    user_id: str
    dietary_preferences: List[str]  # vegetarian, vegan, keto, etc.
    allergies: Optional[List[str]] = None
    calorie_target: Optional[int] = None
    meal_prep_time: Optional[int] = None
    budget_range: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Fit Hero AI Service is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "fit-hero-ai"}

@app.post("/generate-workout-plan")
async def generate_workout_plan(request: WorkoutPlanRequest):
    try:
        workout_plan = await crew_service.generate_workout_plan(
            user_id=request.user_id,
            fitness_level=request.fitness_level,
            goals=request.goals,
            available_time=request.available_time,
            equipment=request.equipment,
            injuries_limitations=request.injuries_limitations,
            preferred_activities=request.preferred_activities
        )
        return {"workout_plan": workout_plan}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-progress")
async def analyze_progress(request: ProgressAnalysisRequest):
    try:
        analysis = await crew_service.analyze_progress(
            user_id=request.user_id,
            workout_data=request.workout_data,
            weight_data=request.weight_data,
            meal_data=request.meal_data,
            goals=request.goals
        )
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommend-meals")
async def recommend_meals(request: MealRecommendationRequest):
    try:
        recommendations = await crew_service.recommend_meals(
            user_id=request.user_id,
            dietary_preferences=request.dietary_preferences,
            allergies=request.allergies,
            calorie_target=request.calorie_target,
            meal_prep_time=request.meal_prep_time,
            budget_range=request.budget_range
        )
        return {"recommendations": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
