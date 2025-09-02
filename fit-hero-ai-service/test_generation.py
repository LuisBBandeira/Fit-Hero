#!/usr/bin/env python3
"""
Test script for generating workout and meal plans
"""
import requests
import json

# Test workout plan generation
def test_workout_generation():
    url = "http://localhost:8001/generate-monthly-workout-plan"
    
    payload = {
        "user_id": "test_user_123",
        "month": 9,
        "year": 2025,
        "age": 28,
        "weight": 70.0,
        "fitness_level": "intermediate",
        "goals": ["muscle_gain"],
        "available_time": 45,
        "equipment": ["gym"],
        "injuries_limitations": None,
        "preferred_activities": ["weight_training"]
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    print("Testing workout plan generation...")
    print(f"Sending request to: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=120)
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Workout plan generation successful!")
            print(f"Generated plan for {result.get('metadata', {}).get('month')}/{result.get('metadata', {}).get('year')}")
            print(f"Days in month: {result.get('metadata', {}).get('days_in_month')}")
            
            # Check if we got a workout plan
            if 'validated_data' in result and result['validated_data']:
                print("✅ Validated data structure looks good!")
                print(f"Plan contains validated structure")
            else:
                print("⚠️ No validated data in response")
                
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"Error: {response.text}")
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out after 120 seconds")
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_workout_generation()
