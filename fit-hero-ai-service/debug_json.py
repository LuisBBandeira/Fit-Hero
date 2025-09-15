#!/usr/bin/env python3
"""
Enhanced JSON debugging script for Fit Hero AI Service
This script will help identify and fix JSON parsing issues
"""

import json
import re
import sys
import requests
from datetime import datetime

def analyze_json_error(raw_content, label="Raw Content"):
    """Comprehensive JSON error analysis"""
    print(f"\n{'='*20} {label.upper()} ANALYSIS {'='*20}")
    
    if not raw_content:
        print("❌ No content to analyze")
        return None
    
    print(f"Content type: {type(raw_content)}")
    print(f"Content length: {len(raw_content) if hasattr(raw_content, '__len__') else 'N/A'}")
    
    if isinstance(raw_content, str):
        print(f"\nFirst 300 characters:")
        print(repr(raw_content[:300]))
        
        print(f"\nLast 300 characters:")
        print(repr(raw_content[-300:]))
        
        # Check for common JSON issues
        issues = []
        
        stripped = raw_content.strip()
        if not stripped.startswith('{') and not stripped.startswith('['):
            issues.append(f"❌ Does not start with {{ or [ (starts with: {repr(stripped[:10])})")
        
        if not stripped.endswith('}') and not stripped.endswith(']'):
            issues.append(f"❌ Does not end with }} or ] (ends with: {repr(stripped[-10:])})")
        
        if '```json' in raw_content:
            issues.append("❌ Contains markdown code blocks (```json)")
        
        if '```' in raw_content:
            issues.append("❌ Contains markdown code blocks (```)")
        
        # Check for unescaped characters
        unescaped_quotes = len(re.findall(r'(?<!\\\\)"', raw_content))
        if unescaped_quotes % 2 != 0:
            issues.append(f"❌ Odd number of unescaped quotes ({unescaped_quotes}) - potential unclosed strings")
        
        # Check for control characters
        control_chars = re.findall(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', raw_content)
        if control_chars:
            issues.append(f"❌ Contains {len(control_chars)} invalid control characters")
        
        print(f"\n🔍 Issues found: {len(issues)}")
        for i, issue in enumerate(issues, 1):
            print(f"  {i}. {issue}")
        
        if not issues:
            print("✅ No obvious structural issues detected")
        
        # Try to extract JSON
        print(f"\n🔧 Attempting JSON extraction and repair...")
        
        # Method 1: Direct parse
        try:
            parsed = json.loads(raw_content)
            print("✅ SUCCESS: Content is valid JSON as-is!")
            return parsed
        except json.JSONDecodeError as e:
            print(f"❌ Direct parse failed: {e}")
        
        # Method 2: Find JSON block
        json_match = re.search(r'(\{[\s\S]*\}|\[[\s\S]*\])', raw_content)
        if json_match:
            print("🔍 Found potential JSON block, attempting to parse...")
            try:
                extracted = json_match.group(1)
                parsed = json.loads(extracted)
                print("✅ SUCCESS: JSON extracted and parsed successfully!")
                print(f"Preview: {json.dumps(parsed, indent=2)[:500]}...")
                return parsed
            except json.JSONDecodeError as e:
                print(f"❌ Extracted JSON still invalid: {e}")
                print(f"Extracted content: {repr(extracted[:200])}")
        
        # Method 3: Try cleaning
        try:
            cleaned = clean_ai_json_response(raw_content)
            parsed = json.loads(cleaned)
            print("✅ SUCCESS: JSON cleaned and parsed successfully!")
            return parsed
        except json.JSONDecodeError as e:
            print(f"❌ Cleaned JSON still invalid: {e}")
            print(f"Cleaned content preview: {repr(cleaned[:200])}")
        
        # Method 4: Aggressive cleaning
        try:
            # Remove everything before first { or [
            start_match = re.search(r'[{\[]', raw_content)
            if start_match:
                content = raw_content[start_match.start():]
                
                # Remove everything after last } or ]
                content_reversed = content[::-1]
                end_match = re.search(r'[}\]]', content_reversed)
                if end_match:
                    content = content_reversed[end_match.start():][::-1]
                
                cleaned = clean_ai_json_response(content)
                parsed = json.loads(cleaned)
                print("✅ SUCCESS: Aggressively cleaned JSON parsed successfully!")
                return parsed
        except json.JSONDecodeError as e:
            print(f"❌ Aggressively cleaned JSON still invalid: {e}")
    
    print("❌ All JSON parsing attempts failed")
    return None

def clean_ai_json_response(json_text):
    """Clean AI-generated JSON response"""
    import re
    
    # Remove any leading/trailing whitespace
    json_text = json_text.strip()
    
    # Remove invalid control characters (except \n, \r, \t)
    json_text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', json_text)
    
    # Remove any trailing commas before closing brackets/braces
    json_text = re.sub(r',(\s*[}\]])', r'\1', json_text)
    
    # Fix unquoted property names (basic cases)
    json_text = re.sub(r'([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\1"\2":', json_text)
    
    # Fix single quotes to double quotes for strings
    json_text = re.sub(r":\s*'([^']*)'", r': "\1"', json_text)
    
    # Remove any comments
    json_text = re.sub(r'//.*?$', '', json_text, flags=re.MULTILINE)
    json_text = re.sub(r'/\*.*?\*/', '', json_text, flags=re.DOTALL)
    
    return json_text

def test_ai_service_json():
    """Test the AI service and analyze any JSON errors"""
    print("🚀 Testing AI Service JSON Parsing...")
    
    # Test data for meal plan generation
    test_payload = {
        "user_id": "test_user",
        "month": 9,
        "year": 2025,
        "dietary_preferences": ["vegetarian"],
        "allergies": [],
        "fitness_goals": ["weight_loss"],
        "activity_level": "moderate"
    }
    
    try:
        print(f"\n📤 Sending request to AI service...")
        response = requests.post(
            "http://localhost:8001/generate-monthly-meal-plan",
            json=test_payload,
            timeout=30
        )
        
        print(f"📥 Response status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                response_data = response.json()
                print("✅ Response JSON is valid!")
                
                # Check if there's a raw response to analyze
                if 'raw_response' in response_data:
                    analyze_json_error(response_data['raw_response'], "AI Raw Response")
                
                print(f"\n📋 Response structure:")
                print(json.dumps(response_data, indent=2, default=str)[:1000] + "...")
                
            except json.JSONDecodeError as e:
                print(f"❌ Response JSON decode error: {e}")
                print(f"Raw response text: {response.text[:1000]}...")
                analyze_json_error(response.text, "API Response")
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to AI service. Is it running on localhost:8001?")
    except Exception as e:
        print(f"❌ Error testing AI service: {e}")

def test_with_sample_data():
    """Test with some sample malformed JSON data"""
    print("\n🧪 Testing with sample malformed JSON data...")
    
    # Common AI response issues
    test_cases = [
        # Case 1: Markdown wrapped
        '''```json
{
  "daily_meals": {
    "1": {"breakfast": {"name": "Test", "calories": 400}}
  }
}
```''',
        
        # Case 2: Unquoted properties
        '''{
  daily_meals: {
    "1": {breakfast: {name: "Test", calories: 400}}
  }
}''',
        
        # Case 3: Trailing commas
        '''{
  "daily_meals": {
    "1": {
      "breakfast": {"name": "Test", "calories": 400,},
    },
  },
}''',
        
        # Case 4: Mixed quotes
        """{
  "daily_meals": {
    '1': {'breakfast': {"name": 'Test', "calories": 400}}
  }
}""",
        
        # Case 5: Control characters and extra text
        '''Here is your meal plan:

{
  "daily_meals": {
    "1": {"breakfast": {"name": "Test", "calories": 400}}
  }
}

This plan follows your dietary preferences.''',
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        result = analyze_json_error(test_case, f"Test Case {i}")
        if result:
            print(f"✅ Test case {i} successfully repaired!")
        else:
            print(f"❌ Test case {i} could not be repaired")
        print("-" * 60)

if __name__ == "__main__":
    print("🔧 Fit Hero JSON Debug Tool")
    print("=" * 50)
    
    # Test AI service
    test_ai_service_json()
    
    # Test with sample malformed data
    test_with_sample_data()
    
    print("\n✅ Analysis complete!")
