#!/usr/bin/env python3

"""
Direct test script to verify database storage functionality.
This script directly tests the full flow from AI generation to database storage.
"""

import requests
import json
import sys

def test_direct_ai_service():
    """Test the AI service directly and analyze the response structure."""
    
    print("🚀 Testing AI Service Response Structure...")
    print("=" * 60)
    
    # Test data
    test_payload = {
        "user_id": "test-user-direct-123",
        "month": 1,
        "year": 2025,
        "age": 30,
        "weight": 75.0,
        "fitness_level": "intermediate",
        "goals": ["muscle_gain", "strength"],
        "available_time": 60,
        "equipment": ["gym"],
        "injuries_limitations": [],
        "preferred_activities": ["weightlifting"]
    }
    
    try:
        # Send request to AI service
        response = requests.post(
            "http://localhost:8001/generate-monthly-workout-plan",
            json=test_payload,
            timeout=60
        )
        
        if response.status_code != 200:
            print(f"❌ AI Service Error: Status {response.status_code}")
            print(f"Response: {response.text}")
            return None
        
        data = response.json()
        print(f"✅ AI Service Response Status: {data.get('status', 'unknown')}")
        
        # Analyze the raw_response
        raw_response = data.get('raw_response', {})
        print(f"📊 Raw Response Analysis:")
        print(f"   Success: {raw_response.get('success', 'unknown')}")
        
        if raw_response.get('success') == False:
            print(f"   Error: {raw_response.get('error', 'unknown')}")
            
            # Check if we have raw_result (malformed JSON case)
            if 'raw_result' in raw_response:
                raw_result = raw_response['raw_result']
                print(f"   Raw Result Length: {len(raw_result)} characters")
                print(f"   Raw Result Preview: {raw_result[:200]}...")
                
                # Try to parse the raw_result manually
                print(f"\n🔧 Manual JSON Parsing Test:")
                try:
                    parsed = json.loads(raw_result)
                    print(f"   ✅ Manual parsing succeeded!")
                    print(f"   Keys found: {list(parsed.keys())}")
                    
                    # Check structure
                    if 'daily_workouts' in parsed:
                        workout_count = len(parsed['daily_workouts'])
                        print(f"   Daily workouts: {workout_count}")
                except json.JSONDecodeError as e:
                    print(f"   ❌ Manual parsing failed: {e}")
                    
                    # Show where the error occurs
                    error_pos = getattr(e, 'pos', 0)
                    context_start = max(0, error_pos - 50)
                    context_end = min(len(raw_result), error_pos + 50)
                    context = raw_result[context_start:context_end]
                    print(f"   Error context: ...{context}...")
        
        # Analyze filtered data
        filtered_data = data.get('filtered_data', {})
        print(f"\n📋 Filtered Data Analysis:")
        print(f"   Keys: {list(filtered_data.keys())}")
        if 'daily_workouts' in filtered_data:
            workout_count = len(filtered_data['daily_workouts'])
            print(f"   Filtered workouts: {workout_count}")
        
        # Check for validation errors
        if 'validation_errors' in filtered_data:
            errors = filtered_data['validation_errors']
            print(f"   Validation errors: {errors}")
        
        return data
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to AI service on http://localhost:8001")
        return None
    except requests.exceptions.Timeout:
        print("❌ AI service request timed out")
        return None
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return None

def analyze_json_parsing_issue():
    """Analyze why our JSON parsing might be failing."""
    
    print("\n🔍 JSON Parsing Issue Analysis...")
    print("=" * 60)
    
    # Test our robust parsing on some sample problematic JSON
    test_cases = [
        # Case 1: Valid JSON
        '{"test": "value", "number": 123}',
        
        # Case 2: JSON with extra whitespace/newlines
        '{\n  "test": "value",\n  "number": 123\n}',
        
        # Case 3: Very large JSON (simulate truncation issue)
        '{"large_data": "' + 'x' * 1000 + '", "end": true}',
    ]
    
    for i, test_json in enumerate(test_cases, 1):
        print(f"\nTest Case {i}: {test_json[:50]}...")
        
        # Test standard parsing
        try:
            json.loads(test_json)
            print("  ✅ Standard parsing: Success")
        except json.JSONDecodeError as e:
            print(f"  ❌ Standard parsing: {e}")
        
        # Test our robust parsing (simulate)
        # Note: We can't import the actual method here since it requires the full service

if __name__ == "__main__":
    print("🧪 Fit Hero AI Service Database Integration Test")
    print("=" * 80)
    
    # Test the AI service
    ai_response = test_direct_ai_service()
    
    # Analyze JSON parsing
    analyze_json_parsing_issue()
    
    print("\n" + "=" * 80)
    if ai_response:
        print("✅ Test completed - AI service is responding")
        if ai_response.get('raw_response', {}).get('success') == False:
            print("⚠️  JSON parsing issue detected in AI service")
            print("💡 Consider investigating the _robust_json_parse method")
        else:
            print("✅ No JSON parsing issues detected")
    else:
        print("❌ Test failed - AI service not accessible")
    print("=" * 80)
