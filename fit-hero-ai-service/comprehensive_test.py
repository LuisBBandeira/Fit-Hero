import asyncio
import json
import sys
import os
from datetime import datetime
import calendar

# Add the services directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'services'))

from simple_ai_service import SimpleAIService

class PlayerProfileTester:
    def __init__(self):
        self.ai_service = SimpleAIService()
    
    def create_test_player_profiles(self):
        """Create diverse test player profiles to test AI generation"""
        return [
            {
                "profile_name": "Beginner Weight Loss Female",
                "player_data": {
                    "id": "test_player_1",
                    "name": "Sarah Johnson",
                    "age": 28,
                    "height": 165.0,  # cm
                    "weight": 78.0,   # kg
                    "character": "FITNESS_WARRIOR",
                    "objective": "LOSE_WEIGHT",
                    "training_environment": "GYM_TRAINING",
                    "dietary_restrictions": ["VEGETARIAN"],
                    "forbidden_foods": ["shellfish", "nuts"],
                    "level": 1,
                    "experience": 150,
                    "created_at": "2024-08-01",
                    "goal_weight": 65.0,
                    "activity_level": "sedentary",
                    "medical_conditions": [],
                    "previous_injuries": ["lower_back_strain"],
                    "preferred_workout_times": ["morning"],
                    "available_days": ["monday", "wednesday", "friday", "saturday"],
                    "session_duration_preference": 45,  # minutes
                    "intensity_preference": "moderate",
                    "equipment_access": ["dumbbells", "treadmill", "resistance_bands", "yoga_mat"],
                    "fitness_goals": ["weight_loss", "improved_endurance", "better_sleep"],
                    "meal_prep_time": 30,  # minutes per day
                    "cooking_skill": "intermediate",
                    "budget_range": "medium",
                    "family_size": 2,
                    "work_schedule": "office_9_to_5"
                }
            },
            {
                "profile_name": "Advanced Muscle Building Male",
                "player_data": {
                    "id": "test_player_2", 
                    "name": "Marcus Rodriguez",
                    "age": 32,
                    "height": 180.0,  # cm
                    "weight": 85.0,   # kg
                    "character": "AGILITY_NINJA",
                    "objective": "BUILD_MUSCLE",
                    "training_environment": "GYM_TRAINING",
                    "dietary_restrictions": ["LOW_CARB"],
                    "forbidden_foods": ["dairy"],
                    "level": 8,
                    "experience": 2450,
                    "created_at": "2023-12-15",
                    "goal_weight": 92.0,
                    "activity_level": "very_active",
                    "medical_conditions": [],
                    "previous_injuries": [],
                    "preferred_workout_times": ["evening"],
                    "available_days": ["monday", "tuesday", "thursday", "friday", "saturday", "sunday"],
                    "session_duration_preference": 75,  # minutes
                    "intensity_preference": "high",
                    "equipment_access": ["full_gym", "barbells", "dumbbells", "cables", "machines"],
                    "fitness_goals": ["muscle_gain", "strength_increase", "body_composition"],
                    "meal_prep_time": 60,  # minutes per day
                    "cooking_skill": "advanced",
                    "budget_range": "high",
                    "family_size": 1,
                    "work_schedule": "flexible"
                }
            },
            {
                "profile_name": "Senior Cardio Focus",
                "player_data": {
                    "id": "test_player_3",
                    "name": "Linda Chen",
                    "age": 58,
                    "height": 158.0,  # cm
                    "weight": 68.0,   # kg
                    "character": "VITALITY_GUARDIAN",
                    "objective": "IMPROVE_CARDIO", 
                    "training_environment": "HOME_TRAINING",
                    "dietary_restrictions": ["GLUTEN_FREE", "DAIRY_FREE"],
                    "forbidden_foods": ["spicy_foods"],
                    "level": 3,
                    "experience": 680,
                    "created_at": "2024-06-20",
                    "goal_weight": 65.0,
                    "activity_level": "lightly_active",
                    "medical_conditions": ["hypertension", "arthritis"],
                    "previous_injuries": ["knee_replacement"],
                    "preferred_workout_times": ["morning"],
                    "available_days": ["monday", "wednesday", "friday"],
                    "session_duration_preference": 30,  # minutes
                    "intensity_preference": "low_to_moderate",
                    "equipment_access": ["resistance_bands", "yoga_mat", "light_dumbbells"],
                    "fitness_goals": ["cardiovascular_health", "joint_mobility", "balance"],
                    "meal_prep_time": 45,  # minutes per day
                    "cooking_skill": "expert",
                    "budget_range": "medium",
                    "family_size": 2,
                    "work_schedule": "retired"
                }
            },
            {
                "profile_name": "Young Athletic General Fitness",
                "player_data": {
                    "id": "test_player_4",
                    "name": "Alex Thompson",
                    "age": 22,
                    "height": 175.0,  # cm
                    "weight": 70.0,   # kg
                    "character": "CARDIO_RUNNER",
                    "objective": "GENERAL_FITNESS",
                    "training_environment": "HOME_TRAINING",
                    "dietary_restrictions": ["VEGAN"],
                    "forbidden_foods": [],
                    "level": 5,
                    "experience": 1200,
                    "created_at": "2024-03-10",
                    "goal_weight": 72.0,
                    "activity_level": "active",
                    "medical_conditions": [],
                    "previous_injuries": ["ankle_sprain"],
                    "preferred_workout_times": ["afternoon", "evening"],
                    "available_days": ["tuesday", "thursday", "saturday", "sunday"],
                    "session_duration_preference": 60,  # minutes
                    "intensity_preference": "moderate_to_high",
                    "equipment_access": ["bodyweight", "resistance_bands", "pull_up_bar"],
                    "fitness_goals": ["overall_fitness", "endurance", "functional_strength"],
                    "meal_prep_time": 20,  # minutes per day
                    "cooking_skill": "beginner",
                    "budget_range": "low",
                    "family_size": 1,
                    "work_schedule": "student"
                }
            }
        ]
    
    async def test_monthly_workout_plan_generation(self, player_profile):
        """Test monthly workout plan generation with comprehensive player data"""
        
        print(f"\n{'='*80}")
        print(f"TESTING MONTHLY WORKOUT PLAN FOR: {player_profile['profile_name']}")
        print(f"{'='*80}")
        
        # Current month for testing
        current_date = datetime.now()
        month = current_date.month
        year = current_date.year
        month_name = calendar.month_name[month]
        
        player_data = player_profile['player_data']
        
        print(f"\nPlayer Profile Summary:")
        print(f"  Name: {player_data['name']}")
        print(f"  Age: {player_data['age']} years")
        print(f"  Height: {player_data['height']} cm")
        print(f"  Weight: {player_data['weight']} kg")
        print(f"  Character: {player_data['character']}")
        print(f"  Objective: {player_data['objective']}")
        print(f"  Training Environment: {player_data['training_environment']}")
        print(f"  Dietary Restrictions: {player_data['dietary_restrictions']}")
        print(f"  Available Equipment: {player_data['equipment_access']}")
        print(f"  Session Duration: {player_data['session_duration_preference']} minutes")
        print(f"  Intensity Preference: {player_data['intensity_preference']}")
        print(f"  Medical Conditions: {player_data['medical_conditions']}")
        print(f"  Previous Injuries: {player_data['previous_injuries']}")
        
        # Prepare comprehensive workout request
        workout_request = {
            "user_id": player_data['id'],
            "month": month,
            "year": year,
            "player_profile": {
                "personal_info": {
                    "name": player_data['name'],
                    "age": player_data['age'],
                    "height_cm": player_data['height'],
                    "weight_kg": player_data['weight'],
                    "goal_weight_kg": player_data.get('goal_weight'),
                    "activity_level": player_data.get('activity_level', 'moderate')
                },
                "fitness_profile": {
                    "character_type": player_data['character'],
                    "primary_objective": player_data['objective'],
                    "current_level": player_data['level'],
                    "experience_points": player_data['experience'],
                    "fitness_goals": player_data.get('fitness_goals', []),
                    "training_environment": player_data['training_environment']
                },
                "preferences": {
                    "session_duration_minutes": player_data['session_duration_preference'],
                    "intensity_preference": player_data['intensity_preference'],
                    "preferred_workout_times": player_data.get('preferred_workout_times', []),
                    "available_days": player_data.get('available_days', []),
                    "equipment_access": player_data['equipment_access']
                },
                "health_considerations": {
                    "medical_conditions": player_data.get('medical_conditions', []),
                    "previous_injuries": player_data.get('previous_injuries', []),
                    "injuries_limitations": player_data.get('previous_injuries', [])
                },
                "lifestyle": {
                    "work_schedule": player_data.get('work_schedule', 'standard'),
                    "family_size": player_data.get('family_size', 1),
                    "stress_level": player_data.get('stress_level', 'moderate')
                }
            }
        }
        
        print(f"\nGenerating Monthly Workout Plan for {month_name} {year}...")
        print(f"Days in month: {calendar.monthrange(year, month)[1]}")
        
        try:
            # Generate workout plan
            workout_plan = await self.ai_service.generate_monthly_workout_plan(workout_request)
            
            print(f"\n✅ WORKOUT PLAN GENERATION SUCCESSFUL!")
            print(f"\nWorkout Plan Structure:")
            
            # Log the structure without overwhelming detail
            if 'monthly_overview' in workout_plan:
                overview = workout_plan['monthly_overview']
                print(f"  📊 Monthly Overview:")
                print(f"     - Total Days: {overview.get('total_days')}")
                print(f"     - Workout Days: {overview.get('workout_days')}")
                print(f"     - Rest Days: {overview.get('rest_days')}")
                print(f"     - Training Phases: {overview.get('training_phases')}")
            
            if 'weekly_structure' in workout_plan:
                print(f"  📅 Weekly Structure:")
                for week, structure in workout_plan['weekly_structure'].items():
                    print(f"     - {week}: {structure.get('focus')} (Intensity: {structure.get('intensity')})")
            
            if 'daily_workouts' in workout_plan:
                daily_workouts = workout_plan['daily_workouts']
                print(f"  🏋️ Daily Workouts: {len(daily_workouts)} days planned")
                
                # Show first few days as examples
                for day_num in list(daily_workouts.keys())[:3]:
                    day_data = daily_workouts[day_num]
                    print(f"     - Day {day_num} ({day_data.get('day_of_week')}): {day_data.get('workout_type')} - {len(day_data.get('exercises', []))} exercises")
            
            # Save full plan to file for detailed analysis
            filename = f"workout_plan_{player_data['name'].replace(' ', '_')}_{month}_{year}.json"
            with open(filename, 'w') as f:
                json.dump(workout_plan, f, indent=2, default=str)
            print(f"\n💾 Full workout plan saved to: {filename}")
            
            return workout_plan
            
        except Exception as e:
            print(f"\n❌ WORKOUT PLAN GENERATION FAILED!")
            print(f"Error: {str(e)}")
            return None
    
    async def test_monthly_meal_plan_generation(self, player_profile):
        """Test monthly meal plan generation with comprehensive player data"""
        
        print(f"\n{'='*80}")
        print(f"TESTING MONTHLY MEAL PLAN FOR: {player_profile['profile_name']}")
        print(f"{'='*80}")
        
        # Current month for testing
        current_date = datetime.now()
        month = current_date.month
        year = current_date.year
        month_name = calendar.month_name[month]
        
        player_data = player_profile['player_data']
        
        print(f"\nNutrition Profile Summary:")
        print(f"  Name: {player_data['name']}")
        print(f"  Age: {player_data['age']} years")
        print(f"  Weight: {player_data['weight']} kg")
        print(f"  Goal Weight: {player_data.get('goal_weight', 'Not specified')} kg")
        print(f"  Dietary Restrictions: {player_data['dietary_restrictions']}")
        print(f"  Forbidden Foods: {player_data['forbidden_foods']}")
        print(f"  Meal Prep Time: {player_data.get('meal_prep_time', 30)} minutes/day")
        print(f"  Cooking Skill: {player_data.get('cooking_skill', 'intermediate')}")
        print(f"  Budget Range: {player_data.get('budget_range', 'medium')}")
        print(f"  Family Size: {player_data.get('family_size', 1)}")
        
        # Calculate calorie target based on player data
        calorie_target = self.calculate_calorie_target(player_data)
        
        # Prepare comprehensive meal request
        meal_request = {
            "user_id": player_data['id'],
            "month": month,
            "year": year,
            "player_profile": {
                "personal_info": {
                    "name": player_data['name'],
                    "age": player_data['age'],
                    "height_cm": player_data['height'],
                    "weight_kg": player_data['weight'],
                    "goal_weight_kg": player_data.get('goal_weight'),
                    "activity_level": player_data.get('activity_level', 'moderate')
                },
                "nutrition_profile": {
                    "primary_objective": player_data['objective'],
                    "dietary_restrictions": player_data['dietary_restrictions'],
                    "forbidden_foods": player_data['forbidden_foods'],
                    "calorie_target": calorie_target,
                    "macro_preferences": self.get_macro_preferences(player_data)
                },
                "lifestyle": {
                    "meal_prep_time_minutes": player_data.get('meal_prep_time', 30),
                    "cooking_skill": player_data.get('cooking_skill', 'intermediate'),
                    "budget_range": player_data.get('budget_range', 'medium'),
                    "family_size": player_data.get('family_size', 1),
                    "work_schedule": player_data.get('work_schedule', 'standard')
                },
                "health_considerations": {
                    "medical_conditions": player_data.get('medical_conditions', []),
                    "supplements": player_data.get('supplements', [])
                }
            }
        }
        
        print(f"\nGenerating Monthly Meal Plan for {month_name} {year}...")
        print(f"Target Calories: {calorie_target} per day")
        
        try:
            # Generate meal plan
            meal_plan = await self.ai_service.generate_monthly_meal_plan(meal_request)
            
            print(f"\n✅ MEAL PLAN GENERATION SUCCESSFUL!")
            print(f"\nMeal Plan Structure:")
            
            # Log the structure without overwhelming detail
            if 'monthly_overview' in meal_plan:
                overview = meal_plan['monthly_overview']
                print(f"  📊 Monthly Overview:")
                print(f"     - Total Days: {overview.get('total_days')}")
                print(f"     - Average Daily Calories: {overview.get('average_daily_calories')}")
                print(f"     - Meal Prep Strategy: {overview.get('meal_prep_strategy')}")
                print(f"     - Seasonal Focus: {overview.get('seasonal_focus')}")
            
            if 'weekly_themes' in meal_plan:
                print(f"  🍽️ Weekly Themes:")
                for week, theme in meal_plan['weekly_themes'].items():
                    print(f"     - {week}: {theme.get('theme')} - {theme.get('focus')}")
            
            if 'daily_meals' in meal_plan:
                daily_meals = meal_plan['daily_meals']
                print(f"  🥗 Daily Meals: {len(daily_meals)} days planned")
                
                # Show first few days as examples
                for day_num in list(daily_meals.keys())[:3]:
                    day_data = daily_meals[day_num]
                    total_cals = day_data.get('daily_totals', {}).get('calories', 0)
                    print(f"     - Day {day_num} ({day_data.get('day_of_week')}): {total_cals} calories")
                    print(f"       • Breakfast: {day_data.get('breakfast', {}).get('name', 'N/A')}")
                    print(f"       • Lunch: {day_data.get('lunch', {}).get('name', 'N/A')}")
                    print(f"       • Dinner: {day_data.get('dinner', {}).get('name', 'N/A')}")
            
            # Save full plan to file for detailed analysis
            filename = f"meal_plan_{player_data['name'].replace(' ', '_')}_{month}_{year}.json"
            with open(filename, 'w') as f:
                json.dump(meal_plan, f, indent=2, default=str)
            print(f"\n💾 Full meal plan saved to: {filename}")
            
            return meal_plan
            
        except Exception as e:
            print(f"\n❌ MEAL PLAN GENERATION FAILED!")
            print(f"Error: {str(e)}")
            return None
    
    def calculate_calorie_target(self, player_data):
        """Calculate daily calorie target based on player profile"""
        # Basic BMR calculation using Mifflin-St Jeor Equation
        age = player_data['age']
        weight = player_data['weight']
        height = player_data['height']
        
        # Assume male if no gender specified (could be enhanced)
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
        
        # Activity multipliers
        activity_multipliers = {
            'sedentary': 1.2,
            'lightly_active': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'very_active': 1.9
        }
        
        activity_level = player_data.get('activity_level', 'moderate')
        tdee = bmr * activity_multipliers.get(activity_level, 1.55)
        
        # Adjust based on objective
        objective = player_data['objective']
        if objective == 'LOSE_WEIGHT':
            return int(tdee - 500)  # 500 calorie deficit
        elif objective == 'BUILD_MUSCLE':
            return int(tdee + 300)  # 300 calorie surplus
        else:
            return int(tdee)  # Maintenance
    
    def get_macro_preferences(self, player_data):
        """Get macro preferences based on player profile"""
        objective = player_data['objective']
        restrictions = player_data['dietary_restrictions']
        
        if 'LOW_CARB' in restrictions or 'KETO' in restrictions:
            return {
                "carbs_percent": 10 if 'KETO' in restrictions else 20,
                "protein_percent": 30,
                "fat_percent": 60 if 'KETO' in restrictions else 50
            }
        elif objective == 'BUILD_MUSCLE':
            return {
                "carbs_percent": 40,
                "protein_percent": 35,
                "fat_percent": 25
            }
        elif objective == 'LOSE_WEIGHT':
            return {
                "carbs_percent": 30,
                "protein_percent": 40,
                "fat_percent": 30
            }
        else:
            return {
                "carbs_percent": 45,
                "protein_percent": 25,
                "fat_percent": 30
            }
    
    async def run_comprehensive_test(self):
        """Run comprehensive test with all player profiles"""
        
        print("🚀 STARTING COMPREHENSIVE AI MONTHLY PLAN TESTING")
        print("="*80)
        
        test_profiles = self.create_test_player_profiles()
        
        results = {
            "workout_plans": [],
            "meal_plans": [],
            "errors": []
        }
        
        for profile in test_profiles:
            print(f"\n🧪 Testing profile: {profile['profile_name']}")
            
            # Test workout plan generation
            try:
                workout_result = await self.test_monthly_workout_plan_generation(profile)
                if workout_result:
                    results["workout_plans"].append({
                        "profile": profile['profile_name'],
                        "status": "success",
                        "structure_valid": 'daily_workouts' in workout_result
                    })
                else:
                    results["workout_plans"].append({
                        "profile": profile['profile_name'],
                        "status": "failed"
                    })
            except Exception as e:
                results["errors"].append(f"Workout plan for {profile['profile_name']}: {str(e)}")
            
            # Test meal plan generation
            try:
                meal_result = await self.test_monthly_meal_plan_generation(profile)
                if meal_result:
                    results["meal_plans"].append({
                        "profile": profile['profile_name'],
                        "status": "success",
                        "structure_valid": 'daily_meals' in meal_result
                    })
                else:
                    results["meal_plans"].append({
                        "profile": profile['profile_name'],
                        "status": "failed"
                    })
            except Exception as e:
                results["errors"].append(f"Meal plan for {profile['profile_name']}: {str(e)}")
        
        # Print summary
        print(f"\n\n{'='*80}")
        print("🎯 TEST SUMMARY")
        print("="*80)
        
        print(f"\nWorkout Plans Generated: {len([r for r in results['workout_plans'] if r['status'] == 'success'])}/{len(test_profiles)}")
        for result in results["workout_plans"]:
            status_emoji = "✅" if result["status"] == "success" else "❌"
            print(f"  {status_emoji} {result['profile']}: {result['status']}")
        
        print(f"\nMeal Plans Generated: {len([r for r in results['meal_plans'] if r['status'] == 'success'])}/{len(test_profiles)}")
        for result in results["meal_plans"]:
            status_emoji = "✅" if result["status"] == "success" else "❌"
            print(f"  {status_emoji} {result['profile']}: {result['status']}")
        
        if results["errors"]:
            print(f"\n❌ Errors encountered: {len(results['errors'])}")
            for error in results["errors"]:
                print(f"  • {error}")
        
        print(f"\n💾 Individual plan files saved for detailed review")
        print("="*80)
        
        return results

# Main execution
async def main():
    """Main test execution"""
    tester = PlayerProfileTester()
    await tester.run_comprehensive_test()

if __name__ == "__main__":
    asyncio.run(main())
