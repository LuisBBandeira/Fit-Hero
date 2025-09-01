from crewai import Agent, Task, Crew, Process
from typing import List, Dict, Any, Optional
import os
import json
import google.generativeai as genai
from config import GOOGLE_API_KEY
import calendar
from datetime import datetime, timedelta

class MonthlyPlanService:
    def __init__(self):
        if not GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        
        # Configure Google AI
        genai.configure(api_key=GOOGLE_API_KEY)
        
        # Initialize specialized agents for monthly planning
        self.monthly_fitness_coach = self._create_monthly_fitness_coach_agent()
        self.monthly_nutritionist = self._create_monthly_nutritionist_agent()

    def _create_monthly_fitness_coach_agent(self) -> Agent:
        return Agent(
            role='Monthly Fitness Coach',
            goal='Create comprehensive monthly workout plans with progressive training cycles',
            backstory="""You are an expert fitness coach specializing in periodization and 
            long-term training program design. You understand how to structure monthly cycles 
            with proper progression, recovery periods, and adaptation phases. You create 
            detailed workout plans that build systematically throughout the month while 
            preventing overtraining and plateaus.""",
            verbose=True,
            allow_delegation=False,
            llm="gemini/gemini-2.0-flash-exp"
        )

    def _create_monthly_nutritionist_agent(self) -> Agent:
        return Agent(
            role='Monthly Nutritionist',
            goal='Design comprehensive monthly meal plans with variety and nutritional balance',
            backstory="""You are a certified nutritionist specializing in monthly meal planning 
            and nutritional periodization. You understand how to create varied, balanced meal 
            plans that support training cycles, prevent dietary boredom, and ensure optimal 
            nutrition throughout the month. You consider seasonal ingredients, meal prep 
            efficiency, and budget constraints.""",
            verbose=True,
            allow_delegation=False,
            llm="gemini/gemini-2.0-flash-exp"
        )

    async def generate_monthly_workout_plan(
        self,
        user_id: str,
        month: int,
        year: int,
        fitness_level: str,
        goals: List[str],
        available_time: int,
        equipment: List[str],
        injuries_limitations: Optional[List[str]] = None,
        preferred_activities: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        
        # Get number of days in the month
        days_in_month = calendar.monthrange(year, month)[1]
        month_name = calendar.month_name[month]
        
        # Create detailed monthly workout task
        task = Task(
            description=f"""
            Create a comprehensive monthly workout plan for {month_name} {year} with the following specifications:
            
            USER PROFILE:
            - User ID: {user_id}
            - Fitness Level: {fitness_level}
            - Goals: {', '.join(goals)}
            - Available Time per Session: {available_time} minutes
            - Available Equipment: {', '.join(equipment)}
            - Injuries/Limitations: {injuries_limitations or 'None'}
            - Preferred Activities: {preferred_activities or 'No specific preferences'}
            
            MONTHLY REQUIREMENTS:
            - Month: {month_name} {year} ({days_in_month} days)
            - Create a complete day-by-day workout schedule
            - Include progressive overload throughout the month
            - Plan proper rest and recovery days
            - Vary workout types to prevent boredom
            - Consider weekly micro-cycles within the monthly plan
            
            RETURN FORMAT - STRICT JSON ONLY:
            {{
                "monthly_overview": {{
                    "month": {month},
                    "year": {year},
                    "total_days": {days_in_month},
                    "workout_days": number,
                    "rest_days": number,
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
                        "workout_type": "Upper Body" | "Lower Body" | "Full Body" | "Cardio" | "Rest",
                        "duration": number,
                        "intensity": "Low" | "Moderate" | "High",
                        "exercises": [
                            {{
                                "name": "Exercise Name",
                                "type": "strength" | "cardio" | "flexibility",
                                "sets": number,
                                "reps": "number or range",
                                "rest_time": "seconds",
                                "notes": "Form cues or modifications",
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
                "alternative_exercises": {{
                    "if_equipment_unavailable": ["alt_exercise_1", "alt_exercise_2"],
                    "if_injury_flares": ["modified_exercise_1", "modified_exercise_2"]
                }}
            }}
            
            CRITICAL: Return ONLY valid JSON. No additional text, explanations, or markdown formatting.
            Each day (1-{days_in_month}) must have a complete workout entry.
            """,
            agent=self.monthly_fitness_coach,
            expected_output="A comprehensive monthly workout plan in valid JSON format"
        )

        # Create and run the crew
        crew = Crew(
            agents=[self.monthly_fitness_coach],
            tasks=[task],
            process=Process.sequential
        )

        try:
            result = crew.kickoff()
            
            # Parse the JSON response
            if isinstance(result, str):
                return json.loads(result)
            else:
                return result
                
        except json.JSONDecodeError as e:
            raise ValueError(f"AI returned invalid JSON: {e}")
        except Exception as e:
            raise RuntimeError(f"Failed to generate monthly workout plan: {e}")

    async def generate_monthly_meal_plan(
        self,
        user_id: str,
        month: int,
        year: int,
        dietary_preferences: List[str],
        allergies: Optional[List[str]] = None,
        calorie_target: Optional[int] = None,
        meal_prep_time: Optional[int] = None,
        budget_range: Optional[str] = None
    ) -> Dict[str, Any]:
        
        # Get number of days in the month
        days_in_month = calendar.monthrange(year, month)[1]
        month_name = calendar.month_name[month]
        
        # Create detailed monthly meal task
        task = Task(
            description=f"""
            Create a comprehensive monthly meal plan for {month_name} {year} with the following specifications:
            
            USER PROFILE:
            - User ID: {user_id}
            - Dietary Preferences: {', '.join(dietary_preferences)}
            - Allergies: {allergies or 'None'}
            - Calorie Target: {calorie_target or 'Not specified'}
            - Meal Prep Time Available: {meal_prep_time or 'Not specified'} minutes
            - Budget Range: {budget_range or 'Not specified'}
            
            MONTHLY REQUIREMENTS:
            - Month: {month_name} {year} ({days_in_month} days)
            - Create complete daily meal plans
            - Ensure nutritional variety throughout the month
            - Consider seasonal ingredients for {month_name}
            - Plan for meal prep efficiency
            - Include shopping lists organized by week
            - Balance convenience with nutrition
            
            RETURN FORMAT - STRICT JSON ONLY:
            {{
                "monthly_overview": {{
                    "month": {month},
                    "year": {year},
                    "total_days": {days_in_month},
                    "average_daily_calories": number,
                    "meal_prep_strategy": "strategy description",
                    "seasonal_focus": "seasonal ingredients and themes"
                }},
                "weekly_themes": {{
                    "week_1": {{
                        "theme": "Mediterranean Week",
                        "focus": "Fresh vegetables and lean proteins",
                        "prep_strategy": "Prep strategy for this week"
                    }},
                    "week_2": {{
                        "theme": "Asian Fusion Week", 
                        "focus": "Stir-fries and balanced bowls",
                        "prep_strategy": "Prep strategy for this week"
                    }},
                    "week_3": {{
                        "theme": "Comfort Classics Week",
                        "focus": "Healthy versions of comfort foods",
                        "prep_strategy": "Prep strategy for this week"
                    }},
                    "week_4": {{
                        "theme": "Fresh & Light Week",
                        "focus": "Salads and light meals",
                        "prep_strategy": "Prep strategy for this week"
                    }}
                }},
                "daily_meals": {{
                    "1": {{
                        "day_of_week": "day_name",
                        "breakfast": {{
                            "name": "Meal Name",
                            "calories": number,
                            "protein": "grams",
                            "carbs": "grams", 
                            "fat": "grams",
                            "prep_time": "minutes",
                            "ingredients": ["ingredient1", "ingredient2"],
                            "instructions": ["step1", "step2"],
                            "meal_prep_notes": "prep ahead tips"
                        }},
                        "lunch": {{
                            "name": "Meal Name",
                            "calories": number,
                            "protein": "grams",
                            "carbs": "grams",
                            "fat": "grams", 
                            "prep_time": "minutes",
                            "ingredients": ["ingredient1", "ingredient2"],
                            "instructions": ["step1", "step2"],
                            "meal_prep_notes": "prep ahead tips"
                        }},
                        "dinner": {{
                            "name": "Meal Name",
                            "calories": number,
                            "protein": "grams",
                            "carbs": "grams",
                            "fat": "grams",
                            "prep_time": "minutes", 
                            "ingredients": ["ingredient1", "ingredient2"],
                            "instructions": ["step1", "step2"],
                            "meal_prep_notes": "prep ahead tips"
                        }},
                        "snacks": [
                            {{
                                "name": "Snack Name",
                                "calories": number,
                                "ingredients": ["ingredient1", "ingredient2"]
                            }}
                        ],
                        "daily_totals": {{
                            "calories": number,
                            "protein": number,
                            "carbs": number,
                            "fat": number,
                            "fiber": number
                        }}
                    }}
                }},
                "weekly_shopping_lists": {{
                    "week_1": {{
                        "proteins": ["item1", "item2"],
                        "vegetables": ["item1", "item2"],
                        "fruits": ["item1", "item2"],
                        "grains": ["item1", "item2"],
                        "pantry": ["item1", "item2"],
                        "estimated_cost": "budget estimate"
                    }}
                }},
                "meal_prep_schedule": {{
                    "sunday_prep": ["prep task 1", "prep task 2"],
                    "wednesday_refresh": ["mid-week prep tasks"],
                    "daily_tasks": ["daily preparation needs"]
                }},
                "nutritional_balance": {{
                    "monthly_protein_avg": number,
                    "monthly_carb_avg": number,
                    "monthly_fat_avg": number,
                    "micronutrient_focus": ["vitamin", "mineral"]
                }}
            }}
            
            CRITICAL: Return ONLY valid JSON. No additional text, explanations, or markdown formatting.
            Each day (1-{days_in_month}) must have complete breakfast, lunch, dinner, and snack entries.
            """,
            agent=self.monthly_nutritionist,
            expected_output="A comprehensive monthly meal plan in valid JSON format"
        )

        # Create and run the crew
        crew = Crew(
            agents=[self.monthly_nutritionist],
            tasks=[task],
            process=Process.sequential
        )

        try:
            result = crew.kickoff()
            
            # Parse the JSON response
            if isinstance(result, str):
                return json.loads(result)
            else:
                return result
                
        except json.JSONDecodeError as e:
            raise ValueError(f"AI returned invalid JSON: {e}")
        except Exception as e:
            raise RuntimeError(f"Failed to generate monthly meal plan: {e}")
