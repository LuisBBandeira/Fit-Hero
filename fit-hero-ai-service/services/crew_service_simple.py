from crewai import Agent, Task, Crew, Process
from typing import List, Dict, Any, Optional
import os
import json
from config import GOOGLE_API_KEY, CREWAI_CONFIG

class CrewService:
    def __init__(self):
        if not GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        
        # Initialize agents
        self.fitness_coach = self._create_fitness_coach_agent()
        self.nutritionist = self._create_nutritionist_agent()
        self.progress_analyst = self._create_progress_analyst_agent()
    
    def _create_fitness_coach_agent(self) -> Agent:
        """Create a fitness coach agent specialized in workout planning"""
        return Agent(
            role="Fitness Coach",
            goal="Create personalized workout plans based on user's fitness level, goals, and available time",
            backstory="""You are an experienced fitness coach with expertise in strength training, 
            cardiovascular health, and functional fitness. You understand different fitness levels 
            and can adapt workouts accordingly.""",
            verbose=True,
            allow_delegation=False,
            llm=CREWAI_CONFIG
        )
    
    def _create_nutritionist_agent(self) -> Agent:
        """Create a nutritionist agent specialized in meal planning"""
        return Agent(
            role="Nutritionist",
            goal="Provide personalized meal recommendations based on fitness goals and dietary preferences",
            backstory="""You are a certified nutritionist with deep knowledge of sports nutrition, 
            dietary requirements for different fitness goals, and meal planning for optimal health.""",
            verbose=True,
            allow_delegation=False,
            llm=CREWAI_CONFIG
        )
    
    def _create_progress_analyst_agent(self) -> Agent:
        """Create a progress analyst agent specialized in fitness tracking"""
        return Agent(
            role="Progress Analyst",
            goal="Analyze user progress data and provide insights for fitness improvement",
            backstory="""You are a data analyst specialized in fitness metrics, progress tracking, 
            and providing actionable insights to help users achieve their fitness goals.""",
            verbose=True,
            allow_delegation=False,
            llm=CREWAI_CONFIG
        )
    
    def generate_workout_plan(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a personalized workout plan"""
        try:
            task = Task(
                description=f"""
                Create a comprehensive workout plan for a user with the following details:
                - Fitness Level: {user_data.get('fitness_level', 'beginner')}
                - Goals: {user_data.get('goals', 'general fitness')}
                - Available Time: {user_data.get('available_time', '30 minutes')}
                - Equipment: {user_data.get('equipment', 'basic')}
                - Experience: {user_data.get('experience', 'novice')}
                
                The workout plan should include:
                1. Weekly schedule (number of days)
                2. Daily workout routines with specific exercises
                3. Sets, reps, and rest periods
                4. Progression guidelines
                5. Safety considerations
                
                Format the response as a JSON object with structured workout data.
                """,
                expected_output="A detailed workout plan in JSON format",
                agent=self.fitness_coach
            )
            
            crew = Crew(
                agents=[self.fitness_coach],
                tasks=[task],
                verbose=True,
                process=Process.sequential
            )
            
            result = crew.kickoff()
            
            # Try to parse as JSON, fallback to text if needed
            try:
                return {"workout_plan": json.loads(result)}
            except json.JSONDecodeError:
                return {"workout_plan": {"description": str(result)}}
                
        except Exception as e:
            return {"error": f"Failed to generate workout plan: {str(e)}"}
    
    def generate_meal_recommendations(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized meal recommendations"""
        try:
            task = Task(
                description=f"""
                Create personalized meal recommendations for a user with the following details:
                - Goals: {user_data.get('goals', 'general health')}
                - Dietary Preferences: {user_data.get('dietary_preferences', 'no restrictions')}
                - Activity Level: {user_data.get('activity_level', 'moderate')}
                - Allergies: {user_data.get('allergies', 'none')}
                - Daily Calorie Target: {user_data.get('calorie_target', 'maintain weight')}
                
                Provide:
                1. Daily meal plan (breakfast, lunch, dinner, snacks)
                2. Nutritional breakdown
                3. Preparation time estimates
                4. Shopping list suggestions
                5. Meal prep tips
                
                Format the response as a JSON object with structured meal data.
                """,
                expected_output="A detailed meal plan in JSON format",
                agent=self.nutritionist
            )
            
            crew = Crew(
                agents=[self.nutritionist],
                tasks=[task],
                verbose=True,
                process=Process.sequential
            )
            
            result = crew.kickoff()
            
            # Try to parse as JSON, fallback to text if needed
            try:
                return {"meal_plan": json.loads(result)}
            except json.JSONDecodeError:
                return {"meal_plan": {"description": str(result)}}
                
        except Exception as e:
            return {"error": f"Failed to generate meal recommendations: {str(e)}"}
    
    def analyze_progress(self, progress_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze user progress and provide insights"""
        try:
            task = Task(
                description=f"""
                Analyze the user's fitness progress based on the following data:
                - Current Stats: {progress_data.get('current_stats', {})}
                - Historical Data: {progress_data.get('historical_data', [])}
                - Goals: {progress_data.get('goals', {})}
                - Time Period: {progress_data.get('time_period', '30 days')}
                
                Provide:
                1. Progress summary and trends
                2. Goal achievement analysis
                3. Areas of improvement
                4. Recommendations for optimization
                5. Motivational insights
                
                Format the response as a JSON object with structured analysis.
                """,
                expected_output="A detailed progress analysis in JSON format",
                agent=self.progress_analyst
            )
            
            crew = Crew(
                agents=[self.progress_analyst],
                tasks=[task],
                verbose=True,
                process=Process.sequential
            )
            
            result = crew.kickoff()
            
            # Try to parse as JSON, fallback to text if needed
            try:
                return {"analysis": json.loads(result)}
            except json.JSONDecodeError:
                return {"analysis": {"description": str(result)}}
                
        except Exception as e:
            return {"error": f"Failed to analyze progress: {str(e)}"}
