#!/usr/bin/env python3

"""
Simple test script to verify JSON cleaning functionality.
This script tests only the JSON cleaning methods without AI dependencies.
"""

import json
import re

def clean_ai_json_response(json_text: str) -> str:
    """
    Clean up common AI-generated JSON issues that cause parsing errors.
    """
    # Remove leading/trailing whitespace
    json_text = json_text.strip()
    
    # Remove trailing commas before closing brackets/braces
    json_text = re.sub(r',(\s*[}\]])', r'\1', json_text)
    
    # Fix unquoted property names (basic cases)
    json_text = re.sub(r'([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\1"\2":', json_text)
    
    # Fix single quotes to double quotes for strings (more careful approach)
    json_text = re.sub(r":\s*'([^']*)'", r': "\1"', json_text)
    
    # Remove comments
    json_text = re.sub(r'//.*?$', '', json_text, flags=re.MULTILINE)
    json_text = re.sub(r'/\*.*?\*/', '', json_text, flags=re.DOTALL)
    
    # Fix common issues with object properties that aren't quoted
    json_text = re.sub(r'([{,]\s*)([a-zA-Z_][a-zA-Z0-9_\-]*)\s*:', r'\1"\2":', json_text)
    
    return json_text

def robust_json_parse(json_text: str):
    """
    Try multiple approaches to parse potentially malformed JSON.
    """
    # First try: direct parse
    try:
        return json.loads(json_text)
    except json.JSONDecodeError:
        pass
    
    # Second try: clean and parse
    try:
        cleaned = clean_ai_json_response(json_text)
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass
    
    # Third try: more aggressive cleaning
    try:
        # Remove any text before the first { or [
        match = re.search(r'[{\[]', json_text)
        if match:
            json_text = json_text[match.start():]
        
        # Remove any text after the last } or ]
        json_text = json_text[::-1]  # reverse
        match = re.search(r'[}\]]', json_text)
        if match:
            json_text = json_text[match.start():]
        json_text = json_text[::-1]  # reverse back
        
        cleaned = clean_ai_json_response(json_text)
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass
    
    # If all else fails, raise the original error
    raise json.JSONDecodeError("Failed to parse JSON after multiple attempts", json_text, 0)

def test_json_cleaning():
    """Test the JSON cleaning functionality with common AI-generated issues."""
    
    # Test cases with common AI JSON issues
    test_cases = [
        # Case 1: Unquoted property names
        '''{
            monthly_overview: {
                "month": 12,
                "year": 2024
            },
            workout_days: 20
        }''',
        
        # Case 2: Trailing commas
        '''{
            "monthly_overview": {
                "month": 12,
                "year": 2024,
            },
            "workout_days": 20,
        }''',
        
        # Case 3: Single quotes
        '''{
            "monthly_overview": {
                "month": 12,
                "year": 2024
            },
            "workout_days": 20
        }''',
        
        # Case 4: Comments in JSON
        '''{
            "monthly_overview": {
                // This is a comment
                "month": 12,
                "year": 2024
            },
            "workout_days": 20 /* Another comment */
        }''',
        
        # Case 5: Mixed issues
        '''{
            monthly_overview: {
                "month": 12,
                year: 2024,
            },
            workout_days: 20,
            // Comment here
        }'''
    ]
    
    print("Testing JSON cleaning functionality...\n")
    
    for i, test_json in enumerate(test_cases, 1):
        print(f"Test Case {i}:")
        print(f"Original JSON: {test_json[:100]}...")
        
        try:
            # Try original parsing (should fail)
            json.loads(test_json)
            print("✓ Original parsing succeeded (unexpected)")
        except json.JSONDecodeError:
            print("✗ Original parsing failed (expected)")
        
        try:
            # Try cleaned parsing
            parsed = robust_json_parse(test_json)
            print("✓ Robust parsing succeeded")
            print(f"  Parsed keys: {list(parsed.keys())}")
        except Exception as e:
            print(f"✗ Robust parsing failed: {e}")
        
        print()

def test_specific_error_case():
    """Test a case similar to the reported error."""
    
    # Simulate the type of error that was reported
    problematic_json = '''
    {
        "monthly_overview": {
            "month": 12,
            "year": 2024,
            "total_days": 31,
            "workout_days": 20,
            "rest_days": 11
        },
        "daily_workouts": {
            "day_1": {
                name: "Upper Body Foundation",
                "type": "strength",
                "duration": 45,
                "exercises": [
                    {
                        "name": "Push-ups",
                        reps: "10-15",
                        "sets": 3
                    }
                ]
            }
        }
    }
    '''
    
    print("Testing specific error case...\n")
    print("Problematic JSON with unquoted property names:")
    
    try:
        parsed = robust_json_parse(problematic_json)
        print("✓ Successfully parsed problematic JSON")
        print(f"  Found daily workouts: {'daily_workouts' in parsed}")
        if 'daily_workouts' in parsed:
            print(f"  Day 1 exercise count: {len(parsed['daily_workouts']['day_1']['exercises'])}")
    except Exception as e:
        print(f"✗ Failed to parse: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("JSON Parsing Improvement Tests")
    print("=" * 60)
    print()
    
    test_json_cleaning()
    test_specific_error_case()
    
    print("=" * 60)
    print("All tests completed!")
    print("=" * 60)
