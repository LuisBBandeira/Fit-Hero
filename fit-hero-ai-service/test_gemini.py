#!/usr/bin/env python3

import asyncio
import os
import sys
from dotenv import load_dotenv

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.crew_service_simple import CrewService

async def test_gemini_integration():
    """Test the Gemini integration with CrewAI"""
    
    print("🧪 Testing Gemini 2.0 Flash integration with CrewAI...")
    
    try:
        # Initialize the service
        crew_service = CrewService()
        print("✅ CrewService initialized successfully")
        
        # Test workout plan generation
        print("\n🏋️ Testing workout plan generation...")
        workout_plan = await crew_service.generate_workout_plan(
            user_id="test_user",
            fitness_level="beginner",
            goals=["weight_loss", "muscle_gain"],
            available_time=45,
            equipment=["dumbbells", "resistance_bands"],
            injuries_limitations=None,
            preferred_activities=["strength_training"]
        )
        
        print("✅ Workout plan generated successfully!")
        print(f"Plan structure: {list(workout_plan.keys())}")
        
        # Test meal recommendations
        print("\n🍽️ Testing meal recommendations...")
        meal_recommendations = await crew_service.recommend_meals(
            user_id="test_user",
            dietary_preferences=["vegetarian"],
            allergies=None,
            calorie_target=2000,
            meal_prep_time=30,
            budget_range="moderate"
        )
        
        print("✅ Meal recommendations generated successfully!")
        print(f"Recommendations structure: {list(meal_recommendations.keys())}")
        
        # Test progress analysis
        print("\n📊 Testing progress analysis...")
        mock_workout_data = {
            "sessions": [{"date": "2025-01-01", "type": "strength", "duration": 45}],
            "totalSessions": 1,
            "consistency": 80
        }
        mock_weight_data = {
            "entries": [{"date": "2025-01-01", "weight": 70}],
            "currentWeight": 70,
            "startingWeight": 75,
            "trend": "decreasing"
        }
        mock_meal_data = {
            "entries": [{"date": "2025-01-01", "type": "breakfast", "calories": 400}],
            "totalEntries": 1,
            "consistency": 70
        }
        
        progress_analysis = await crew_service.analyze_progress(
            user_id="test_user",
            workout_data=mock_workout_data,
            weight_data=mock_weight_data,
            meal_data=mock_meal_data,
            goals=["weight_loss"]
        )
        
        print("✅ Progress analysis generated successfully!")
        print(f"Analysis structure: {list(progress_analysis.keys())}")
        
        print("\n🎉 All tests passed! Gemini 2.0 Flash is working correctly with CrewAI.")
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    # Load environment variables
    load_dotenv()
    
    # Check if API key is set
    if not os.getenv("GOOGLE_API_KEY"):
        print("❌ GOOGLE_API_KEY environment variable not set!")
        print("Please add your Google AI API key to the .env file")
        sys.exit(1)
    
    # Run the test
    result = asyncio.run(test_gemini_integration())
    sys.exit(0 if result else 1)
