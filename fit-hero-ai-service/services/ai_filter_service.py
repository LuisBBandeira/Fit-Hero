import json
import re
from typing import Dict, Any, List, Optional
from datetime import datetime
import calendar
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIFilterService:
    """
    First layer of filtering for AI-generated monthly plans.
    This service runs on the AI service side to clean and validate
    AI responses before sending them to the main application.
    """
    
    def __init__(self):
        self.workout_required_fields = [
            'monthly_overview', 'weekly_structure', 'daily_workouts',
            'progression_plan', 'safety_guidelines'
        ]
        self.meal_required_fields = [
            'monthly_overview', 'weekly_themes', 'daily_meals',
            'weekly_shopping_lists', 'nutritional_balance'
        ]
    
    def filter_workout_plan(self, raw_response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Filter and clean workout plan data from AI response.
        """
        try:
            logger.info("Starting workout plan filtering...")
            
            # Extract the actual workout data from the response structure
            workout_data = self._extract_workout_data(raw_response)
            
            # Step 1: Validate basic structure
            filtered_data = self._validate_basic_structure(workout_data, self.workout_required_fields)
            
            # Step 2: Clean exercise data
            filtered_data = self._clean_exercise_data(filtered_data)
            
            # Step 3: Sanitize text fields
            filtered_data = self._sanitize_text_fields(filtered_data)
            
            # Step 4: Validate numerical values
            filtered_data = self._validate_workout_numbers(filtered_data)
            
            # Step 5: Ensure daily completeness
            filtered_data = self._ensure_daily_workout_completeness(filtered_data)
            
            logger.info("Workout plan filtering completed successfully")
            return filtered_data
            
        except Exception as e:
            logger.error(f"Error filtering workout plan: {e}")
            raise ValueError(f"Workout plan filtering failed: {e}")
    
    def filter_meal_plan(self, raw_response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Filter and clean meal plan data from AI response.
        """
        try:
            logger.info("Starting meal plan filtering...")
            
            # Extract the actual meal data from the response structure
            meal_data = self._extract_meal_data(raw_response)
            
            # Step 1: Validate basic structure
            filtered_data = self._validate_basic_structure(meal_data, self.meal_required_fields)
            
            # Step 2: Clean meal data
            filtered_data = self._clean_meal_data(filtered_data)
            
            # Step 3: Sanitize text fields
            filtered_data = self._sanitize_text_fields(filtered_data)
            
            # Step 4: Validate nutritional values
            filtered_data = self._validate_nutrition_numbers(filtered_data)
            
            # Step 5: Ensure daily completeness
            filtered_data = self._ensure_daily_meal_completeness(filtered_data)
            
            logger.info("Meal plan filtering completed successfully")
            return filtered_data
            
        except Exception as e:
            logger.error(f"Error filtering meal plan: {e}")
            raise ValueError(f"Meal plan filtering failed: {e}")
    
    def _extract_workout_data(self, raw_response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract the actual workout data from the response structure.
        Handles different response formats from the monthly plan service.
        """
        logger.info("Extracting workout data from response...")
        
        # Case 1: Response with success=True and workout_plan
        if raw_response.get('success') and 'workout_plan' in raw_response:
            logger.info("Found workout_plan in successful response")
            return raw_response['workout_plan']
        
        # Case 2: Direct workout data (for backward compatibility)
        elif 'daily_workouts' in raw_response:
            logger.info("Found direct workout data structure")
            return raw_response
        
        # Case 3: Response with success=False but raw workout data in raw_result
        elif not raw_response.get('success', True) and 'raw_result' in raw_response:
            logger.warning("Response marked as unsuccessful, attempting to parse raw_result...")
            try:
                import json
                # Try to parse the raw_result as it might contain valid JSON
                raw_result = raw_response['raw_result']
                if isinstance(raw_result, str):
                    parsed_data = json.loads(raw_result)
                    logger.info("Successfully parsed workout data from raw_result")
                    return parsed_data
                else:
                    logger.info("Raw result is already parsed")
                    return raw_result
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse raw_result: {e}")
                # Fall through to next case
        
        # Case 4: Response with success=False but workout_plan key exists
        elif not raw_response.get('success', True) and 'workout_plan' in raw_response:
            logger.warning("Response unsuccessful but found workout_plan")
            return raw_response['workout_plan']
        
        # Case 5: Fallback - return the raw response and let validation handle it
        logger.warning("Could not identify workout data structure, using raw response")
        return raw_response
    
    def _extract_meal_data(self, raw_response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract the actual meal data from the response structure.
        Handles different response formats from the monthly plan service.
        """
        logger.info("Extracting meal data from response...")
        
        # Case 1: Response with success=True and meal_plan
        if raw_response.get('success') and 'meal_plan' in raw_response:
            logger.info("Found meal_plan in successful response")
            return raw_response['meal_plan']
        
        # Case 2: Direct meal data (for backward compatibility)
        elif 'daily_meals' in raw_response:
            logger.info("Found direct meal data structure")
            return raw_response
        
        # Case 3: Response with success=False but raw meal data
        elif not raw_response.get('success', True):
            logger.warning("Response marked as unsuccessful, checking for raw data...")
            if 'meal_plan' in raw_response:
                return raw_response['meal_plan']
        
        # Case 4: Fallback - return the raw response and let validation handle it
        logger.warning("Could not identify meal data structure, using raw response")
        return raw_response

    def _validate_basic_structure(self, data: Dict[str, Any], required_fields: List[str]) -> Dict[str, Any]:
        """Validate that all required top-level fields are present."""
        filtered_data = {}
        
        for field in required_fields:
            if field not in data:
                logger.warning(f"Missing required field: {field}")
                # Create empty structure for missing fields
                if field in ['daily_workouts', 'daily_meals']:
                    filtered_data[field] = {}
                elif field in ['weekly_structure', 'weekly_themes']:
                    filtered_data[field] = {}
                else:
                    filtered_data[field] = {}
            else:
                filtered_data[field] = data[field]
        
        return filtered_data
    
    def _clean_exercise_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Clean and validate exercise-specific data."""
        if 'daily_workouts' not in data:
            return data
        
        cleaned_workouts = {}
        
        for day, workout_data in data['daily_workouts'].items():
            if not isinstance(workout_data, dict):
                continue
                
            cleaned_workout = {}
            
            # Clean basic workout info
            cleaned_workout['day_of_week'] = self._sanitize_string(workout_data.get('day_of_week', ''))
            cleaned_workout['workout_type'] = self._sanitize_string(workout_data.get('workout_type', 'Rest'))
            cleaned_workout['duration'] = self._sanitize_number(workout_data.get('duration', 0), min_val=0, max_val=180)
            cleaned_workout['intensity'] = self._sanitize_string(workout_data.get('intensity', 'Moderate'))
            
            # Clean exercises
            exercises = workout_data.get('exercises', [])
            cleaned_exercises = []
            
            for exercise in exercises:
                if isinstance(exercise, dict):
                    cleaned_exercise = {
                        'name': self._sanitize_string(exercise.get('name', '')),
                        'type': self._sanitize_string(exercise.get('type', 'strength')),
                        'sets': self._sanitize_number(exercise.get('sets', 1), min_val=1, max_val=10),
                        'reps': self._sanitize_string(exercise.get('reps', '10')),
                        'rest_time': self._sanitize_string(exercise.get('rest_time', '60')),
                        'notes': self._sanitize_string(exercise.get('notes', '')),
                        'progression': self._sanitize_string(exercise.get('progression', ''))
                    }
                    cleaned_exercises.append(cleaned_exercise)
            
            cleaned_workout['exercises'] = cleaned_exercises
            
            # Clean warm-up and cool-down
            cleaned_workout['warm_up'] = [
                self._sanitize_string(item) for item in workout_data.get('warm_up', [])
                if isinstance(item, str) and item.strip()
            ]
            cleaned_workout['cool_down'] = [
                self._sanitize_string(item) for item in workout_data.get('cool_down', [])
                if isinstance(item, str) and item.strip()
            ]
            
            cleaned_workouts[day] = cleaned_workout
        
        data['daily_workouts'] = cleaned_workouts
        return data
    
    def _clean_meal_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Clean and validate meal-specific data."""
        if 'daily_meals' not in data:
            return data
        
        cleaned_meals = {}
        
        for day, meal_data in data['daily_meals'].items():
            if not isinstance(meal_data, dict):
                continue
                
            cleaned_day = {}
            cleaned_day['day_of_week'] = self._sanitize_string(meal_data.get('day_of_week', ''))
            
            # Clean individual meals
            for meal_type in ['breakfast', 'lunch', 'dinner']:
                meal = meal_data.get(meal_type, {})
                if isinstance(meal, dict):
                    cleaned_meal = {
                        'name': self._sanitize_string(meal.get('name', '')),
                        'calories': self._sanitize_number(meal.get('calories', 0), min_val=0, max_val=2000),
                        'protein': self._sanitize_string(meal.get('protein', '0g')),
                        'carbs': self._sanitize_string(meal.get('carbs', '0g')),
                        'fat': self._sanitize_string(meal.get('fat', '0g')),
                        'prep_time': self._sanitize_string(meal.get('prep_time', '10')),
                        'ingredients': [
                            self._sanitize_string(ingredient) for ingredient in meal.get('ingredients', [])
                            if isinstance(ingredient, str) and ingredient.strip()
                        ],
                        'instructions': [
                            self._sanitize_string(instruction) for instruction in meal.get('instructions', [])
                            if isinstance(instruction, str) and instruction.strip()
                        ],
                        'meal_prep_notes': self._sanitize_string(meal.get('meal_prep_notes', ''))
                    }
                    cleaned_day[meal_type] = cleaned_meal
            
            # Clean snacks
            snacks = meal_data.get('snacks', [])
            cleaned_snacks = []
            for snack in snacks:
                if isinstance(snack, dict):
                    cleaned_snack = {
                        'name': self._sanitize_string(snack.get('name', '')),
                        'calories': self._sanitize_number(snack.get('calories', 0), min_val=0, max_val=500),
                        'ingredients': [
                            self._sanitize_string(ingredient) for ingredient in snack.get('ingredients', [])
                            if isinstance(ingredient, str) and ingredient.strip()
                        ]
                    }
                    cleaned_snacks.append(cleaned_snack)
            
            cleaned_day['snacks'] = cleaned_snacks
            
            # Clean daily totals
            daily_totals = meal_data.get('daily_totals', {})
            if isinstance(daily_totals, dict):
                cleaned_day['daily_totals'] = {
                    'calories': self._sanitize_number(daily_totals.get('calories', 0), min_val=0, max_val=5000),
                    'protein': self._sanitize_number(daily_totals.get('protein', 0), min_val=0, max_val=300),
                    'carbs': self._sanitize_number(daily_totals.get('carbs', 0), min_val=0, max_val=500),
                    'fat': self._sanitize_number(daily_totals.get('fat', 0), min_val=0, max_val=200),
                    'fiber': self._sanitize_number(daily_totals.get('fiber', 0), min_val=0, max_val=100)
                }
            
            cleaned_meals[day] = cleaned_day
        
        data['daily_meals'] = cleaned_meals
        return data
    
    def _sanitize_string(self, value: Any) -> str:
        """Sanitize string values to prevent injection and ensure valid content."""
        if not isinstance(value, str):
            return str(value) if value is not None else ""
        
        # Remove potentially harmful characters
        sanitized = re.sub(r'[<>"\';{}()=]', '', value)
        
        # Limit length
        sanitized = sanitized[:500]
        
        # Remove excessive whitespace
        sanitized = ' '.join(sanitized.split())
        
        return sanitized.strip()
    
    def _sanitize_number(self, value: Any, min_val: float = 0, max_val: float = float('inf')) -> int:
        """Sanitize numerical values with bounds checking."""
        try:
            if isinstance(value, str):
                # Extract numbers from strings like "10 reps" or "30 minutes"
                numbers = re.findall(r'\d+', value)
                if numbers:
                    value = int(numbers[0])
                else:
                    return min_val
            
            num_value = float(value) if value is not None else min_val
            
            # Apply bounds
            return max(min_val, min(max_val, int(num_value)))
            
        except (ValueError, TypeError):
            return int(min_val)
    
    def _sanitize_text_fields(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Recursively sanitize all text fields in the data structure."""
        if isinstance(data, dict):
            return {key: self._sanitize_text_fields(value) for key, value in data.items()}
        elif isinstance(data, list):
            return [self._sanitize_text_fields(item) for item in data]
        elif isinstance(data, str):
            return self._sanitize_string(data)
        else:
            return data
    
    def _validate_workout_numbers(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate numerical values specific to workouts."""
        # Validate monthly overview
        if 'monthly_overview' in data and isinstance(data['monthly_overview'], dict):
            overview = data['monthly_overview']
            overview['workout_days'] = self._sanitize_number(overview.get('workout_days', 20), 10, 31)
            overview['rest_days'] = self._sanitize_number(overview.get('rest_days', 11), 0, 21)
        
        return data
    
    def _validate_nutrition_numbers(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate numerical values specific to nutrition."""
        # Validate monthly overview
        if 'monthly_overview' in data and isinstance(data['monthly_overview'], dict):
            overview = data['monthly_overview']
            overview['average_daily_calories'] = self._sanitize_number(
                overview.get('average_daily_calories', 2000), 1200, 4000
            )
        
        return data
    
    def _ensure_daily_workout_completeness(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure all days of the month have workout entries."""
        if 'monthly_overview' not in data:
            return data
        
        month = data['monthly_overview'].get('month', 1)
        year = data['monthly_overview'].get('year', datetime.now().year)
        days_in_month = calendar.monthrange(year, month)[1]
        
        daily_workouts = data.get('daily_workouts', {})
        
        for day in range(1, days_in_month + 1):
            day_str = str(day)
            if day_str not in daily_workouts:
                # Create a rest day entry
                daily_workouts[day_str] = {
                    'day_of_week': calendar.day_name[calendar.weekday(year, month, day)],
                    'workout_type': 'Rest',
                    'duration': 0,
                    'intensity': 'Low',
                    'exercises': [],
                    'warm_up': [],
                    'cool_down': []
                }
        
        data['daily_workouts'] = daily_workouts
        return data
    
    def _ensure_daily_meal_completeness(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure all days of the month have meal entries."""
        if 'monthly_overview' not in data:
            return data
        
        month = data['monthly_overview'].get('month', 1)
        year = data['monthly_overview'].get('year', datetime.now().year)
        days_in_month = calendar.monthrange(year, month)[1]
        
        daily_meals = data.get('daily_meals', {})
        
        for day in range(1, days_in_month + 1):
            day_str = str(day)
            if day_str not in daily_meals:
                # Create a basic meal day entry
                daily_meals[day_str] = {
                    'day_of_week': calendar.day_name[calendar.weekday(year, month, day)],
                    'breakfast': {
                        'name': 'Basic Breakfast',
                        'calories': 300,
                        'protein': '15g',
                        'carbs': '40g',
                        'fat': '10g',
                        'prep_time': '10',
                        'ingredients': ['Oatmeal', 'Banana', 'Milk'],
                        'instructions': ['Prepare oatmeal according to package directions'],
                        'meal_prep_notes': 'Can be prepared the night before'
                    },
                    'lunch': {
                        'name': 'Simple Lunch',
                        'calories': 400,
                        'protein': '25g',
                        'carbs': '45g',
                        'fat': '15g',
                        'prep_time': '15',
                        'ingredients': ['Chicken breast', 'Rice', 'Vegetables'],
                        'instructions': ['Cook chicken and rice, steam vegetables'],
                        'meal_prep_notes': 'Can be meal prepped for the week'
                    },
                    'dinner': {
                        'name': 'Balanced Dinner',
                        'calories': 500,
                        'protein': '30g',
                        'carbs': '50g',
                        'fat': '20g',
                        'prep_time': '25',
                        'ingredients': ['Fish', 'Sweet potato', 'Green vegetables'],
                        'instructions': ['Bake fish and sweet potato, sauté vegetables'],
                        'meal_prep_notes': 'Fresh ingredients work best'
                    },
                    'snacks': [
                        {
                            'name': 'Healthy Snack',
                            'calories': 150,
                            'ingredients': ['Apple', 'Almond butter']
                        }
                    ],
                    'daily_totals': {
                        'calories': 1350,
                        'protein': 70,
                        'carbs': 135,
                        'fat': 45,
                        'fiber': 25
                    }
                }
        
        data['daily_meals'] = daily_meals
        return data
    
    def validate_workout_plan_structure(self, filtered_data: Dict[str, Any], month: int, year: int) -> Dict[str, Any]:
        """Final validation of workout plan structure before sending to main app."""
        validation_errors = []
        
        # Check required fields
        for field in self.workout_required_fields:
            if field not in filtered_data:
                validation_errors.append(f"Missing required field: {field}")
        
        # Validate monthly overview
        if 'monthly_overview' in filtered_data:
            overview = filtered_data['monthly_overview']
            if overview.get('month') != month:
                validation_errors.append(f"Month mismatch: expected {month}, got {overview.get('month')}")
            if overview.get('year') != year:
                validation_errors.append(f"Year mismatch: expected {year}, got {overview.get('year')}")
        
        # If there are validation errors, create a minimal valid structure
        if validation_errors:
            logger.warning(f"Validation errors found: {validation_errors}")
            filtered_data['validation_errors'] = validation_errors
        
        # Add metadata
        filtered_data['filter_metadata'] = {
            'filtered_at': datetime.utcnow().isoformat(),
            'filter_version': '1.0.0',
            'validation_status': 'passed' if not validation_errors else 'warnings'
        }
        
        return filtered_data
    
    def validate_meal_plan_structure(self, filtered_data: Dict[str, Any], month: int, year: int) -> Dict[str, Any]:
        """Final validation of meal plan structure before sending to main app."""
        validation_errors = []
        
        # Check required fields
        for field in self.meal_required_fields:
            if field not in filtered_data:
                validation_errors.append(f"Missing required field: {field}")
        
        # Validate monthly overview
        if 'monthly_overview' in filtered_data:
            overview = filtered_data['monthly_overview']
            if overview.get('month') != month:
                validation_errors.append(f"Month mismatch: expected {month}, got {overview.get('month')}")
            if overview.get('year') != year:
                validation_errors.append(f"Year mismatch: expected {year}, got {overview.get('year')}")
        
        # If there are validation errors, create a minimal valid structure
        if validation_errors:
            logger.warning(f"Validation errors found: {validation_errors}")
            filtered_data['validation_errors'] = validation_errors
        
        # Add metadata
        filtered_data['filter_metadata'] = {
            'filtered_at': datetime.utcnow().isoformat(),
            'filter_version': '1.0.0',
            'validation_status': 'passed' if not validation_errors else 'warnings'
        }
        
        return filtered_data
