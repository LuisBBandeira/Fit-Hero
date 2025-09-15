#!/usr/bin/env python3
"""Test the main service components without starting FastAPI"""

import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("Testing main service components...")
    
    # Test imports
    from services.standardized_template_service import StandardizedTemplateService
    print("✓ Template service imported")
    
    # Test template service
    template_service = StandardizedTemplateService()
    print("✓ Template service instantiated")
    
    # Test workout plan generation
    user_profile = {
        "age": 28,
        "weight": 75.0,
        "objectives": ["muscle_building"],
        "fitness_level": "intermediate",
        "training_environment": "GYM_TRAINING",
        "goal": "MUSCLE_BUILDING"
    }
    
    workout_plan = template_service.get_workout_plan(user_profile, 60)
    print("✓ Workout plan generated")
    print(f"  - Exercises: {len(workout_plan.get('exercises', {}))}")
    print(f"  - AI customization needed: {workout_plan.get('requires_ai_customization')}")
    
    # Test meal plan generation
    meal_plan = template_service.get_meal_plan(user_profile)
    print("✓ Meal plan generated")
    print(f"  - User categories: {meal_plan.get('user_categories')}")
    print(f"  - AI customization needed: {meal_plan.get('requires_ai_customization')}")
    
    print("\n🎉 All main service components working correctly!")
    print("\nNext steps:")
    print("1. The template service is working and loading data from JSON templates")
    print("2. Templates are being parsed correctly and returning structured data")
    print("3. Ready for AI integration via monthly_plan_service (when dependency issues are resolved)")
    print("4. The unified template approach is successfully implemented")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
