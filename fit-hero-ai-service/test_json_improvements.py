#!/usr/bin/env python3

"""
Test script to verify JSON parsing improvements in the AI service.
This script tests the robust JSON parsing methods.
"""

import json
import sys
import os

# Add the parent directory to the path to import the service
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.monthly_plan_service import MonthlyPlanService

def test_json_cleaning():
    """Test the JSON cleaning functionality with common AI-generated issues."""
    
    # Create an instance of the service
    service = MonthlyPlanService()
    
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
            'monthly_overview': {
                'month': 12,
                'year': 2024
            },
            'workout_days': 20
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
            'workout_days': 20,
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
            parsed = service._robust_json_parse(test_json)
            print("✓ Robust parsing succeeded")
            print(f"  Parsed keys: {list(parsed.keys())}")
        except Exception as e:
            print(f"✗ Robust parsing failed: {e}")
        
        print()

def test_malformed_json_recovery():
    """Test recovery from severely malformed JSON."""
    
    service = MonthlyPlanService()
    
    # Severely malformed JSON that might come from AI
    malformed_cases = [
        # JSON with extra text before and after
        '''
        Here's your workout plan:
        {
            "monthly_overview": {
                "month": 12,
                "year": 2024
            },
            "workout_days": 20
        }
        
        This plan is designed for your needs.
        ''',
        
        # JSON with markdown formatting
        '''```json
        {
            "monthly_overview": {
                "month": 12,
                "year": 2024
            },
            "workout_days": 20
        }
        ```''',
    ]
    
    print("Testing malformed JSON recovery...\n")
    
    for i, test_json in enumerate(malformed_cases, 1):
        print(f"Malformed Test Case {i}:")
        print(f"Content: {test_json[:100]}...")
        
        try:
            parsed = service._robust_json_parse(test_json)
            print("✓ Recovery succeeded")
            print(f"  Parsed keys: {list(parsed.keys())}")
        except Exception as e:
            print(f"✗ Recovery failed: {e}")
        
        print()

if __name__ == "__main__":
    print("=" * 60)
    print("AI Service JSON Parsing Improvement Tests")
    print("=" * 60)
    print()
    
    try:
        test_json_cleaning()
        test_malformed_json_recovery()
        
        print("=" * 60)
        print("All tests completed!")
        print("=" * 60)
        
    except Exception as e:
        print(f"Test execution failed: {e}")
        sys.exit(1)
