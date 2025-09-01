import asyncio
import json
import sys
import os
from datetime import datetime
import calendar

# Add the services directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'services'))

class PromptTester:
    """Test prompt generation without making actual AI calls"""
    
    def create_sample_player(self):
        """Create a sample player profile for testing"""
        return {
            "profile_name": "Test User - Weight Loss",
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
                "goal_weight": 65.0,
                "activity_level": "sedentary",
                "medical_conditions": [],
                "previous_injuries": ["lower_back_strain"],
                "preferred_workout_times": ["morning"],
                "available_days": ["monday", "wednesday", "friday", "saturday"],
                "session_duration_preference": 45,
                "intensity_preference": "moderate",
                "equipment_access": ["dumbbells", "treadmill", "resistance_bands", "yoga_mat"],
                "fitness_goals": ["weight_loss", "improved_endurance", "better_sleep"],
                "meal_prep_time": 30,
                "cooking_skill": "intermediate",
                "budget_range": "medium",
                "family_size": 2,
                "work_schedule": "office_9_to_5"
            }
        }
    
    def generate_workout_prompt(self, player_profile):
        """Generate the workout prompt that would be sent to AI"""
        
        current_date = datetime.now()
        month = current_date.month
        year = current_date.year
        month_name = calendar.month_name[month]
        days_in_month = calendar.monthrange(year, month)[1]
        
        player_data = player_profile['player_data']
        
        # Prepare comprehensive workout request
        request_data = {
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
        
        # Extract data for prompt
        personal_info = request_data['player_profile']['personal_info']
        fitness_profile = request_data['player_profile']['fitness_profile']
        preferences = request_data['player_profile']['preferences']
        health_considerations = request_data['player_profile']['health_considerations']
        lifestyle = request_data['player_profile']['lifestyle']
        
        prompt = f"""
You are an expert fitness coach creating a comprehensive monthly workout plan.

COMPREHENSIVE USER PROFILE:

PERSONAL INFORMATION:
- Name: {personal_info.get('name', 'User')}
- Age: {personal_info.get('age', 'Unknown')} years
- Height: {personal_info.get('height_cm', 'Unknown')} cm
- Current Weight: {personal_info.get('weight_kg', 'Unknown')} kg
- Goal Weight: {personal_info.get('goal_weight_kg', 'Not specified')} kg
- Activity Level: {personal_info.get('activity_level', 'moderate')}

FITNESS PROFILE:
- Character Type: {fitness_profile.get('character_type', 'Unknown')}
- Primary Objective: {fitness_profile.get('primary_objective', 'GENERAL_FITNESS')}
- Current Level: {fitness_profile.get('current_level', 1)}
- Experience Points: {fitness_profile.get('experience_points', 0)}
- Fitness Goals: {', '.join(fitness_profile.get('fitness_goals', []))}
- Training Environment: {fitness_profile.get('training_environment', 'HOME_TRAINING')}

PREFERENCES:
- Session Duration: {preferences.get('session_duration_minutes', 45)} minutes
- Intensity Preference: {preferences.get('intensity_preference', 'moderate')}
- Preferred Workout Times: {', '.join(preferences.get('preferred_workout_times', []))}
- Available Days: {', '.join(preferences.get('available_days', []))}
- Equipment Access: {', '.join(preferences.get('equipment_access', []))}

HEALTH CONSIDERATIONS:
- Medical Conditions: {', '.join(health_considerations.get('medical_conditions', []))}
- Previous Injuries: {', '.join(health_considerations.get('previous_injuries', []))}
- Injuries/Limitations: {', '.join(health_considerations.get('injuries_limitations', []))}

LIFESTYLE FACTORS:
- Work Schedule: {lifestyle.get('work_schedule', 'standard')}
- Family Size: {lifestyle.get('family_size', 1)}
- Stress Level: {lifestyle.get('stress_level', 'moderate')}

MONTH DETAILS:
- Month: {month_name} {year}
- Total Days: {days_in_month}

CRITICAL REQUIREMENTS:
1. Create workout plans for ALL {days_in_month} days of {month_name}
2. Consider user's fitness level, goals, and limitations
3. Ensure progressive overload throughout the month
4. Account for recovery and rest days
5. Return ONLY valid JSON - no markdown, no explanations

EXACT JSON FORMAT REQUIRED:
{{
    "monthly_overview": {{
        "month": {month},
        "year": {year},
        "total_days": {days_in_month},
        "workout_days": 20,
        "rest_days": 11,
        "training_phases": ["Foundation Week", "Build Week", "Peak Week", "Recovery Week"]
    }},
    "weekly_structure": {{
        "week_1": {{
            "focus": "Foundation/Adaptation",
            "intensity": "Low-Moderate",
            "volume": "Moderate"
        }},
        "week_2": {{
            "focus": "Progressive Overload", 
            "intensity": "Moderate",
            "volume": "Moderate-High"
        }},
        "week_3": {{
            "focus": "Peak Training",
            "intensity": "Moderate-High",
            "volume": "High"
        }},
        "week_4": {{
            "focus": "Recovery/Deload",
            "intensity": "Low-Moderate",
            "volume": "Low-Moderate"
        }}
    }},
    "daily_workouts": {{
        "1": {{
            "day_of_week": "Monday",
            "workout_type": "Upper Body Strength",
            "duration": 45,
            "intensity": "Moderate",
            "exercises": [
                {{
                    "name": "Push-ups",
                    "type": "strength",
                    "sets": 3,
                    "reps": "8-12",
                    "rest_time": "60",
                    "notes": "Keep core tight, full range of motion",
                    "progression": "Increase reps or add resistance"
                }}
            ],
            "warm_up": ["5 min dynamic warm-up", "Arm circles", "Shoulder rolls"],
            "cool_down": ["5 min stretching", "Upper body stretches"]
        }},
        ... (continue for all {days_in_month} days)
    }},
    "progression_plan": {{
        "week_1_adjustments": "Focus on form and establishing routine",
        "week_2_adjustments": "Increase weight/reps by 5-10%",
        "week_3_adjustments": "Peak intensity, maintain good form",
        "week_4_adjustments": "Reduce volume, focus on recovery"
    }},
    "safety_guidelines": [
        "Always warm up before exercising",
        "Stop if you feel pain",
        "Stay hydrated throughout workouts"
    ]
}}

Generate the complete plan for all {days_in_month} days. Return ONLY the JSON.
"""
        
        return prompt, request_data
    
    def generate_meal_prompt(self, player_profile):
        """Generate the meal prompt that would be sent to AI"""
        
        current_date = datetime.now()
        month = current_date.month
        year = current_date.year
        month_name = calendar.month_name[month]
        days_in_month = calendar.monthrange(year, month)[1]
        
        player_data = player_profile['player_data']
        
        # Calculate calorie target
        age = player_data['age']
        weight = player_data['weight']
        height = player_data['height']
        
        # Basic BMR calculation
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
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
            calorie_target = int(tdee - 500)
        elif objective == 'BUILD_MUSCLE':
            calorie_target = int(tdee + 300)
        else:
            calorie_target = int(tdee)
        
        # Prepare comprehensive meal request
        request_data = {
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
                    "macro_preferences": {
                        "carbs_percent": 30,
                        "protein_percent": 40,
                        "fat_percent": 30
                    }
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
        
        # Extract data for prompt
        personal_info = request_data['player_profile']['personal_info']
        nutrition_profile = request_data['player_profile']['nutrition_profile']
        lifestyle = request_data['player_profile']['lifestyle']
        health_considerations = request_data['player_profile']['health_considerations']
        
        prompt = f"""
You are a certified nutritionist creating a comprehensive monthly meal plan.

COMPREHENSIVE USER PROFILE:

PERSONAL INFORMATION:
- Name: {personal_info.get('name', 'User')}
- Age: {personal_info.get('age', 'Unknown')} years
- Height: {personal_info.get('height_cm', 'Unknown')} cm
- Current Weight: {personal_info.get('weight_kg', 'Unknown')} kg
- Goal Weight: {personal_info.get('goal_weight_kg', 'Not specified')} kg
- Activity Level: {personal_info.get('activity_level', 'moderate')}

NUTRITION PROFILE:
- Primary Objective: {nutrition_profile.get('primary_objective', 'GENERAL_FITNESS')}
- Dietary Restrictions: {', '.join(nutrition_profile.get('dietary_restrictions', []))}
- Forbidden Foods: {', '.join(nutrition_profile.get('forbidden_foods', []))}
- Daily Calorie Target: {calorie_target} calories
- Macro Preferences: {nutrition_profile.get('macro_preferences', {})}

LIFESTYLE FACTORS:
- Meal Prep Time: {lifestyle.get('meal_prep_time_minutes', 30)} minutes/day
- Cooking Skill: {lifestyle.get('cooking_skill', 'intermediate')}
- Budget Range: {lifestyle.get('budget_range', 'medium')}
- Family Size: {lifestyle.get('family_size', 1)}
- Work Schedule: {lifestyle.get('work_schedule', 'standard')}

HEALTH CONSIDERATIONS:
- Medical Conditions: {', '.join(health_considerations.get('medical_conditions', []))}
- Supplements: {', '.join(health_considerations.get('supplements', []))}

MONTH DETAILS:
- Month: {month_name} {year}
- Total Days: {days_in_month}

CRITICAL REQUIREMENTS:
1. Create meal plans for ALL {days_in_month} days of {month_name}
2. Meet daily calorie target of {calorie_target} calories
3. Respect dietary restrictions and forbidden foods
4. Ensure nutritional variety throughout the month
5. Return ONLY valid JSON - no markdown, no explanations

EXACT JSON FORMAT REQUIRED:
{{
    "monthly_overview": {{
        "month": {month},
        "year": {year},
        "total_days": {days_in_month},
        "average_daily_calories": {calorie_target},
        "meal_prep_strategy": "Weekly prep with fresh daily items",
        "seasonal_focus": "Seasonal ingredients for {month_name}"
    }},
    "weekly_themes": {{
        "week_1": {{
            "theme": "Mediterranean Week",
            "focus": "Fresh vegetables and lean proteins",
            "prep_strategy": "Sunday prep for proteins and grains"
        }},
        "week_2": {{
            "theme": "Asian Fusion Week",
            "focus": "Stir-fries and balanced bowls", 
            "prep_strategy": "Mid-week prep for sauces and marinades"
        }},
        "week_3": {{
            "theme": "Comfort Classics Week",
            "focus": "Healthy versions of comfort foods",
            "prep_strategy": "Batch cooking on weekends"
        }},
        "week_4": {{
            "theme": "Fresh & Light Week",
            "focus": "Salads and light meals",
            "prep_strategy": "Daily fresh preparation"
        }}
    }},
    "daily_meals": {{
        "1": {{
            "day_of_week": "Monday",
            "breakfast": {{
                "name": "Mediterranean Scramble",
                "calories": 350,
                "protein": "25g",
                "carbs": "15g",
                "fat": "20g",
                "prep_time": "10",
                "ingredients": ["Eggs", "Spinach", "Tomatoes", "Feta"],
                "instructions": ["Scramble eggs with vegetables", "Add feta at the end"],
                "meal_prep_notes": "Can prep vegetables the night before"
            }},
            "lunch": {{
                "name": "Quinoa Power Bowl",
                "calories": 450,
                "protein": "30g",
                "carbs": "45g",
                "fat": "15g",
                "prep_time": "15",
                "ingredients": ["Quinoa", "Chicken", "Vegetables", "Tahini"],
                "instructions": ["Combine cooked quinoa with protein and vegetables"],
                "meal_prep_notes": "Perfect for meal prep containers"
            }},
            "dinner": {{
                "name": "Herb Crusted Salmon",
                "calories": 400,
                "protein": "35g",
                "carbs": "20g",
                "fat": "20g",
                "prep_time": "25",
                "ingredients": ["Salmon", "Herbs", "Sweet potato", "Asparagus"],
                "instructions": ["Bake salmon and vegetables together"],
                "meal_prep_notes": "Best prepared fresh"
            }},
            "snacks": [
                {{
                    "name": "Greek Yogurt with Berries",
                    "calories": 150,
                    "ingredients": ["Greek yogurt", "Mixed berries", "Honey"]
                }}
            ],
            "daily_totals": {{
                "calories": {calorie_target},
                "protein": 90,
                "carbs": 80,
                "fat": 55,
                "fiber": 30
            }}
        }},
        ... (continue for all {days_in_month} days)
    }},
    "weekly_shopping_lists": {{
        "week_1": {{
            "proteins": ["Chicken breast", "Salmon", "Eggs", "Greek yogurt"],
            "vegetables": ["Spinach", "Tomatoes", "Asparagus", "Sweet potatoes"],
            "fruits": ["Berries", "Apples", "Bananas"],
            "grains": ["Quinoa", "Oats", "Brown rice"],
            "pantry": ["Olive oil", "Herbs", "Spices"],
            "estimated_cost": "$75-90"
        }}
    }},
    "nutritional_balance": {{
        "monthly_protein_avg": 85,
        "monthly_carb_avg": 100,
        "monthly_fat_avg": 60,
        "micronutrient_focus": ["Vitamin D", "Omega-3", "Fiber"]
    }}
}}

Generate the complete plan for all {days_in_month} days. Return ONLY the JSON.
"""
        
        return prompt, request_data
    
    def test_prompts(self):
        """Test prompt generation and display them"""
        
        print("🧪 TESTING AI PROMPT GENERATION")
        print("="*80)
        
        player_profile = self.create_sample_player()
        
        print(f"\n👤 Testing with Profile: {player_profile['profile_name']}")
        print(f"Player: {player_profile['player_data']['name']}")
        print(f"Goal: {player_profile['player_data']['objective']}")
        print(f"Environment: {player_profile['player_data']['training_environment']}")
        
        # Test workout prompt
        print(f"\n{'='*40}")
        print("🏋️ WORKOUT PLAN PROMPT")
        print("="*40)
        
        workout_prompt, workout_data = self.generate_workout_prompt(player_profile)
        
        print("📝 Generated Prompt (First 1000 characters):")
        print("-" * 50)
        print(workout_prompt[:1000] + "..." if len(workout_prompt) > 1000 else workout_prompt)
        
        print(f"\n📊 Request Data Structure:")
        print(f"- User ID: {workout_data['user_id']}")
        print(f"- Month/Year: {workout_data['month']}/{workout_data['year']}")
        print(f"- Personal Info Keys: {list(workout_data['player_profile']['personal_info'].keys())}")
        print(f"- Fitness Profile Keys: {list(workout_data['player_profile']['fitness_profile'].keys())}")
        print(f"- Health Considerations: {workout_data['player_profile']['health_considerations']}")
        
        # Save full workout prompt to file
        with open('workout_prompt_sample.txt', 'w') as f:
            f.write("WORKOUT PLAN PROMPT\n")
            f.write("="*50 + "\n\n")
            f.write(workout_prompt)
            f.write("\n\nREQUEST DATA STRUCTURE\n")
            f.write("="*30 + "\n")
            f.write(json.dumps(workout_data, indent=2))
        
        # Test meal prompt
        print(f"\n{'='*40}")
        print("🍽️ MEAL PLAN PROMPT")
        print("="*40)
        
        meal_prompt, meal_data = self.generate_meal_prompt(player_profile)
        
        print("📝 Generated Prompt (First 1000 characters):")
        print("-" * 50)
        print(meal_prompt[:1000] + "..." if len(meal_prompt) > 1000 else meal_prompt)
        
        print(f"\n📊 Request Data Structure:")
        print(f"- User ID: {meal_data['user_id']}")
        print(f"- Month/Year: {meal_data['month']}/{meal_data['year']}")
        print(f"- Nutrition Profile: {meal_data['player_profile']['nutrition_profile']}")
        print(f"- Lifestyle Factors: {meal_data['player_profile']['lifestyle']}")
        
        # Save full meal prompt to file
        with open('meal_prompt_sample.txt', 'w') as f:
            f.write("MEAL PLAN PROMPT\n")
            f.write("="*50 + "\n\n")
            f.write(meal_prompt)
            f.write("\n\nREQUEST DATA STRUCTURE\n")
            f.write("="*30 + "\n")
            f.write(json.dumps(meal_data, indent=2))
        
        print(f"\n💾 PROMPTS SAVED TO FILES:")
        print("- workout_prompt_sample.txt")
        print("- meal_prompt_sample.txt")
        
        print(f"\n✅ PROMPT TESTING COMPLETED!")
        print("="*80)
        print("✨ Review the generated prompts to ensure they contain all necessary player data")
        print("✨ Once satisfied, add your Google AI API key to .env and run the full test")

# Main execution
if __name__ == "__main__":
    tester = PromptTester()
    tester.test_prompts()
