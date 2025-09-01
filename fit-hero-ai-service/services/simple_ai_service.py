import google.generativeai as genai
import json
import re
from typing import Dict, Any, List, Optional
from config_simple import GOOGLE_API_KEY
import calendar
from datetime import datetime

class SimpleAIService:
    def __init__(self):
        if not GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        
        genai.configure(api_key=GOOGLE_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    async def generate_monthly_workout_plan(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a complete monthly workout plan using Gemini 2.0 Flash with comprehensive player data"""
        
        # Extract data from request
        user_id = request_data.get('user_id')
        month = request_data.get('month')
        year = request_data.get('year')
        player_profile = request_data.get('player_profile', {})
        
        days_in_month = calendar.monthrange(year, month)[1]
        month_name = calendar.month_name[month]
        
        # Extract comprehensive player data
        personal_info = player_profile.get('personal_info', {})
        fitness_profile = player_profile.get('fitness_profile', {})
        preferences = player_profile.get('preferences', {})
        health_considerations = player_profile.get('health_considerations', {})
        lifestyle = player_profile.get('lifestyle', {})
        
        # Extract commonly used variables
        available_time = preferences.get('session_duration_minutes', 45)
        fitness_level = personal_info.get('activity_level', 'beginner')
        
        try:
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
1. Create workouts for ALL {days_in_month} days of {month_name}
2. Include rest days strategically
3. Progress throughout the month
4. Return ONLY valid JSON - no markdown, no explanations
5. Each day must have complete workout data

EXACT JSON FORMAT REQUIRED:
{{
    "monthly_overview": {{
        "month": {month},
        "year": {year},
        "total_days": {days_in_month},
        "workout_days": 20,
        "rest_days": 11,
        "training_phases": ["Foundation", "Build", "Peak", "Recovery"]
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
            "workout_type": "Upper Body",
            "duration": {available_time},
            "intensity": "Moderate",
            "exercises": [
                {{
                    "name": "Push-ups",
                    "type": "strength",
                    "sets": 3,
                    "reps": "8-12",
                    "rest_time": "60",
                    "notes": "Keep core tight",
                    "progression": "Add 1 rep each week"
                }}
            ],
            "warm_up": ["Arm circles", "Light cardio"],
            "cool_down": ["Chest stretch", "Shoulder stretch"]
        }}
        // ... continue for days 2-{days_in_month}
    }},
    "progression_plan": {{
        "week_1_adjustments": "Focus on form and adaptation",
        "week_2_adjustments": "Increase intensity by 10%",
        "week_3_adjustments": "Peak training with highest volume",
        "week_4_adjustments": "Reduce volume for recovery"
    }},
    "safety_guidelines": [
        "Always warm up before exercising",
        "Stop if you feel pain",
        "Stay hydrated throughout workouts"
    ]
}}

Generate the complete plan for all {days_in_month} days. Return ONLY the JSON.
"""
            
            response = self.model.generate_content(prompt)
            raw_text = response.text.strip()
            
            # Try to extract JSON from the response
            json_data = self._extract_json_from_response(raw_text)
            
            # Ensure all days are present
            json_data = self._ensure_all_days_present(json_data, month, year, days_in_month)
            
            return json_data
            
        except Exception as e:
            print(f"Error generating monthly workout plan: {e}")
            return self._create_fallback_workout_plan(month, year, days_in_month, fitness_level, available_time)
    
    async def generate_monthly_meal_plan(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a complete monthly meal plan using Gemini 2.0 Flash with comprehensive player data"""
        
        # Extract data from request
        user_id = request_data.get('user_id')
        month = request_data.get('month')
        year = request_data.get('year')
        player_profile = request_data.get('player_profile', {})
        
        days_in_month = calendar.monthrange(year, month)[1]
        month_name = calendar.month_name[month]
        
        # Extract comprehensive player data
        personal_info = player_profile.get('personal_info', {})
        nutrition_profile = player_profile.get('nutrition_profile', {})
        lifestyle = player_profile.get('lifestyle', {})
        health_considerations = player_profile.get('health_considerations', {})
        
        calorie_target = nutrition_profile.get('calorie_target', 2000)
        
        try:
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
2. Ensure variety throughout the month
3. Meet nutritional targets
4. Return ONLY valid JSON - no markdown, no explanations
5. Each day must have breakfast, lunch, dinner, and snacks

EXACT JSON FORMAT REQUIRED:
{{
    "monthly_overview": {{
        "month": {month},
        "year": {year},
        "total_days": {days_in_month},
        "average_daily_calories": {calorie_target or 2000},
        "meal_prep_strategy": "Weekly prep with fresh daily items",
        "seasonal_focus": "Autumn comfort foods with fresh produce"
    }},
    "weekly_themes": {{
        "week_1": {{
            "theme": "Mediterranean Week",
            "focus": "Fresh vegetables and lean proteins",
            "prep_strategy": "Prep grains and proteins on Sunday"
        }},
        "week_2": {{
            "theme": "Asian Fusion Week",
            "focus": "Stir-fries and balanced bowls", 
            "prep_strategy": "Prep sauces and chop vegetables"
        }},
        "week_3": {{
            "theme": "Comfort Classics Week",
            "focus": "Healthy versions of comfort foods",
            "prep_strategy": "Batch cook soups and stews"
        }},
        "week_4": {{
            "theme": "Fresh & Light Week",
            "focus": "Salads and light meals",
            "prep_strategy": "Prep fresh ingredients daily"
        }}
    }},
    "daily_meals": {{
        "1": {{
            "day_of_week": "Monday",
            "breakfast": {{
                "name": "Protein Oatmeal",
                "calories": 350,
                "protein": "20g",
                "carbs": "45g",
                "fat": "8g",
                "prep_time": "10",
                "ingredients": ["Oats", "Protein powder", "Banana", "Almond milk"],
                "instructions": ["Cook oats with almond milk", "Stir in protein powder", "Top with banana"],
                "meal_prep_notes": "Can prep overnight oats version"
            }},
            "lunch": {{
                "name": "Mediterranean Bowl",
                "calories": 450,
                "protein": "25g",
                "carbs": "40g", 
                "fat": "18g",
                "prep_time": "15",
                "ingredients": ["Quinoa", "Grilled chicken", "Cucumbers", "Tomatoes", "Feta", "Olive oil"],
                "instructions": ["Cook quinoa", "Grill chicken", "Combine with vegetables and feta"],
                "meal_prep_notes": "Can prep components separately"
            }},
            "dinner": {{
                "name": "Baked Salmon with Vegetables",
                "calories": 500,
                "protein": "35g",
                "carbs": "30g",
                "fat": "22g",
                "prep_time": "25",
                "ingredients": ["Salmon fillet", "Sweet potato", "Broccoli", "Lemon", "Herbs"],
                "instructions": ["Bake salmon and sweet potato", "Steam broccoli", "Season with lemon"],
                "meal_prep_notes": "Salmon best cooked fresh"
            }},
            "snacks": [
                {{
                    "name": "Greek Yogurt with Berries",
                    "calories": 150,
                    "ingredients": ["Greek yogurt", "Mixed berries", "Honey"]
                }}
            ],
            "daily_totals": {{
                "calories": 1450,
                "protein": 80,
                "carbs": 115,
                "fat": 48,
                "fiber": 30
            }}
        }}
        // ... continue for days 2-{days_in_month}
    }},
    "weekly_shopping_lists": {{
        "week_1": {{
            "proteins": ["Chicken breast", "Salmon", "Greek yogurt", "Eggs"],
            "vegetables": ["Broccoli", "Spinach", "Tomatoes", "Cucumbers"],
            "fruits": ["Bananas", "Berries", "Apples", "Lemons"],
            "grains": ["Quinoa", "Oats", "Brown rice"],
            "pantry": ["Olive oil", "Herbs", "Spices"],
            "estimated_cost": "$75-90"
        }}
    }},
    "nutritional_balance": {{
        "monthly_protein_avg": 80,
        "monthly_carb_avg": 120,
        "monthly_fat_avg": 50,
        "micronutrient_focus": ["Vitamin D", "Omega-3", "Fiber"]
    }}
}}

Generate the complete plan for all {days_in_month} days. Return ONLY the JSON.
"""
            
            response = self.model.generate_content(prompt)
            raw_text = response.text.strip()
            
            # Try to extract JSON from the response
            json_data = self._extract_json_from_response(raw_text)
            
            # Ensure all days are present
            json_data = self._ensure_all_meal_days_present(json_data, month, year, days_in_month)
            
            return json_data
            
        except Exception as e:
            print(f"Error generating monthly meal plan: {e}")
            return self._create_fallback_meal_plan(month, year, days_in_month, calorie_target or 2000)
    
    def filter_workout_plan(self, raw_response: Dict[str, Any]) -> Dict[str, Any]:
        """Apply basic filtering to workout plan response"""
        print("🔧 Applying workout plan filtering...")
        
        filtered = {}
        
        # Copy basic structure with validation
        if 'monthly_overview' in raw_response:
            filtered['monthly_overview'] = raw_response['monthly_overview']
        
        if 'weekly_structure' in raw_response:
            filtered['weekly_structure'] = raw_response['weekly_structure']
        
        if 'daily_workouts' in raw_response:
            filtered['daily_workouts'] = self._filter_daily_workouts(raw_response['daily_workouts'])
        
        if 'progression_plan' in raw_response:
            filtered['progression_plan'] = raw_response['progression_plan']
        
        if 'safety_guidelines' in raw_response:
            filtered['safety_guidelines'] = raw_response['safety_guidelines']
        
        print(f"✅ Workout filtering complete. Keys: {list(filtered.keys())}")
        return filtered
    
    def filter_meal_plan(self, raw_response: Dict[str, Any]) -> Dict[str, Any]:
        """Apply basic filtering to meal plan response"""
        print("🔧 Applying meal plan filtering...")
        
        filtered = {}
        
        # Copy basic structure with validation
        if 'monthly_overview' in raw_response:
            filtered['monthly_overview'] = raw_response['monthly_overview']
        
        if 'weekly_themes' in raw_response:
            filtered['weekly_themes'] = raw_response['weekly_themes']
        
        if 'daily_meals' in raw_response:
            filtered['daily_meals'] = self._filter_daily_meals(raw_response['daily_meals'])
        
        if 'weekly_shopping_lists' in raw_response:
            filtered['weekly_shopping_lists'] = raw_response['weekly_shopping_lists']
        
        if 'nutritional_balance' in raw_response:
            filtered['nutritional_balance'] = raw_response['nutritional_balance']
        
        print(f"✅ Meal filtering complete. Keys: {list(filtered.keys())}")
        return filtered
    
    def _extract_json_from_response(self, text: str) -> Dict[str, Any]:
        """Extract JSON from AI response text"""
        # Remove markdown code blocks
        text = re.sub(r'```json\s*', '', text)
        text = re.sub(r'```\s*', '', text)
        
        # Try to find JSON object
        start = text.find('{')
        end = text.rfind('}') + 1
        
        if start != -1 and end > start:
            json_str = text[start:end]
            try:
                return json.loads(json_str)
            except json.JSONDecodeError:
                pass
        
        # If that fails, try to parse the entire text
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            raise ValueError("Could not extract valid JSON from AI response")
    
    def _ensure_all_days_present(self, data: Dict[str, Any], month: int, year: int, days_in_month: int) -> Dict[str, Any]:
        """Ensure all days of the month have workout entries"""
        if 'daily_workouts' not in data:
            data['daily_workouts'] = {}
        
        daily_workouts = data['daily_workouts']
        
        for day in range(1, days_in_month + 1):
            day_str = str(day)
            if day_str not in daily_workouts:
                # Create a rest day
                day_name = calendar.day_name[calendar.weekday(year, month, day)]
                daily_workouts[day_str] = {
                    "day_of_week": day_name,
                    "workout_type": "Rest",
                    "duration": 0,
                    "intensity": "Low",
                    "exercises": [],
                    "warm_up": [],
                    "cool_down": []
                }
        
        return data
    
    def _ensure_all_meal_days_present(self, data: Dict[str, Any], month: int, year: int, days_in_month: int) -> Dict[str, Any]:
        """Ensure all days of the month have meal entries"""
        if 'daily_meals' not in data:
            data['daily_meals'] = {}
        
        daily_meals = data['daily_meals']
        
        for day in range(1, days_in_month + 1):
            day_str = str(day)
            if day_str not in daily_meals:
                # Create a basic meal day
                day_name = calendar.day_name[calendar.weekday(year, month, day)]
                daily_meals[day_str] = self._create_basic_meal_day(day_name)
        
        return data
    
    def _filter_daily_workouts(self, daily_workouts: Dict[str, Any]) -> Dict[str, Any]:
        """Filter and validate daily workout entries"""
        filtered = {}
        for day, workout in daily_workouts.items():
            if isinstance(workout, dict):
                filtered[day] = {
                    "day_of_week": workout.get("day_of_week", "Unknown"),
                    "workout_type": workout.get("workout_type", "Rest"),
                    "duration": min(max(workout.get("duration", 0), 0), 180),  # 0-180 minutes
                    "intensity": workout.get("intensity", "Low"),
                    "exercises": workout.get("exercises", []),
                    "warm_up": workout.get("warm_up", []),
                    "cool_down": workout.get("cool_down", [])
                }
        return filtered
    
    def _filter_daily_meals(self, daily_meals: Dict[str, Any]) -> Dict[str, Any]:
        """Filter and validate daily meal entries"""
        filtered = {}
        for day, meals in daily_meals.items():
            if isinstance(meals, dict):
                filtered[day] = {
                    "day_of_week": meals.get("day_of_week", "Unknown"),
                    "breakfast": meals.get("breakfast", {}),
                    "lunch": meals.get("lunch", {}),
                    "dinner": meals.get("dinner", {}),
                    "snacks": meals.get("snacks", []),
                    "daily_totals": meals.get("daily_totals", {})
                }
        return filtered
    
    def _create_fallback_workout_plan(self, month: int, year: int, days_in_month: int, fitness_level: str, available_time: int) -> Dict[str, Any]:
        """Create a basic fallback workout plan if AI fails"""
        return {
            "monthly_overview": {
                "month": month,
                "year": year,
                "total_days": days_in_month,
                "workout_days": 20,
                "rest_days": days_in_month - 20
            },
            "daily_workouts": {
                str(i): {
                    "day_of_week": calendar.day_name[calendar.weekday(year, month, i)],
                    "workout_type": "Rest" if i % 7 == 0 else "Full Body",
                    "duration": 0 if i % 7 == 0 else available_time,
                    "intensity": "Low",
                    "exercises": [],
                    "warm_up": [],
                    "cool_down": []
                } for i in range(1, days_in_month + 1)
            }
        }
    
    def _create_fallback_meal_plan(self, month: int, year: int, days_in_month: int, calorie_target: int) -> Dict[str, Any]:
        """Create a basic fallback meal plan if AI fails"""
        return {
            "monthly_overview": {
                "month": month,
                "year": year,
                "total_days": days_in_month,
                "average_daily_calories": calorie_target
            },
            "daily_meals": {
                str(i): self._create_basic_meal_day(
                    calendar.day_name[calendar.weekday(year, month, i)]
                ) for i in range(1, days_in_month + 1)
            }
        }
    
    def _create_basic_meal_day(self, day_name: str) -> Dict[str, Any]:
        """Create a basic meal day structure"""
        return {
            "day_of_week": day_name,
            "breakfast": {
                "name": "Basic Breakfast",
                "calories": 300,
                "protein": "15g",
                "carbs": "40g",
                "fat": "10g",
                "prep_time": "10",
                "ingredients": ["Oatmeal", "Banana", "Milk"],
                "instructions": ["Prepare oatmeal", "Add banana"],
                "meal_prep_notes": "Can prep overnight"
            },
            "lunch": {
                "name": "Simple Lunch",
                "calories": 400,
                "protein": "25g",
                "carbs": "45g",
                "fat": "15g",
                "prep_time": "15",
                "ingredients": ["Chicken", "Rice", "Vegetables"],
                "instructions": ["Cook chicken and rice"],
                "meal_prep_notes": "Can meal prep"
            },
            "dinner": {
                "name": "Balanced Dinner",
                "calories": 500,
                "protein": "30g",
                "carbs": "50g",
                "fat": "20g",
                "prep_time": "25",
                "ingredients": ["Fish", "Sweet potato", "Greens"],
                "instructions": ["Bake fish and potato"],
                "meal_prep_notes": "Fresh is best"
            },
            "snacks": [
                {
                    "name": "Healthy Snack",
                    "calories": 150,
                    "ingredients": ["Apple", "Nuts"]
                }
            ],
            "daily_totals": {
                "calories": 1350,
                "protein": 70,
                "carbs": 135,
                "fat": 45,
                "fiber": 25
            }
        }

    # Keep existing methods for backward compatibility
    def generate_workout_plan(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a personalized workout plan using Gemini 2.0 Flash"""
        try:
            prompt = f"""
            As an expert fitness coach, create a personalized workout plan for:
            - Fitness Level: {user_data.get('fitness_level', 'beginner')}
            - Goals: {user_data.get('goals', 'general fitness')}
            - Available Time: {user_data.get('available_time', '30 minutes')}
            - Equipment: {user_data.get('equipment', 'basic')}
            
            Provide a structured workout plan with exercises, sets, reps, and rest periods.
            Format as JSON with weekly schedule.
            """
            
            response = self.model.generate_content(prompt)
            return {"workout_plan": response.text, "status": "success"}
            
        except Exception as e:
            return {"error": f"Failed to generate workout plan: {str(e)}", "status": "error"}
    
    def generate_meal_recommendations(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized meal recommendations using Gemini 2.0 Flash"""
        try:
            prompt = f"""
            As a certified nutritionist, create meal recommendations for:
            - Goals: {user_data.get('goals', 'general health')}
            - Dietary Preferences: {user_data.get('dietary_preferences', 'no restrictions')}
            - Activity Level: {user_data.get('activity_level', 'moderate')}
            - Allergies: {user_data.get('allergies', 'none')}
            
            Provide daily meal plans with nutritional breakdown.
            Format as JSON with breakfast, lunch, dinner, and snacks.
            """
            
            response = self.model.generate_content(prompt)
            return {"meal_plan": response.text, "status": "success"}
            
        except Exception as e:
            return {"error": f"Failed to generate meal recommendations: {str(e)}", "status": "error"}
    
    def analyze_progress(self, progress_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze user progress using Gemini 2.0 Flash"""
        try:
            prompt = f"""
            As a fitness data analyst, analyze this progress data:
            - Current Stats: {progress_data.get('current_stats', {})}
            - Goals: {progress_data.get('goals', {})}
            - Time Period: {progress_data.get('time_period', '30 days')}
            
            Provide insights, trends, and recommendations for improvement.
            Format as JSON with analysis and recommendations.
            """
            
            response = self.model.generate_content(prompt)
            return {"analysis": response.text, "status": "success"}
            
        except Exception as e:
            return {"error": f"Failed to analyze progress: {str(e)}", "status": "error"}
