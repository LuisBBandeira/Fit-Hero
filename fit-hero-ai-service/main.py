from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv
import json
from datetime import datetime, timedelta
import calendar

from services.monthly_plan_service import MonthlyPlanService
from services.ai_filter_service import AIFilterService
from services.webhook_service import webhook_service

# Load environment variables
load_dotenv()

app = FastAPI(title="Fit Hero AI Service", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://*.vercel.app",   # Vercel deployments
        "https://fit-hero.vercel.app",  # Your production domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
monthly_plan_service = MonthlyPlanService()
ai_filter_service = AIFilterService()

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "fit-hero-ai"}

# Pydantic models for monthly plan requests
class MonthlyWorkoutPlanRequest(BaseModel):
    user_id: str
    month: int  # 1-12
    year: int
    age: int = 30
    weight: float = 75.0
    fitness_level: str  # beginner, intermediate, advanced
    goals: List[str]  # weight_loss, muscle_gain, endurance, etc.
    available_time: int  # minutes per session
    equipment: List[str]  # gym, home, bodyweight, etc.
    injuries_limitations: Optional[List[str]] = None
    preferred_activities: Optional[List[str]] = None
    
    @validator('month')
    def validate_month(cls, v):
        if v < 1 or v > 12:
            raise ValueError('Month must be between 1 and 12')
        return v
    
    @validator('year')
    def validate_year(cls, v):
        current_year = datetime.now().year
        if v < current_year or v > current_year + 2:
            raise ValueError(f'Year must be between {current_year} and {current_year + 2}')
        return v

class MonthlyMealPlanRequest(BaseModel):
    user_id: str
    month: int  # 1-12
    year: int
    age: int = 30
    weight: float = 75.0
    goals: List[str] = ["maintenance"]
    activity_level: str = "moderately_active"
    dietary_preferences: List[str]  # vegetarian, vegan, keto, etc.
    allergies: Optional[List[str]] = None
    calorie_target: Optional[int] = None
    meal_prep_time: Optional[int] = None  # minutes
    budget_range: Optional[str] = None  # low, medium, high
    
    @validator('month')
    def validate_month(cls, v):
        if v < 1 or v > 12:
            raise ValueError('Month must be between 1 and 12')
        return v
    
    @validator('year')
    def validate_year(cls, v):
        current_year = datetime.now().year
        if v < current_year or v > current_year + 2:
            raise ValueError(f'Year must be between {current_year} and {current_year + 2}')
        return v

@app.get("/")
async def root():
    return {"message": "Fit Hero Monthly AI Service is running!"}

@app.post("/generate-monthly-workout-plan")
async def generate_monthly_workout_plan(request: MonthlyWorkoutPlanRequest):
    """
    Generate a complete monthly workout plan.
    Returns filtered and validated data ready for database storage.
    """
    try:
        # Step 1: Generate raw AI response
        raw_response = await monthly_plan_service.generate_monthly_workout_plan(
            user_id=request.user_id,
            month=request.month,
            year=request.year,
            age=request.age,
            weight=request.weight,
            fitness_level=request.fitness_level,
            goals=request.goals,
            available_time=request.available_time,
            equipment=request.equipment,
            injuries_limitations=request.injuries_limitations,
            preferred_activities=request.preferred_activities
        )
        
        # Step 2: Apply AI service filtering
        filtered_data = ai_filter_service.filter_workout_plan(raw_response)
        
        # Step 3: Validate structure and add metadata
        validated_data = ai_filter_service.validate_workout_plan_structure(
            filtered_data, request.month, request.year
        )
        
        return {
            "status": "success",
            "raw_response": raw_response,
            "filtered_data": filtered_data,
            "validated_data": validated_data,
            "metadata": {
                "month": request.month,
                "year": request.year,
                "days_in_month": calendar.monthrange(request.year, request.month)[1],
                "generated_at": datetime.utcnow().isoformat(),
                "service_version": "2.0.0"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail={
            "error": "Failed to generate monthly workout plan",
            "details": str(e),
            "request_id": f"{request.user_id}_{request.month}_{request.year}_workout"
        })

@app.post("/generate-monthly-meal-plan")
async def generate_monthly_meal_plan(request: MonthlyMealPlanRequest):
    """
    Generate a complete monthly meal plan.
    Returns filtered and validated data ready for database storage.
    """
    try:
        # Step 1: Generate raw AI response
        raw_response = await monthly_plan_service.generate_monthly_meal_plan(
            user_id=request.user_id,
            month=request.month,
            year=request.year,
            age=request.age,
            weight=request.weight,
            goals=request.goals,
            activity_level=request.activity_level,
            dietary_preferences=request.dietary_preferences,
            allergies=request.allergies,
            calorie_target=request.calorie_target,
            meal_prep_time=request.meal_prep_time,
            budget_range=request.budget_range
        )
        
        # Step 2: Apply AI service filtering
        filtered_data = ai_filter_service.filter_meal_plan(raw_response)
        
        # Step 3: Validate structure and add metadata
        validated_data = ai_filter_service.validate_meal_plan_structure(
            filtered_data, request.month, request.year
        )
        
        return {
            "status": "success",
            "raw_response": raw_response,
            "filtered_data": filtered_data,
            "validated_data": validated_data,
            "metadata": {
                "month": request.month,
                "year": request.year,
                "days_in_month": calendar.monthrange(request.year, request.month)[1],
                "generated_at": datetime.utcnow().isoformat(),
                "service_version": "2.0.0"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail={
            "error": "Failed to generate monthly meal plan",
            "details": str(e),
            "request_id": f"{request.user_id}_{request.month}_{request.year}_meal"
        })

@app.get("/monthly-plan-status/{user_id}/{month}/{year}")
async def get_monthly_plan_status(user_id: str, month: int, year: int):
    """
    Check the status of monthly plan generation for a user.
    """
    try:
        # This would typically query the database in the main app
        # For now, return a status check endpoint
        return {
            "user_id": user_id,
            "month": month,
            "year": year,
            "service_status": "operational",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/activate-ai")
async def activate_ai_for_player(request: dict):
    """
    Activate AI service for a new player - generates both workout and meal plans
    Sends webhooks on completion/failure
    """
    try:
        user_id = request.get('user_id')
        player_data = request.get('player_data', {})
        
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id is required")
        
        current_date = datetime.now()
        month = current_date.month
        year = current_date.year
        
        # Extract player data with defaults
        age = player_data.get('age', 30)
        weight = player_data.get('weight', 75.0)
        fitness_level = player_data.get('fitness_level', 'beginner')
        goals = player_data.get('goals', ['general_fitness'])
        equipment = player_data.get('equipment', ['bodyweight'])
        dietary_preferences = player_data.get('dietary_preferences', ['balanced'])
        
        results = {
            'workout_plan_success': False,
            'meal_plan_success': False,
            'errors': []
        }
        
        # Generate workout plan
        try:
            workout_response = await monthly_plan_service.generate_monthly_workout_plan(
                user_id=user_id,
                month=month,
                year=year,
                age=age,
                weight=weight,
                fitness_level=fitness_level,
                goals=goals,
                available_time=45,
                equipment=equipment,
                injuries_limitations=[],
                preferred_activities=[]
            )
            results['workout_plan_success'] = workout_response.get('success', False)
            if not results['workout_plan_success']:
                results['errors'].append(f"Workout plan: {workout_response.get('error', 'Unknown error')}")
        except Exception as e:
            results['errors'].append(f"Workout plan: {str(e)}")
        
        # Generate meal plan
        try:
            meal_response = await monthly_plan_service.generate_monthly_meal_plan(
                user_id=user_id,
                month=month,
                year=year,
                age=age,
                weight=weight,
                goals=goals,
                activity_level='moderately_active',
                dietary_preferences=dietary_preferences,
                allergies=[],
                calorie_target=None,
                meal_prep_time=30,
                budget_range='medium'
            )
            results['meal_plan_success'] = meal_response.get('success', False)
            if not results['meal_plan_success']:
                results['errors'].append(f"Meal plan: {meal_response.get('error', 'Unknown error')}")
        except Exception as e:
            results['errors'].append(f"Meal plan: {str(e)}")
        
        # Send completion or failure webhook
        if results['workout_plan_success'] and results['meal_plan_success']:
            await webhook_service.notify_ai_activation_completed(user_id, results)
        elif results['workout_plan_success'] or results['meal_plan_success']:
            await webhook_service.notify_ai_activation_completed(user_id, results)
        else:
            await webhook_service.notify_ai_activation_failed(user_id, {
                'error': 'Both workout and meal plan generation failed',
                'type': 'generation_failure',
                'details': results['errors']
            })
        
        return {
            "status": "completed",
            "user_id": user_id,
            "results": results,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        # Send failure webhook
        await webhook_service.notify_ai_activation_failed(user_id or 'unknown', {
            'error': str(e),
            'type': 'activation_error',
            'retry_possible': True
        })
        
        raise HTTPException(status_code=500, detail={
            "error": "Failed to activate AI service",
            "details": str(e)
        })

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))  # Use PORT env var or default to 8001
    uvicorn.run(app, host="0.0.0.0", port=port)
