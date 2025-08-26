import google.generativeai as genai
import json
from typing import Dict, Any
from config_simple import GOOGLE_API_KEY

class SimpleAIService:
    def __init__(self):
        if not GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        
        genai.configure(api_key=GOOGLE_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
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
