from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv
import json
from datetime import datetime
import calendar

from services.simple_ai_service import SimpleAIService

# Load environment variables
load_dotenv()

app = FastAPI(title="Fit Hero AI Test Service", version="0.1.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize simple AI service
ai_service = SimpleAIService()

# Simple request models for testing
class TestWorkoutRequest(BaseModel):
    user_id: str
    month: int  # 1-12
    year: int
    fitness_level: str = "beginner"  # beginner, intermediate, advanced
    goals: List[str] = ["general_fitness"]
    available_time: int = 45  # minutes per session
    equipment: List[str] = ["bodyweight"]
    
    @validator('month')
    def validate_month(cls, v):
        if v < 1 or v > 12:
            raise ValueError('Month must be between 1 and 12')
        return v

class TestMealRequest(BaseModel):
    user_id: str
    month: int  # 1-12
    year: int
    dietary_preferences: List[str] = ["balanced"]
    calorie_target: int = 2000
    
    @validator('month')
    def validate_month(cls, v):
        if v < 1 or v > 12:
            raise ValueError('Month must be between 1 and 12')
        return v

@app.get("/")
async def root():
    return {"message": "Fit Hero AI Test Service - Logging Only!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "fit-hero-ai-test"}

@app.post("/test-monthly-workout-plan")
async def test_monthly_workout_plan(request: TestWorkoutRequest):
    """
    Test monthly workout plan generation - LOGS ONLY, NO DATABASE
    """
    try:
        print(f"\n{'='*80}")
        print(f"🏋️ TESTING MONTHLY WORKOUT PLAN GENERATION")
        print(f"{'='*80}")
        print(f"User ID: {request.user_id}")
        print(f"Month/Year: {request.month}/{request.year}")
        print(f"Fitness Level: {request.fitness_level}")
        print(f"Goals: {request.goals}")
        print(f"Available Time: {request.available_time} minutes")
        print(f"Equipment: {request.equipment}")
        
        # Step 1: Generate raw AI response
        print(f"\n📝 Step 1: Generating RAW AI Response...")
        raw_response = await ai_service.generate_monthly_workout_plan(
            user_id=request.user_id,
            month=request.month,
            year=request.year,
            fitness_level=request.fitness_level,
            goals=request.goals,
            available_time=request.available_time,
            equipment=request.equipment
        )
        
        print(f"✅ Raw AI Response Generated!")
        print(f"📊 Raw Response Type: {type(raw_response)}")
        print(f"📊 Raw Response Keys: {list(raw_response.keys()) if isinstance(raw_response, dict) else 'Not a dict'}")
        
        # Log raw response (truncated for readability)
        print(f"\n🔍 RAW AI RESPONSE (First 500 chars):")
        print("-" * 50)
        raw_str = json.dumps(raw_response, indent=2)[:500]
        print(raw_str)
        if len(json.dumps(raw_response, indent=2)) > 500:
            print("... (truncated)")
        print("-" * 50)
        
        # Step 2: Apply filtering
        print(f"\n🔧 Step 2: Applying AI Service Filtering...")
        filtered_response = ai_service.filter_workout_plan(raw_response)
        
        print(f"✅ Filtering Complete!")
        print(f"📊 Filtered Response Type: {type(filtered_response)}")
        print(f"📊 Filtered Response Keys: {list(filtered_response.keys()) if isinstance(filtered_response, dict) else 'Not a dict'}")
        
        # Log key structure
        if isinstance(filtered_response, dict):
            print(f"\n📋 FILTERED STRUCTURE:")
            print("-" * 30)
            for key, value in filtered_response.items():
                if isinstance(value, dict):
                    print(f"{key}: dict with {len(value)} keys")
                elif isinstance(value, list):
                    print(f"{key}: list with {len(value)} items")
                else:
                    print(f"{key}: {type(value).__name__}")
            print("-" * 30)
        
        # Check daily workouts specifically
        if 'daily_workouts' in filtered_response:
            daily_workouts = filtered_response['daily_workouts']
            print(f"\n💪 DAILY WORKOUTS ANALYSIS:")
            print(f"Total days with workouts: {len(daily_workouts)}")
            
            # Show first few days as examples
            for i, (day, workout) in enumerate(list(daily_workouts.items())[:3]):
                print(f"\nDay {day} example:")
                if isinstance(workout, dict):
                    print(f"  Type: {workout.get('workout_type', 'Unknown')}")
                    print(f"  Duration: {workout.get('duration', 'Unknown')} min")
                    exercises = workout.get('exercises', [])
                    print(f"  Exercises: {len(exercises)} exercises")
                    if exercises and isinstance(exercises[0], dict):
                        print(f"    Example: {exercises[0].get('name', 'Unknown exercise')}")
        
        # Generate metadata
        days_in_month = calendar.monthrange(request.year, request.month)[1]
        metadata = {
            "month": request.month,
            "year": request.year,
            "days_in_month": days_in_month,
            "generated_at": datetime.utcnow().isoformat(),
            "service_version": "test-0.1.0",
            "test_mode": True
        }
        
        print(f"\n✅ TEST COMPLETED SUCCESSFULLY!")
        print(f"{'='*80}")
        
        return {
            "status": "test_success",
            "message": "Monthly workout plan generated successfully (test mode)",
            "metadata": metadata,
            "summary": {
                "raw_response_keys": list(raw_response.keys()) if isinstance(raw_response, dict) else [],
                "filtered_response_keys": list(filtered_response.keys()) if isinstance(filtered_response, dict) else [],
                "daily_workouts_count": len(filtered_response.get('daily_workouts', {})) if isinstance(filtered_response, dict) else 0
            }
        }
        
    except Exception as e:
        print(f"\n❌ ERROR IN TEST:")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print(f"{'='*80}")
        
        raise HTTPException(status_code=500, detail={
            "error": "Test failed",
            "details": str(e),
            "test_mode": True
        })

@app.post("/test-monthly-meal-plan")
async def test_monthly_meal_plan(request: TestMealRequest):
    """
    Test monthly meal plan generation - LOGS ONLY, NO DATABASE
    """
    try:
        print(f"\n{'='*80}")
        print(f"🍽️ TESTING MONTHLY MEAL PLAN GENERATION")
        print(f"{'='*80}")
        print(f"User ID: {request.user_id}")
        print(f"Month/Year: {request.month}/{request.year}")
        print(f"Dietary Preferences: {request.dietary_preferences}")
        print(f"Calorie Target: {request.calorie_target}")
        
        # Step 1: Generate raw AI response
        print(f"\n📝 Step 1: Generating RAW AI Response...")
        raw_response = await ai_service.generate_monthly_meal_plan(
            user_id=request.user_id,
            month=request.month,
            year=request.year,
            dietary_preferences=request.dietary_preferences,
            calorie_target=request.calorie_target
        )
        
        print(f"✅ Raw AI Response Generated!")
        print(f"📊 Raw Response Type: {type(raw_response)}")
        print(f"📊 Raw Response Keys: {list(raw_response.keys()) if isinstance(raw_response, dict) else 'Not a dict'}")
        
        # Log raw response (truncated for readability)
        print(f"\n🔍 RAW AI RESPONSE (First 500 chars):")
        print("-" * 50)
        raw_str = json.dumps(raw_response, indent=2)[:500]
        print(raw_str)
        if len(json.dumps(raw_response, indent=2)) > 500:
            print("... (truncated)")
        print("-" * 50)
        
        # Step 2: Apply filtering
        print(f"\n🔧 Step 2: Applying AI Service Filtering...")
        filtered_response = ai_service.filter_meal_plan(raw_response)
        
        print(f"✅ Filtering Complete!")
        print(f"📊 Filtered Response Type: {type(filtered_response)}")
        print(f"📊 Filtered Response Keys: {list(filtered_response.keys()) if isinstance(filtered_response, dict) else 'Not a dict'}")
        
        # Log key structure
        if isinstance(filtered_response, dict):
            print(f"\n📋 FILTERED STRUCTURE:")
            print("-" * 30)
            for key, value in filtered_response.items():
                if isinstance(value, dict):
                    print(f"{key}: dict with {len(value)} keys")
                elif isinstance(value, list):
                    print(f"{key}: list with {len(value)} items")
                else:
                    print(f"{key}: {type(value).__name__}")
            print("-" * 30)
        
        # Check daily meals specifically
        if 'daily_meals' in filtered_response:
            daily_meals = filtered_response['daily_meals']
            print(f"\n🍽️ DAILY MEALS ANALYSIS:")
            print(f"Total days with meals: {len(daily_meals)}")
            
            # Show first day as example
            if daily_meals:
                first_day = list(daily_meals.keys())[0]
                first_meal_plan = daily_meals[first_day]
                print(f"\nDay {first_day} example:")
                if isinstance(first_meal_plan, dict):
                    for meal_type in ['breakfast', 'lunch', 'dinner']:
                        if meal_type in first_meal_plan:
                            meal = first_meal_plan[meal_type]
                            if isinstance(meal, dict):
                                print(f"  {meal_type.title()}: {meal.get('name', 'Unknown')}")
                                print(f"    Calories: {meal.get('calories', 'Unknown')}")
        
        # Generate metadata
        days_in_month = calendar.monthrange(request.year, request.month)[1]
        metadata = {
            "month": request.month,
            "year": request.year,
            "days_in_month": days_in_month,
            "generated_at": datetime.utcnow().isoformat(),
            "service_version": "test-0.1.0",
            "test_mode": True
        }
        
        print(f"\n✅ TEST COMPLETED SUCCESSFULLY!")
        print(f"{'='*80}")
        
        return {
            "status": "test_success",
            "message": "Monthly meal plan generated successfully (test mode)",
            "metadata": metadata,
            "summary": {
                "raw_response_keys": list(raw_response.keys()) if isinstance(raw_response, dict) else [],
                "filtered_response_keys": list(filtered_response.keys()) if isinstance(filtered_response, dict) else [],
                "daily_meals_count": len(filtered_response.get('daily_meals', {})) if isinstance(filtered_response, dict) else 0
            }
        }
        
    except Exception as e:
        print(f"\n❌ ERROR IN TEST:")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print(f"{'='*80}")
        
        raise HTTPException(status_code=500, detail={
            "error": "Test failed",
            "details": str(e),
            "test_mode": True
        })

@app.post("/quick-test")
async def quick_test():
    """
    Quick test with hardcoded parameters
    """
    try:
        print(f"\n🚀 QUICK TEST - Generating sample plans...")
        
        # Test workout plan
        workout_result = await test_monthly_workout_plan(TestWorkoutRequest(
            user_id="test_user_123",
            month=10,  # October
            year=2024,
            fitness_level="beginner",
            goals=["weight_loss", "general_fitness"],
            available_time=30,
            equipment=["bodyweight", "dumbbells"]
        ))
        
        print(f"\n⏸️ Pausing between tests...")
        
        # Test meal plan
        meal_result = await test_monthly_meal_plan(TestMealRequest(
            user_id="test_user_123",
            month=10,  # October
            year=2024,
            dietary_preferences=["balanced", "high_protein"],
            calorie_target=1800
        ))
        
        return {
            "status": "quick_test_success",
            "workout_test": workout_result["summary"],
            "meal_test": meal_result["summary"]
        }
        
    except Exception as e:
        print(f"\n❌ QUICK TEST FAILED: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)  # Different port for testing
