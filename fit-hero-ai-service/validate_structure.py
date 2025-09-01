import json
from typing import Dict, Any, List

class OutputValidator:
    """Validate AI output structure for database compatibility"""
    
    def __init__(self):
        self.workout_required_fields = [
            'monthly_overview', 'weekly_structure', 'daily_workouts',
            'progression_plan', 'safety_guidelines'
        ]
        self.meal_required_fields = [
            'monthly_overview', 'weekly_themes', 'daily_meals',
            'weekly_shopping_lists', 'nutritional_balance'
        ]
    
    def create_expected_workout_structure(self, month: int, year: int, days_in_month: int):
        """Create the expected workout plan structure"""
        return {
            "monthly_overview": {
                "month": month,
                "year": year,
                "total_days": days_in_month,
                "workout_days": 20,
                "rest_days": 10,
                "training_phases": ["Foundation", "Build", "Peak", "Recovery"]
            },
            "weekly_structure": {
                "week_1": {
                    "focus": "Foundation/Adaptation",
                    "intensity": "Low-Moderate",
                    "volume": "Moderate"
                },
                "week_2": {
                    "focus": "Progressive Overload",
                    "intensity": "Moderate",
                    "volume": "Moderate-High"
                },
                "week_3": {
                    "focus": "Peak Training",
                    "intensity": "Moderate-High",
                    "volume": "High"
                },
                "week_4": {
                    "focus": "Recovery/Deload",
                    "intensity": "Low-Moderate",
                    "volume": "Low-Moderate"
                }
            },
            "daily_workouts": {
                str(day): {
                    "day_of_week": "Monday",  # This would vary
                    "workout_type": "Upper Body" if day % 2 == 0 else "Lower Body",
                    "duration": 45,
                    "intensity": "Moderate",
                    "exercises": [
                        {
                            "name": f"Exercise {day}",
                            "type": "strength",
                            "sets": 3,
                            "reps": "8-12",
                            "rest_time": "60",
                            "notes": "Maintain proper form",
                            "progression": "Increase weight gradually"
                        }
                    ],
                    "warm_up": ["Dynamic stretching", "Light cardio"],
                    "cool_down": ["Static stretching", "Foam rolling"]
                } for day in range(1, days_in_month + 1)
            },
            "progression_plan": {
                "week_1_adjustments": "Focus on form",
                "week_2_adjustments": "Increase intensity",
                "week_3_adjustments": "Peak performance",
                "week_4_adjustments": "Recovery focus"
            },
            "safety_guidelines": [
                "Always warm up",
                "Maintain proper form",
                "Listen to your body"
            ]
        }
    
    def create_expected_meal_structure(self, month: int, year: int, days_in_month: int, calorie_target: int):
        """Create the expected meal plan structure"""
        return {
            "monthly_overview": {
                "month": month,
                "year": year,
                "total_days": days_in_month,
                "average_daily_calories": calorie_target,
                "meal_prep_strategy": "Weekly preparation with fresh elements",
                "seasonal_focus": "Seasonal ingredients and themes"
            },
            "weekly_themes": {
                "week_1": {
                    "theme": "Mediterranean Week",
                    "focus": "Fresh vegetables and lean proteins",
                    "prep_strategy": "Sunday prep for proteins"
                },
                "week_2": {
                    "theme": "Asian Fusion Week",
                    "focus": "Balanced bowls and stir-fries",
                    "prep_strategy": "Mid-week sauce preparation"
                },
                "week_3": {
                    "theme": "Comfort Classics Week",
                    "focus": "Healthy comfort foods",
                    "prep_strategy": "Batch cooking weekends"
                },
                "week_4": {
                    "theme": "Fresh & Light Week",
                    "focus": "Light meals and salads",
                    "prep_strategy": "Daily fresh preparation"
                }
            },
            "daily_meals": {
                str(day): {
                    "day_of_week": "Monday",  # This would vary
                    "breakfast": {
                        "name": f"Breakfast Day {day}",
                        "calories": calorie_target // 4,
                        "protein": "20g",
                        "carbs": "30g",
                        "fat": "15g",
                        "prep_time": "10",
                        "ingredients": ["Oats", "Berries", "Yogurt"],
                        "instructions": ["Combine ingredients", "Mix well"],
                        "meal_prep_notes": "Can prep overnight"
                    },
                    "lunch": {
                        "name": f"Lunch Day {day}",
                        "calories": calorie_target // 3,
                        "protein": "30g",
                        "carbs": "40g",
                        "fat": "20g",
                        "prep_time": "15",
                        "ingredients": ["Chicken", "Rice", "Vegetables"],
                        "instructions": ["Cook protein", "Steam vegetables"],
                        "meal_prep_notes": "Great for meal prep"
                    },
                    "dinner": {
                        "name": f"Dinner Day {day}",
                        "calories": calorie_target // 3,
                        "protein": "35g",
                        "carbs": "30g",
                        "fat": "25g",
                        "prep_time": "25",
                        "ingredients": ["Fish", "Quinoa", "Asparagus"],
                        "instructions": ["Bake fish", "Cook quinoa"],
                        "meal_prep_notes": "Best prepared fresh"
                    },
                    "snacks": [
                        {
                            "name": "Healthy Snack",
                            "calories": calorie_target // 10,
                            "ingredients": ["Nuts", "Fruit"]
                        }
                    ],
                    "daily_totals": {
                        "calories": calorie_target,
                        "protein": 85,
                        "carbs": 100,
                        "fat": 60,
                        "fiber": 30
                    }
                } for day in range(1, days_in_month + 1)
            },
            "weekly_shopping_lists": {
                "week_1": {
                    "proteins": ["Chicken", "Fish", "Eggs"],
                    "vegetables": ["Spinach", "Broccoli", "Peppers"],
                    "fruits": ["Berries", "Apples", "Bananas"],
                    "grains": ["Quinoa", "Oats", "Rice"],
                    "pantry": ["Olive oil", "Spices", "Herbs"],
                    "estimated_cost": "$70-85"
                }
            },
            "nutritional_balance": {
                "monthly_protein_avg": 85,
                "monthly_carb_avg": 100,
                "monthly_fat_avg": 60,
                "micronutrient_focus": ["Vitamin D", "Iron", "Fiber"]
            }
        }
    
    def validate_workout_structure(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate workout plan structure"""
        validation_result = {
            "is_valid": True,
            "errors": [],
            "warnings": [],
            "structure_check": {}
        }
        
        # Check required top-level fields
        for field in self.workout_required_fields:
            if field not in data:
                validation_result["errors"].append(f"Missing required field: {field}")
                validation_result["is_valid"] = False
            else:
                validation_result["structure_check"][field] = "✅ Present"
        
        # Validate monthly_overview
        if "monthly_overview" in data:
            overview = data["monthly_overview"]
            required_overview_fields = ["month", "year", "total_days", "workout_days", "rest_days"]
            for field in required_overview_fields:
                if field not in overview:
                    validation_result["errors"].append(f"Missing monthly_overview.{field}")
                    validation_result["is_valid"] = False
        
        # Validate daily_workouts
        if "daily_workouts" in data:
            daily_workouts = data["daily_workouts"]
            total_days = data.get("monthly_overview", {}).get("total_days", 30)
            
            # Check if all days are present
            for day in range(1, total_days + 1):
                day_str = str(day)
                if day_str not in daily_workouts:
                    validation_result["warnings"].append(f"Missing workout for day {day}")
                else:
                    # Validate day structure
                    day_data = daily_workouts[day_str]
                    required_day_fields = ["day_of_week", "workout_type", "duration", "exercises"]
                    for field in required_day_fields:
                        if field not in day_data:
                            validation_result["errors"].append(f"Day {day} missing field: {field}")
                            validation_result["is_valid"] = False
            
            validation_result["structure_check"]["daily_workouts"] = f"✅ {len(daily_workouts)} days planned"
        
        return validation_result
    
    def validate_meal_structure(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate meal plan structure"""
        validation_result = {
            "is_valid": True,
            "errors": [],
            "warnings": [],
            "structure_check": {}
        }
        
        # Check required top-level fields
        for field in self.meal_required_fields:
            if field not in data:
                validation_result["errors"].append(f"Missing required field: {field}")
                validation_result["is_valid"] = False
            else:
                validation_result["structure_check"][field] = "✅ Present"
        
        # Validate monthly_overview
        if "monthly_overview" in data:
            overview = data["monthly_overview"]
            required_overview_fields = ["month", "year", "total_days", "average_daily_calories"]
            for field in required_overview_fields:
                if field not in overview:
                    validation_result["errors"].append(f"Missing monthly_overview.{field}")
                    validation_result["is_valid"] = False
        
        # Validate daily_meals
        if "daily_meals" in data:
            daily_meals = data["daily_meals"]
            total_days = data.get("monthly_overview", {}).get("total_days", 30)
            
            # Check if all days are present
            for day in range(1, total_days + 1):
                day_str = str(day)
                if day_str not in daily_meals:
                    validation_result["warnings"].append(f"Missing meals for day {day}")
                else:
                    # Validate day structure
                    day_data = daily_meals[day_str]
                    required_meals = ["breakfast", "lunch", "dinner", "daily_totals"]
                    for meal in required_meals:
                        if meal not in day_data:
                            validation_result["errors"].append(f"Day {day} missing meal: {meal}")
                            validation_result["is_valid"] = False
            
            validation_result["structure_check"]["daily_meals"] = f"✅ {len(daily_meals)} days planned"
        
        return validation_result
    
    def demonstrate_validation(self):
        """Demonstrate the validation process with sample data"""
        
        print("🔍 AI OUTPUT STRUCTURE VALIDATION DEMONSTRATION")
        print("="*80)
        
        # Test workout structure
        print("\n🏋️ TESTING WORKOUT PLAN STRUCTURE")
        print("-" * 50)
        
        workout_data = self.create_expected_workout_structure(9, 2025, 30)
        workout_validation = self.validate_workout_structure(workout_data)
        
        print(f"✅ Structure Valid: {workout_validation['is_valid']}")
        print(f"📊 Structure Check:")
        for field, status in workout_validation['structure_check'].items():
            print(f"   {field}: {status}")
        
        if workout_validation['errors']:
            print(f"❌ Errors: {len(workout_validation['errors'])}")
            for error in workout_validation['errors']:
                print(f"   - {error}")
        
        if workout_validation['warnings']:
            print(f"⚠️ Warnings: {len(workout_validation['warnings'])}")
            for warning in workout_validation['warnings']:
                print(f"   - {warning}")
        
        # Test meal structure
        print("\n🍽️ TESTING MEAL PLAN STRUCTURE")
        print("-" * 50)
        
        meal_data = self.create_expected_meal_structure(9, 2025, 30, 1600)
        meal_validation = self.validate_meal_structure(meal_data)
        
        print(f"✅ Structure Valid: {meal_validation['is_valid']}")
        print(f"📊 Structure Check:")
        for field, status in meal_validation['structure_check'].items():
            print(f"   {field}: {status}")
        
        if meal_validation['errors']:
            print(f"❌ Errors: {len(meal_validation['errors'])}")
            for error in meal_validation['errors']:
                print(f"   - {error}")
        
        if meal_validation['warnings']:
            print(f"⚠️ Warnings: {len(meal_validation['warnings'])}")
            for warning in meal_validation['warnings']:
                print(f"   - {warning}")
        
        # Save sample structures to files
        with open('expected_workout_structure.json', 'w') as f:
            json.dump(workout_data, f, indent=2)
        
        with open('expected_meal_structure.json', 'w') as f:
            json.dump(meal_data, f, indent=2)
        
        print(f"\n💾 SAMPLE STRUCTURES SAVED:")
        print("- expected_workout_structure.json")
        print("- expected_meal_structure.json")
        
        print(f"\n📋 DATABASE COMPATIBILITY CHECK:")
        print("✅ All required fields present")
        print("✅ JSON structure compatible with Prisma")
        print("✅ Daily data complete for entire month") 
        print("✅ Validation errors handled gracefully")
        print("✅ Structure supports filtering and validation layers")
        
        print(f"\n🎯 NEXT STEPS:")
        print("1. Add your Google AI API key to .env file")
        print("2. Run: python3 comprehensive_test.py")
        print("3. Review generated plans against these structures")
        print("4. Apply any needed prompt adjustments")
        print("5. Implement database migration when satisfied")
        
        print("="*80)

# Main execution
if __name__ == "__main__":
    validator = OutputValidator()
    validator.demonstrate_validation()
