from crewai import Agent, Task, Crew, Process
from typing import List, Dict, Any, Optional
import os
import json
import google.generativeai as genai
from config import GOOGLE_API_KEY, CREWAI_CONFIG

class CrewService:
    def __init__(self):
        if not GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        
        # Configure Google AI
        genai.configure(api_key=GOOGLE_API_KEY)
        
        # Initialize agents
        self.fitness_coach = self._create_fitness_coach_agent()
        self.nutritionist = self._create_nutritionist_agent()
        self.progress_analyst = self._create_progress_analyst_agent()

    def _create_fitness_coach_agent(self) -> Agent:
        return Agent(
            role='Fitness Coach',
            goal='Create personalized workout plans that are safe, effective, and tailored to individual needs',
            backstory="""You are an experienced fitness coach with over 10 years of experience 
            helping people achieve their fitness goals. You understand different fitness levels, 
            body mechanics, and how to progressively build strength and endurance while 
            preventing injuries.""",
            verbose=True,
            allow_delegation=False,
            llm="gemini/gemini-2.0-flash-exp"
        )

    def _create_nutritionist_agent(self) -> Agent:
        return Agent(
            role='Nutritionist',
            goal='Provide personalized meal recommendations that support fitness goals and dietary preferences',
            backstory="""You are a certified nutritionist with expertise in sports nutrition 
            and meal planning. You understand how nutrition impacts fitness performance, 
            recovery, and body composition. You can create meal plans for various dietary 
            preferences and restrictions.""",
            verbose=True,
            allow_delegation=False,
            llm="gemini/gemini-2.0-flash-exp"
        )

    def _create_progress_analyst_agent(self) -> Agent:
        return Agent(
            role='Progress Analyst',
            goal='Analyze user fitness data to provide insights and recommendations for improvement',
            backstory="""You are a data analyst specializing in fitness and health metrics. 
            You can interpret workout data, weight trends, and nutrition logs to identify 
            patterns, progress, and areas for improvement. You provide actionable insights 
            to help users stay motivated and reach their goals.""",
            verbose=True,
            allow_delegation=False,
            llm="gemini/gemini-2.0-flash-exp"
        )

    async def generate_workout_plan(
        self,
        user_id: str,
        fitness_level: str,
        goals: List[str],
        available_time: int,
        equipment: List[str],
        injuries_limitations: Optional[List[str]] = None,
        preferred_activities: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        
        task = Task(
            description=f"""
            Create a personalized workout plan for a user with the following specifications:
            - Fitness Level: {fitness_level}
            - Goals: {', '.join(goals)}
            - Available Time per Session: {available_time} minutes
            - Available Equipment: {', '.join(equipment)}
            - Injuries/Limitations: {injuries_limitations or 'None'}
            - Preferred Activities: {preferred_activities or 'No specific preferences'}
            
            The workout plan should include:
            1. Weekly schedule (number of days, rest days)
            2. Specific exercises for each workout day
            3. Sets, reps, and progression guidelines
            4. Warm-up and cool-down routines
            5. Safety considerations
            6. Modifications for the user's fitness level
            
            IMPORTANT: Return ONLY a valid JSON object with the following structure:
            {{
                "weekly_schedule": {{
                    "days_per_week": number,
                    "rest_days": ["day1", "day2"]
                }},
                "workout_days": [
                    {{
                        "day": "Monday",
                        "focus": "Upper Body",
                        "warm_up": ["exercise1", "exercise2"],
                        "exercises": [
                            {{
                                "name": "Exercise Name",
                                "sets": number,
                                "reps": "rep range",
                                "notes": "specific instructions"
                            }}
                        ],
                        "cool_down": ["exercise1", "exercise2"]
                    }}
                ],
                "progression_guidelines": "how to progress over time",
                "safety_considerations": ["safety tip 1", "safety tip 2"],
                "modifications": {{
                    "beginner": "modifications for beginners",
                    "advanced": "modifications for advanced users"
                }}
            }}
            """,
            agent=self.fitness_coach,
            expected_output="A comprehensive workout plan in JSON format with weekly schedule, exercises, and guidelines"
        )

        crew = Crew(
            agents=[self.fitness_coach],
            tasks=[task],
            verbose=True,
            process=Process.sequential
        )

        result = crew.kickoff()
        
        try:
            # Try to parse as JSON, fallback to structured text if needed
            return json.loads(result)
        except json.JSONDecodeError:
            return {"workout_plan": result, "format": "text"}

    async def analyze_progress(
        self,
        user_id: str,
        workout_data: Dict[str, Any],
        weight_data: Dict[str, Any],
        meal_data: Dict[str, Any],
        goals: List[str]
    ) -> Dict[str, Any]:
        
        task = Task(
            description=f"""
            Analyze the user's fitness progress and provide insights:
            
            Workout Data: {json.dumps(workout_data, indent=2)}
            Weight Data: {json.dumps(weight_data, indent=2)}
            Meal Data: {json.dumps(meal_data, indent=2)}
            Goals: {', '.join(goals)}
            
            Provide analysis on:
            1. Progress towards goals
            2. Workout consistency and performance trends
            3. Weight/body composition changes
            4. Nutrition adherence
            5. Recommendations for improvement
            6. Motivation and encouragement
            7. Potential adjustments to current plan
            
            IMPORTANT: Return ONLY a valid JSON object with the following structure:
            {{
                "goal_progress": {{
                    "overall_score": number_between_0_and_100,
                    "goals_analysis": {{
                        "goal_name": {{
                            "progress": "description",
                            "score": number_between_0_and_100
                        }}
                    }}
                }},
                "workout_analysis": {{
                    "consistency_score": number_between_0_and_100,
                    "performance_trends": "analysis",
                    "recommendations": ["recommendation1", "recommendation2"]
                }},
                "weight_analysis": {{
                    "trend": "increasing/decreasing/stable",
                    "progress": "analysis",
                    "recommendations": ["recommendation1", "recommendation2"]
                }},
                "nutrition_analysis": {{
                    "adherence_score": number_between_0_and_100,
                    "patterns": "analysis",
                    "recommendations": ["recommendation1", "recommendation2"]
                }},
                "motivation_message": "encouraging message",
                "plan_adjustments": {{
                    "workout_adjustments": "suggested changes",
                    "nutrition_adjustments": "suggested changes"
                }}
            }}
            """,
            agent=self.progress_analyst,
            expected_output="Comprehensive progress analysis in JSON format with insights and recommendations"
        )

        crew = Crew(
            agents=[self.progress_analyst],
            tasks=[task],
            verbose=True,
            process=Process.sequential
        )

        result = crew.kickoff()
        
        try:
            return json.loads(result)
        except json.JSONDecodeError:
            return {"analysis": result, "format": "text"}

    async def recommend_meals(
        self,
        user_id: str,
        dietary_preferences: List[str],
        allergies: Optional[List[str]] = None,
        calorie_target: Optional[int] = None,
        meal_prep_time: Optional[int] = None,
        budget_range: Optional[str] = None
    ) -> Dict[str, Any]:
        
        task = Task(
            description=f"""
            Create personalized meal recommendations based on:
            - Dietary Preferences: {', '.join(dietary_preferences)}
            - Allergies: {allergies or 'None'}
            - Daily Calorie Target: {calorie_target or 'Not specified'}
            - Meal Prep Time Available: {meal_prep_time or 'Not specified'} minutes
            - Budget Range: {budget_range or 'Not specified'}
            
            Provide:
            1. Daily meal plan (breakfast, lunch, dinner, snacks)
            2. Recipes with ingredients and instructions
            3. Nutritional information (calories, macros)
            4. Shopping list
            5. Meal prep tips
            6. Alternative options for variety
            
            IMPORTANT: Return ONLY a valid JSON object with the following structure:
            {{
                "daily_meal_plan": {{
                    "breakfast": {{
                        "name": "Meal Name",
                        "calories": number,
                        "macros": {{"protein": number, "carbs": number, "fat": number}},
                        "ingredients": ["ingredient1", "ingredient2"],
                        "instructions": ["step1", "step2"],
                        "prep_time": number_minutes
                    }},
                    "lunch": {{"...": "same structure"}},
                    "dinner": {{"...": "same structure"}},
                    "snacks": [
                        {{
                            "name": "Snack Name",
                            "calories": number,
                            "ingredients": ["ingredient1"]
                        }}
                    ]
                }},
                "weekly_variety": {{
                    "breakfast_alternatives": ["option1", "option2"],
                    "lunch_alternatives": ["option1", "option2"],
                    "dinner_alternatives": ["option1", "option2"]
                }},
                "shopping_list": {{
                    "proteins": ["item1", "item2"],
                    "vegetables": ["item1", "item2"],
                    "grains": ["item1", "item2"],
                    "dairy": ["item1", "item2"],
                    "other": ["item1", "item2"]
                }},
                "meal_prep_tips": ["tip1", "tip2", "tip3"],
                "total_daily_nutrition": {{
                    "calories": number,
                    "protein": number,
                    "carbs": number,
                    "fat": number
                }}
            }}
            
            Ensure all recommendations align with the dietary preferences and restrictions.
            """,
            agent=self.nutritionist,
            expected_output="Comprehensive meal recommendations in JSON format with recipes and nutritional info"
        )

        crew = Crew(
            agents=[self.nutritionist],
            tasks=[task],
            verbose=True,
            process=Process.sequential
        )

        result = crew.kickoff()
        
        try:
            return json.loads(result)
        except json.JSONDecodeError:
            return {"recommendations": result, "format": "text"}
