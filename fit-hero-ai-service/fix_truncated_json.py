#!/usr/bin/env python3
"""
Script to debug and fix JSON truncation issues in AI responses
"""

import json
import re
import logging

def analyze_truncated_json(json_text):
    """Analyze and attempt to fix truncated JSON"""
    print("🔍 ANALYZING TRUNCATED JSON")
    print(f"Content length: {len(json_text)}")
    
    # Check if it ends abruptly
    last_100 = json_text[-100:]
    print(f"Last 100 characters: {repr(last_100)}")
    
    # Common truncation patterns
    truncation_patterns = [
        r'",\s*$',  # Ends with quote and comma
        r'"\s*$',   # Ends with quote
        r',\s*$',   # Ends with comma
        r':\s*$',   # Ends with colon
        r'\[\s*$',  # Ends with opening bracket
        r'{\s*$',   # Ends with opening brace
    ]
    
    is_truncated = False
    for pattern in truncation_patterns:
        if re.search(pattern, json_text):
            print(f"✅ Detected truncation pattern: {pattern}")
            is_truncated = True
            break
    
    if not is_truncated:
        # Check for incomplete structure
        open_braces = json_text.count('{')
        close_braces = json_text.count('}')
        open_brackets = json_text.count('[')
        close_brackets = json_text.count(']')
        
        print(f"Braces: {open_braces} open, {close_braces} close (diff: {open_braces - close_braces})")
        print(f"Brackets: {open_brackets} open, {close_brackets} close (diff: {open_brackets - close_brackets})")
        
        if open_braces != close_braces or open_brackets != close_brackets:
            is_truncated = True
            print("✅ Detected unmatched braces/brackets indicating truncation")
    
    return is_truncated

def fix_truncated_json(json_text):
    """Attempt to fix truncated JSON by properly closing structures"""
    print("\n🔧 ATTEMPTING TO FIX TRUNCATED JSON")
    
    # Remove trailing incomplete elements
    # Pattern 1: Remove trailing comma and incomplete content
    json_text = re.sub(r',\s*"[^"]*$', '', json_text)
    json_text = re.sub(r',\s*$', '', json_text)
    
    # Pattern 2: Remove incomplete key-value pairs
    json_text = re.sub(r'"[^"]*":\s*$', '', json_text)
    json_text = re.sub(r'"[^"]*$', '', json_text)
    
    # Pattern 3: Remove incomplete arrays/objects
    json_text = re.sub(r',\s*\[\s*$', '', json_text)
    json_text = re.sub(r',\s*{\s*$', '', json_text)
    
    # Now try to balance braces and brackets
    open_braces = json_text.count('{')
    close_braces = json_text.count('}')
    open_brackets = json_text.count('[')
    close_brackets = json_text.count(']')
    
    # Add missing closing braces
    missing_braces = open_braces - close_braces
    if missing_braces > 0:
        print(f"Adding {missing_braces} missing closing braces")
        json_text += '}' * missing_braces
    
    # Add missing closing brackets
    missing_brackets = open_brackets - close_brackets
    if missing_brackets > 0:
        print(f"Adding {missing_brackets} missing closing brackets")
        json_text += ']' * missing_brackets
    
    return json_text

def test_json_fix():
    """Test the JSON fixing with the actual truncated content from logs"""
    
    # Simulate the truncated content based on the logs
    truncated_json = '''{
  "monthly_overview": {
    "month": 9,
    "year": 2025,
    "total_days": 30,
    "nutrition_targets": {
      "daily_calories": "2000",
      "protein_grams": "75",
      "carbs_grams": "250",
      "fat_grams": "70"
    },
    "meal_themes": [
      "Mediterranean Vegetarian",
      "Indian Vegetarian", 
      "Asian Vegetarian",
      "Seasonal Harvest"
    ]
  },
  "weekly_meal_prep": {
    "week_1": {
      "prep_focus": "Basic meal prep introduction",
      "batch_cook_items": [
        "Quinoa",
        "Roasted Vegetables"
      ],
      "shopping_list": [
        "Quinoa",
        "Broccoli",
        "Bell Peppers",
        "Onions",
        "Olive Oil",
        "Spices"
      ]
    },
    "week_2": {
      "prep_focus": "Protein prep and snack planning", 
      "batch_cook_items": [
        "Lentil Soup",
        "Hard-boiled Eggs"
      ],
      "shopping_list": [
        "Lentils",
        "Carrots",
        "Celery",
        "Onions",
        "Eggs",
        "Yogurt",'''
    
    print("🧪 TESTING JSON FIX WITH SAMPLE TRUNCATED DATA")
    print("=" * 60)
    
    # Analyze
    is_truncated = analyze_truncated_json(truncated_json)
    
    if is_truncated:
        # Fix
        fixed_json = fix_truncated_json(truncated_json)
        
        print(f"\n📝 FIXED JSON (length: {len(fixed_json)}):")
        print("Last 200 characters:", repr(fixed_json[-200:]))
        
        # Test if it parses
        try:
            parsed = json.loads(fixed_json)
            print("✅ SUCCESS: Fixed JSON parses correctly!")
            print("Parsed structure preview:")
            print(json.dumps(parsed, indent=2)[:500] + "...")
            return True
        except json.JSONDecodeError as e:
            print(f"❌ FAILED: Fixed JSON still invalid: {e}")
            return False
    else:
        print("No truncation detected")
        return True

def create_enhanced_json_fixer():
    """Create an enhanced version of the JSON parsing function"""
    
    enhanced_code = '''
def _fix_truncated_json(self, json_text: str):
    """
    Fix JSON that was truncated during AI generation
    """
    import re
    import logging
    
    logger = logging.getLogger(__name__)
    
    # Remove trailing incomplete elements
    original_length = len(json_text)
    
    # Pattern 1: Remove trailing comma and incomplete content after it
    json_text = re.sub(r',\\s*"[^"]*$', '', json_text)
    json_text = re.sub(r',\\s*$', '', json_text)
    
    # Pattern 2: Remove incomplete key-value pairs
    json_text = re.sub(r'"[^"]*":\\s*$', '', json_text)
    json_text = re.sub(r'"[^"]*$', '', json_text)
    
    # Pattern 3: Remove incomplete arrays/objects
    json_text = re.sub(r',\\s*\\[\\s*$', '', json_text)
    json_text = re.sub(r',\\s*{\\s*$', '', json_text)
    
    # Pattern 4: Remove incomplete string values
    json_text = re.sub(r':\\s*"[^"]*$', ':"TRUNCATED_VALUE"', json_text)
    
    # Now balance braces and brackets
    open_braces = json_text.count('{')
    close_braces = json_text.count('}')
    open_brackets = json_text.count('[')
    close_brackets = json_text.count(']')
    
    # Add missing closing braces
    missing_braces = open_braces - close_braces
    if missing_braces > 0:
        logger.info(f"🔧 Adding {missing_braces} missing closing braces")
        json_text += '}' * missing_braces
    
    # Add missing closing brackets  
    missing_brackets = open_brackets - close_brackets
    if missing_brackets > 0:
        logger.info(f"🔧 Adding {missing_brackets} missing closing brackets")
        json_text += ']' * missing_brackets
    
    # Remove extra closing braces/brackets
    if missing_braces < 0:
        logger.info(f"🔧 Removing {abs(missing_braces)} extra closing braces")
        for _ in range(abs(missing_braces)):
            json_text = json_text.rsplit('}', 1)[0]
    
    if missing_brackets < 0:
        logger.info(f"🔧 Removing {abs(missing_brackets)} extra closing brackets")
        for _ in range(abs(missing_brackets)):
            json_text = json_text.rsplit(']', 1)[0]
    
    if len(json_text) != original_length:
        logger.info(f"🔧 JSON truncation fix: {original_length} -> {len(json_text)} chars")
    
    return json_text
'''
    
    print("📝 ENHANCED JSON FIXER CODE:")
    print(enhanced_code)
    
    return enhanced_code

if __name__ == "__main__":
    print("🔧 JSON Truncation Debug and Fix Tool")
    print("=" * 50)
    
    # Test with sample data
    success = test_json_fix()
    
    if success:
        print("\n✅ JSON fixing appears to work!")
        print("\n" + "=" * 50)
        create_enhanced_json_fixer()
    else:
        print("\n❌ JSON fixing needs more work")
