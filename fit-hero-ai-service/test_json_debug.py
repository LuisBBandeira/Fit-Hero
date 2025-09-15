#!/usr/bin/env python3
"""
Simple test to trigger JSON parsing in AI service
"""

import requests
import json
import time

def test_meal_plan_generation():
    """Test meal plan generation to trigger JSON parsing"""
    print("🍽️ Testing meal plan generation...")
    
    payload = {
        "user_id": "debug_test_user",
        "month": 9,
        "year": 2025,
        "dietary_preferences": ["vegetarian"],
        "allergies": [],
        "fitness_goals": ["weight_loss"],
        "activity_level": "moderate"
    }
    
    try:
        print("📤 Sending request...")
        response = requests.post(
            "http://localhost:8001/generate-monthly-meal-plan",
            json=payload,
            timeout=60  # Increased timeout
        )
        
        print(f"📥 Response status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print("✅ Response received successfully!")
                print(f"Response keys: {list(data.keys())}")
                
                if 'meal_plan' in data:
                    print("✅ Meal plan generated successfully!")
                else:
                    print("❌ No meal plan in response")
                    print(f"Response: {json.dumps(data, indent=2)}")
                    
            except json.JSONDecodeError as e:
                print(f"❌ Response JSON decode error: {e}")
                print(f"Raw response: {response.text[:1000]}...")
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out - AI service may be processing or stuck")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to AI service. Is it running on localhost:8001?")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_workout_plan_generation():
    """Test workout plan generation to trigger JSON parsing"""
    print("\n🏋️ Testing workout plan generation...")
    
    payload = {
        "user_id": "debug_test_user",
        "month": 9,
        "year": 2025,
        "fitness_goals": ["weight_loss", "muscle_building"],
        "fitness_level": "intermediate",
        "available_equipment": ["dumbbells", "resistance_bands"],
        "workout_frequency": 4,
        "session_duration": 45
    }
    
    try:
        print("📤 Sending request...")
        response = requests.post(
            "http://localhost:8001/generate-monthly-workout-plan",
            json=payload,
            timeout=60
        )
        
        print(f"📥 Response status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print("✅ Response received successfully!")
                print(f"Response keys: {list(data.keys())}")
                
                if 'workout_plan' in data:
                    print("✅ Workout plan generated successfully!")
                else:
                    print("❌ No workout plan in response")
                    print(f"Response: {json.dumps(data, indent=2)}")
                    
            except json.JSONDecodeError as e:
                print(f"❌ Response JSON decode error: {e}")
                print(f"Raw response: {response.text[:1000]}...")
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out - AI service may be processing or stuck")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to AI service. Is it running on localhost:8001?")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🔧 AI Service JSON Debug Test")
    print("=" * 40)
    
    # Test both endpoints
    test_meal_plan_generation()
    test_workout_plan_generation()
    
    print("\n✅ Test complete! Check AI service logs for detailed JSON parsing information.")
