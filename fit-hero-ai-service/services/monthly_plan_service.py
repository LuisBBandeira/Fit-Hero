from typing import List, Dict, Any, Optional
import os
import json
import google.generativeai as genai
from config import GOOGLE_API_KEY
import calendar
from datetime import datetime, timedelta
from services.standardized_template_service import StandardizedTemplateService

class MonthlyPlanService:
    def __init__(self):
        if not GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        
        # Configure Google AI
        genai.configure(api_key=GOOGLE_API_KEY)
        
        # Initialize the model
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Initialize template service
        self.template_service = StandardizedTemplateService()

    async def generate_monthly_workout_plan(
        self,
        user_id: str,
        month: int,
        year: int,
        fitness_level: str,
        goals: List[str],
        available_time: int,
        equipment: List[str],
        age: int = 30,
        weight: float = 75.0,
        injuries_limitations: Optional[List[str]] = None,
        preferred_activities: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        
        # Get number of days in the month
        days_in_month = calendar.monthrange(year, month)[1]
        month_name = calendar.month_name[month]
        
        # Get appropriate workout template based on user profile
        equipment_type = "gym" if "gym" in equipment else "home"
        
        # Build user profile dictionary for template service
        user_profile = {
            "age": age,
            "weight": weight,
            "goals": goals,
            "fitness_level": fitness_level,
            "training_environment": equipment_type.upper() + "_TRAINING",
            "goal": goals[0].upper() if goals else "GENERAL_FITNESS"
        }
        
        workout_plan = self.template_service.get_workout_plan(
            user_profile=user_profile,
            session_duration=available_time
        )
        
        # Create prompt for Google AI
        prompt = f"""
        You are an expert fitness coach. Create a comprehensive monthly workout plan for {month_name} {year} using the provided template structure:
        
        USER PROFILE:
        - User ID: {user_id}
        - Age: {age}
        - Weight: {weight}kg
        - Fitness Level: {fitness_level}
        - Goals: {', '.join(goals)}
        - Available Time per Session: {available_time} minutes
        - Available Equipment: {', '.join(equipment)}
        - Injuries/Limitations: {injuries_limitations or 'None'}
        - Preferred Activities: {preferred_activities or 'No specific preferences'}
        
        TEMPLATE CONTEXT:
        {json.dumps(workout_plan, indent=2)}
        
        MONTHLY REQUIREMENTS:
        - Month: {month_name} {year} ({days_in_month} days)
        - Create a complete day-by-day workout schedule
        - Use the exercises and structure from the template above
        - Include progressive overload throughout the month based on template progression
        - Plan proper rest and recovery days according to age considerations
        - Vary workout types to prevent boredom
        - Consider weekly micro-cycles within the monthly plan
        
        RETURN FORMAT - STRICT JSON ONLY:
        {{
            "monthly_overview": {{
                "month": {month},
                "year": {year},
                "total_days": {days_in_month},
                "workout_days": "number",
                "rest_days": "number",
                "training_phases": ["week1_focus", "week2_focus", "week3_focus", "week4_focus"]
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
                    "day_of_week": "day_name",
                    "workout_type": "Upper Body | Lower Body | Full Body | Cardio | Rest",
                    "duration": "number",
                    "intensity": "Low | Moderate | High",
                    "exercises": [
                        {{
                            "name": "Exercise Name (from template)",
                            "type": "strength | cardio | flexibility",
                            "sets": "number",
                            "reps": "number or range",
                            "rest_time": "seconds",
                            "notes": "Form cues or modifications from template",
                            "progression": "How to advance this exercise"
                        }}
                    ],
                    "warm_up": ["warm_up_exercise_1", "warm_up_exercise_2"],
                    "cool_down": ["cool_down_exercise_1", "cool_down_exercise_2"]
                }}
            }},
            "progression_plan": {{
                "week_1_adjustments": "What to focus on in week 1",
                "week_2_adjustments": "How to progress in week 2",
                "week_3_adjustments": "Peak training adjustments",
                "week_4_adjustments": "Recovery week modifications"
            }},
            "safety_guidelines": [
                "Important safety consideration 1",
                "Important safety consideration 2"
            ],
            "template_context": {{
                "user_profile": {json.dumps(workout_plan.get('user_profile', {}))},
                "age_considerations": {json.dumps(workout_plan.get('age_considerations', {}))},
                "objective_modifications": {json.dumps(workout_plan.get('objective_modifications', {}))}
            }}
        }}
        
        IMPORTANT:
        1. Use ONLY exercises from the provided template
        2. Follow the workout structure guidelines from the template
        3. Apply age-specific considerations from the template
        4. Include objective-specific modifications from the template
        5. Return ONLY valid JSON - no additional text, explanations, markdown, or code blocks
        6. Ensure all property names are enclosed in double quotes
        7. Use double quotes for all string values, never single quotes
        8. Do NOT include trailing commas before closing brackets or braces
        9. Do NOT include comments in the JSON
        10. The response must start with {{ and end with }}
        """
        
        try:
            # Generate content using Google AI
            response = self.model.generate_content(prompt)
            result_text = response.text
            
            # Log raw AI response for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"🏋️ AI Workout Response received. Length: {len(result_text)}")
            logger.info(f"🏋️ Raw AI Response (first 1000 chars): {repr(result_text[:1000])}")
            if len(result_text) > 1000:
                logger.info(f"🏋️ Raw AI Response (last 500 chars): {repr(result_text[-500:])}")
            
            # Clean up the response (remove markdown formatting if present)
            if result_text.startswith('```json'):
                result_text = result_text.replace('```json', '').replace('```', '').strip()
                logger.info("🧹 Cleaned markdown formatting from AI workout response")
            
            # Use robust JSON parsing with multiple fallback strategies
            workout_plan_data = self._robust_json_parse(result_text)
            
            return {
                "success": True,
                "workout_plan": workout_plan_data,
                "template_used": workout_plan.get('user_profile', {}),
                "generation_timestamp": datetime.now().isoformat()
            }
        except json.JSONDecodeError as e:
            # Enhanced error reporting for JSON parsing issues
            error_line = e.lineno if hasattr(e, 'lineno') else "unknown"
            error_col = e.colno if hasattr(e, 'colno') else "unknown"
            error_pos = e.pos if hasattr(e, 'pos') else "unknown"
            
            # Try to show context around the error
            context = ""
            if hasattr(e, 'pos') and e.pos and 'result_text' in locals():
                start = max(0, e.pos - 100)
                end = min(len(result_text), e.pos + 100)
                context = result_text[start:end]
            
            return {
                "success": False,
                "error": f"JSON parsing error: {str(e)}",
                "error_details": {
                    "line": error_line,
                    "column": error_col,
                    "position": error_pos,
                    "context": context
                },
                "raw_result": result_text if 'result_text' in locals() else "No result generated"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Generation error: {str(e)}"
            }

    async def generate_monthly_meal_plan(
        self,
        user_id: str,
        month: int,
        year: int,
        dietary_preferences: List[str],
        age: int = 30,
        weight: float = 75.0,
        goals: List[str] = ["maintenance"],
        activity_level: str = "moderately_active",
        allergies: Optional[List[str]] = None,
        calorie_target: Optional[int] = None,
        meal_prep_time: Optional[int] = None,
        budget_range: Optional[str] = None
    ) -> Dict[str, Any]:
        
        # Get number of days in the month
        days_in_month = calendar.monthrange(year, month)[1]
        month_name = calendar.month_name[month]
        
        # Get appropriate meal template based on user profile
        user_profile = {
            "age": age,
            "weight": weight,
            "objectives": goals,
            "activity_level": activity_level,
            "dietary_preferences": dietary_preferences,
            "allergies": allergies or []
        }
        
        meal_plan = self.template_service.get_meal_plan(
            user_profile=user_profile
        )
        
        # Create prompt for Google AI
        prompt = f"""
        You are a certified nutritionist. Create a comprehensive monthly meal plan for {month_name} {year} using the provided template structure:
        
        USER PROFILE:
        - User ID: {user_id}
        - Age: {age}
        - Weight: {weight}kg
        - Goals: {', '.join(goals)}
        - Activity Level: {activity_level}
        - Dietary Preferences: {', '.join(dietary_preferences)}
        - Allergies: {allergies or 'None'}
        - Calorie Target: {calorie_target or 'Auto-calculated'}
        - Meal Prep Time: {meal_prep_time or 'Flexible'} minutes
        - Budget Range: {budget_range or 'Moderate'}
        
        TEMPLATE CONTEXT:
        {json.dumps(meal_plan, indent=2)}
        
        MONTHLY REQUIREMENTS:
        - Month: {month_name} {year} ({days_in_month} days)
        - Create complete daily meal plans for all {days_in_month} days
        - Use nutrition targets and meal options from the template above
        - Include variety to prevent dietary boredom
        - Consider seasonal ingredients for {month_name}
        - Include meal prep suggestions for efficiency
        - Plan weekly grocery lists
        
        RETURN FORMAT - STRICT JSON ONLY:
        {{
            "monthly_overview": {{
                "month": {month},
                "year": {year},
                "total_days": {days_in_month},
                "nutrition_targets": {{
                    "daily_calories": "from template",
                    "protein_grams": "number",
                    "carbs_grams": "number",
                    "fat_grams": "number"
                }},
                "meal_themes": ["week1_theme", "week2_theme", "week3_theme", "week4_theme"]
            }},
            "weekly_meal_prep": {{
                "week_1": {{
                    "prep_focus": "Basic meal prep introduction",
                    "batch_cook_items": ["item1", "item2"],
                    "shopping_list": ["ingredient1", "ingredient2"]
                }},
                "week_2": {{
                    "prep_focus": "Protein prep and snack planning",
                    "batch_cook_items": ["item1", "item2"],
                    "shopping_list": ["ingredient1", "ingredient2"]
                }},
                "week_3": {{
                    "prep_focus": "Advanced meal combinations",
                    "batch_cook_items": ["item1", "item2"],
                    "shopping_list": ["ingredient1", "ingredient2"]
                }},
                "week_4": {{
                    "prep_focus": "Sustainable long-term habits",
                    "batch_cook_items": ["item1", "item2"],
                    "shopping_list": ["ingredient1", "ingredient2"]
                }}
            }},
            "daily_meals": {{
                "1": {{
                    "date": "YYYY-MM-DD",
                    "day_of_week": "day_name",
                    "meals": {{
                        "breakfast": {{
                            "name": "Meal name from template",
                            "calories": "number",
                            "protein": "number",
                            "carbs": "number",
                            "fat": "number",
                            "ingredients": ["ingredient1", "ingredient2"],
                            "prep_time": "number",
                            "instructions": "Brief cooking instructions"
                        }},
                        "lunch": {{
                            "name": "Meal name from template",
                            "calories": "number",
                            "protein": "number",
                            "carbs": "number",
                            "fat": "number",
                            "ingredients": ["ingredient1", "ingredient2"],
                            "prep_time": "number",
                            "instructions": "Brief cooking instructions"
                        }},
                        "dinner": {{
                            "name": "Meal name from template",
                            "calories": "number",
                            "protein": "number",
                            "carbs": "number",
                            "fat": "number",
                            "ingredients": ["ingredient1", "ingredient2"],
                            "prep_time": "number",
                            "instructions": "Brief cooking instructions"
                        }},
                        "snacks": [
                            {{
                                "name": "Snack from template",
                                "calories": "number",
                                "timing": "morning/afternoon/evening"
                            }}
                        ]
                    }},
                    "daily_totals": {{
                        "calories": "number",
                        "protein": "number",
                        "carbs": "number",
                        "fat": "number",
                        "water_glasses": "number"
                    }}
                }}
            }},
            "nutrition_education": {{
                "weekly_tips": [
                    "Week 1 nutrition tip based on template",
                    "Week 2 nutrition tip based on template", 
                    "Week 3 nutrition tip based on template",
                    "Week 4 nutrition tip based on template"
                ],
                "hydration_reminders": "From template hydration guidelines",
                "supplement_recommendations": "Based on age and goals from template"
            }},
            "template_context": {{
                "user_profile": {json.dumps(meal_plan.get('user_profile', {}))},
                "nutrition_targets": {json.dumps(meal_plan.get('nutrition_targets', {}))},
                "age_guidance": {json.dumps(meal_plan.get('age_guidance', {}))}
            }}
        }}
        
        IMPORTANT:
        1. Use ONLY meal options from the provided template
        2. Follow nutrition targets from the template
        3. Apply age-specific guidance from the template
        4. Include hydration guidelines from the template
        5. Return ONLY valid JSON - no additional text, explanations, markdown, or code blocks
        6. Ensure all property names are enclosed in double quotes
        7. Use double quotes for all string values, never single quotes
        8. Do NOT include trailing commas before closing brackets or braces
        9. Do NOT include comments in the JSON
        10. The response must start with {{ and end with }}
        """
        
        try:
            # Generate content using Google AI
            response = self.model.generate_content(prompt)
            result_text = response.text
            
            # Log raw AI response for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"🤖 AI Response received. Length: {len(result_text)}")
            logger.info(f"🤖 Raw AI Response (first 1000 chars): {repr(result_text[:1000])}")
            if len(result_text) > 1000:
                logger.info(f"🤖 Raw AI Response (last 500 chars): {repr(result_text[-500:])}")
            
            # Clean up the response (remove markdown formatting if present)
            if result_text.startswith('```json'):
                result_text = result_text.replace('```json', '').replace('```', '').strip()
                logger.info("🧹 Cleaned markdown formatting from AI response")
            
            # Use robust JSON parsing with multiple fallback strategies
            meal_plan_data = self._robust_json_parse(result_text)
            
            return {
                "success": True,
                "meal_plan": meal_plan_data,
                "template_used": meal_plan.get('user_profile', {}),
                "generation_timestamp": datetime.now().isoformat()
            }
        except json.JSONDecodeError as e:
            # Enhanced error reporting for JSON parsing issues
            error_line = e.lineno if hasattr(e, 'lineno') else "unknown"
            error_col = e.colno if hasattr(e, 'colno') else "unknown"
            error_pos = e.pos if hasattr(e, 'pos') else "unknown"
            
            # Try to show context around the error
            context = ""
            if hasattr(e, 'pos') and e.pos and 'result_text' in locals():
                start = max(0, e.pos - 100)
                end = min(len(result_text), e.pos + 100)
                context = result_text[start:end]
            
            return {
                "success": False,
                "error": f"JSON parsing error: {str(e)}",
                "error_details": {
                    "line": error_line,
                    "column": error_col,
                    "position": error_pos,
                    "context": context
                },
                "raw_result": result_text if 'result_text' in locals() else "No result generated"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Generation error: {str(e)}"
            }

    def _clean_ai_json_response(self, json_text: str) -> str:
        """
        Clean up common AI-generated JSON issues that cause parsing errors.
        """
        import re
        
        # Remove any leading/trailing whitespace
        json_text = json_text.strip()
        
        # Remove invalid control characters (except \n, \r, \t)
        json_text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', json_text)
        
        # Remove any trailing commas before closing brackets/braces
        json_text = re.sub(r',(\s*[}\]])', r'\1', json_text)
        
        # Fix unquoted property names (basic cases)
        # Look for patterns like: word: (not preceded by quote)
        json_text = re.sub(r'([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\1"\2":', json_text)
        
        # Fix single quotes to double quotes for strings (more careful approach)
        # Replace single quotes around values after colons
        json_text = re.sub(r":\s*'([^']*)'", r': "\1"', json_text)
        
        # Remove any comments (// or /* */)
        json_text = re.sub(r'//.*?$', '', json_text, flags=re.MULTILINE)
        json_text = re.sub(r'/\*.*?\*/', '', json_text, flags=re.DOTALL)
        
        # Fix common issues with object properties that aren't quoted
        # This pattern catches property names that should be quoted
        json_text = re.sub(r'([{,]\s*)([a-zA-Z_][a-zA-Z0-9_\-]*)\s*:', r'\1"\2":', json_text)
        
        return json_text

    def _fix_truncated_json(self, json_text: str):
        """
        Fix JSON that was truncated during AI generation
        """
        import re
        import logging
        
        logger = logging.getLogger(__name__)
        original_length = len(json_text)
        
        # Step 1: Remove trailing incomplete content
        # Remove incomplete string at the end (common with truncation)
        json_text = re.sub(r',\s*"[^"]*$', '', json_text)
        json_text = re.sub(r':\s*"[^"]*$', '', json_text)
        
        # Remove trailing commas
        json_text = re.sub(r',\s*$', '', json_text)
        
        # Remove incomplete key-value pairs
        json_text = re.sub(r'"[^"]*":\s*$', '', json_text)
        
        # Remove incomplete keys (quotes without closing)
        json_text = re.sub(r',\s*"[^"]*$', '', json_text)
        json_text = re.sub(r'{\s*"[^"]*$', '{', json_text)
        json_text = re.sub(r'\[\s*"[^"]*$', '[', json_text)
        
        # Step 2: Balance braces and brackets
        # Count opening and closing
        open_braces = json_text.count('{')
        close_braces = json_text.count('}')
        open_brackets = json_text.count('[')
        close_brackets = json_text.count(']')
        
        # Add missing closing elements
        missing_braces = open_braces - close_braces
        missing_brackets = open_brackets - close_brackets
        
        if missing_braces > 0:
            logger.info(f"🔧 Adding {missing_braces} missing closing braces")
            json_text += '}' * missing_braces
        elif missing_braces < 0:
            # Remove extra closing braces from the end
            logger.info(f"🔧 Removing {abs(missing_braces)} extra closing braces")
            for _ in range(abs(missing_braces)):
                json_text = json_text.rsplit('}', 1)[0]
        
        if missing_brackets > 0:
            logger.info(f"🔧 Adding {missing_brackets} missing closing brackets")
            json_text += ']' * missing_brackets
        elif missing_brackets < 0:
            # Remove extra closing brackets from the end
            logger.info(f"🔧 Removing {abs(missing_brackets)} extra closing brackets")
            for _ in range(abs(missing_brackets)):
                json_text = json_text.rsplit(']', 1)[0]
        
        if len(json_text) != original_length:
            logger.info(f"🔧 JSON truncation repair: {original_length} -> {len(json_text)} chars")
        
        return json_text

    def _robust_json_parse(self, json_text: str):
        """
        Try multiple approaches to parse potentially malformed JSON.
        """
        import json
        import logging
        
        logger = logging.getLogger(__name__)
        
        # Log the original content for debugging
        logger.info(f"Attempting to parse JSON. Content length: {len(json_text)}")
        logger.debug(f"Original JSON content (first 500 chars): {repr(json_text[:500])}")
        if len(json_text) > 500:
            logger.debug(f"Original JSON content (last 500 chars): {repr(json_text[-500:])}")
        
        # First try: direct parse
        try:
            result = json.loads(json_text)
            logger.info("✅ SUCCESS: Direct JSON parse successful")
            return result
        except json.JSONDecodeError as e:
            logger.warning(f"❌ Direct parse failed: {e}")
        
        # Second try: clean and parse
        try:
            cleaned = self._clean_ai_json_response(json_text)
            logger.debug(f"Cleaned JSON (first 500 chars): {repr(cleaned[:500])}")
            result = json.loads(cleaned)
            logger.info("✅ SUCCESS: Cleaned JSON parse successful")
            return result
        except json.JSONDecodeError as e:
            logger.warning(f"❌ Cleaned parse failed: {e}")
        
        # Third try: more aggressive cleaning
        try:
            # Remove any text before the first { or [
            import re
            original_text = json_text
            match = re.search(r'[{\[]', json_text)
            if match:
                json_text = json_text[match.start():]
                logger.debug(f"Removed {match.start()} characters from start")
            
            # Remove any text after the last } or ]
            json_text = json_text[::-1]  # reverse
            match = re.search(r'[}\]]', json_text)
            if match:
                json_text = json_text[match.start():]
                logger.debug(f"Removed text from end, new length: {len(json_text)}")
            json_text = json_text[::-1]  # reverse back
            
            cleaned = self._clean_ai_json_response(json_text)
            logger.debug(f"Aggressively cleaned JSON (first 500 chars): {repr(cleaned[:500])}")
            result = json.loads(cleaned)
            logger.info("✅ SUCCESS: Aggressively cleaned JSON parse successful")
            return result
        except json.JSONDecodeError as e:
            logger.error(f"❌ Aggressive cleaning failed: {e}")
        
        # Fourth try: Fix truncation and parse
        try:
            logger.info("🔧 Attempting truncation repair...")
            fixed_json = self._fix_truncated_json(json_text)
            cleaned = self._clean_ai_json_response(fixed_json)
            result = json.loads(cleaned)
            logger.info("✅ SUCCESS: Truncation-repaired JSON parse successful")
            return result
        except json.JSONDecodeError as e:
            logger.error(f"❌ Truncation repair failed: {e}")
        
        # Log the failure details and save raw content for debugging
        logger.error("🚨 ALL JSON PARSING ATTEMPTS FAILED")
        logger.error(f"Original content length: {len(original_text if 'original_text' in locals() else json_text)}")
        logger.error(f"Final content to parse: {repr(json_text[:1000])}")
        
        # Save the failing content to a debug file
        try:
            import os
            from datetime import datetime
            debug_dir = "/tmp/fit_hero_debug"
            os.makedirs(debug_dir, exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            debug_file = f"{debug_dir}/failed_json_{timestamp}.txt"
            
            with open(debug_file, 'w') as f:
                f.write("=== FAILED JSON CONTENT ===\n")
                f.write(f"Length: {len(json_text)}\n")
                f.write(f"Timestamp: {datetime.now().isoformat()}\n")
                f.write("=== RAW CONTENT ===\n")
                f.write(json_text)
            
            logger.error(f"💾 Raw JSON content saved to: {debug_file}")
        except Exception as save_error:
            logger.error(f"❌ Failed to save debug content: {save_error}")
        
        # If all else fails, raise the original error with more context
        error_msg = f"Failed to parse JSON after multiple attempts. Content length: {len(json_text)}, starts with: {repr(json_text[:50])}"
        raise json.JSONDecodeError(error_msg, json_text, 0)
