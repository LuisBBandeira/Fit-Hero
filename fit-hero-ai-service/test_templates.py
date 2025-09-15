#!/usr/bin/env python3
"""Test script for the template service"""

import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("Testing template service...")
    
    # Test template service import and instantiation
    from services.standardized_template_service import StandardizedTemplateService
    print("✓ Template service imported successfully")
    
    # Create service instance
    template_service = StandardizedTemplateService()
    print("✓ Template service instantiated successfully")
    
    # Test getting workout plan
    user_profile = {
        "age": 25,
        "weight": 70.0,
        "objectives": ["muscle_building", "strength"],
        "fitness_level": "intermediate",
        "training_environment": "GYM_TRAINING",
        "goal": "MUSCLE_BUILDING"
    }
    
    workout_plan = template_service.get_workout_plan(
        user_profile=user_profile,
        session_duration=60
    )
    print("✓ Workout plan generated successfully")
    print(f"  - Exercises available: {len(workout_plan.get('exercises', {}))}")
    print(f"  - Requires AI customization: {workout_plan.get('requires_ai_customization', False)}")
    
    # Test getting meal plan
    meal_plan = template_service.get_meal_plan(
        user_profile=user_profile
    )
    print("✓ Meal plan generated successfully")
    print(f"  - Nutrition guidelines available: {bool(meal_plan.get('nutrition_guidelines'))}")
    print(f"  - User categories: {meal_plan.get('user_categories', {})}")
    print(f"  - Requires AI customization: {meal_plan.get('requires_ai_customization', False)}")
    
    print("\n🎉 All template service tests completed successfully!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
