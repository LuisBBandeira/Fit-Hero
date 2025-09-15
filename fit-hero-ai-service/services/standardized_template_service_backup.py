import json
import os
from typing import Dict, List, Any, Optional
from pathlib import Path

class StandardizedTemplateService:
    """
    Unified template service that works with comprehensive workout and meal templates
    """
    
    def __init__(self):
        self.templates_dir = Path(__file__).parent.parent / "templates"
        self.workout_template = self._load_workout_template()
        self.meal_template = self._load_meal_template()
    
    def _load_workout_template(self) -> Dict[str, Any]:
        """Load the unified workout template from JSON file"""
        template_path = self.templates_dir / "workout_templates.json"
        try:
            with open(template_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Workout template file not found at {template_path}")
            return {}
    
    def _load_meal_template(self) -> Dict[str, Any]:
        """Load the unified meal template from JSON file"""
        template_path = self.templates_dir / "meal_templates.json"
        try:
            with open(template_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Meal template file not found at {template_path}")
            return {}

    def get_workout_plan(self, age: int, weight: float, objectives: List[str], 
                        experience: str = "beginner", equipment: str = "gym") -> Dict[str, Any]:
        """
        Get appropriate workout plan based on user profile
        
        Args:
            age: User's age
            weight: User's weight in kg
            objectives: List of user objectives
            experience: User's experience level
            equipment: Available equipment (gym/home)
            
        Returns:
            Customized workout plan
        """
        template = self.workout_template.get("workout_template", {})
        
        # Determine appropriate training environment
        if equipment.lower() == "gym":
            environment = template.get("training_environments", {}).get("gym", {})
        else:
            environment = template.get("training_environments", {}).get("home", {})
        
        # Get experience-appropriate exercises
        if experience == "beginner":
            exercises = environment.get("beginner_exercises", {})
        elif experience == "intermediate": 
            exercises = environment.get("intermediate_exercises", {})
        else:
            exercises = environment.get("advanced_exercises", {})
        
        # Get workout structure for experience level
        structure = template.get("workout_structure_by_level", {}).get(experience, {})
        
        # Get age-specific considerations
        age_group = self._determine_age_group(age)
        age_considerations = template.get("age_specific_considerations", {}).get(age_group, {})
        
        # Get objective-specific modifications
        objective_mods = {}
        for objective in objectives:
            if objective in template.get("objective_specific_modifications", {}):
                objective_mods[objective] = template["objective_specific_modifications"][objective]
        
        return {
            "user_profile": {
                "age": age,
                "weight": weight,
                "experience": experience,
                "objectives": objectives,
                "equipment": equipment
            },
            "workout_structure": structure,
            "exercises": exercises,
            "age_considerations": age_considerations,
            "objective_modifications": objective_mods,
            "monthly_progression": template.get("monthly_progression_framework", {})
        }

    def get_meal_plan(self, age: int, weight: float, objectives: List[str], 
                     activity_level: str = "moderately_active") -> Dict[str, Any]:
        """
        Get appropriate meal plan based on user profile
        
        Args:
            age: User's age
            weight: User's weight in kg
            objectives: List of user objectives
            activity_level: User's activity level
            
        Returns:
            Customized meal plan
        """
        template = self.meal_template.get("meal_template", {})
        
        # Determine primary objective for meal planning
        primary_objective = self._determine_primary_nutrition_objective(objectives)
        
        # Get calorie targets
        weight_category = self._determine_weight_category(weight)
        calorie_targets = template.get("calorie_targets_by_profile", {}).get(primary_objective, {})
        target_calories = calorie_targets.get(weight_category, "2000-2200")
        
        # Get macro distribution
        macros = template.get("macro_distributions", {}).get(primary_objective, {})
        
        # Get meal options
        meal_options = template.get("meal_options", {})
        
        # Get meal timing strategy
        meal_timing = template.get("meal_timing_by_objective", {}).get(primary_objective, {})
        
        # Get age-specific guidance
        age_group = self._determine_age_group(age)
        age_guidance = template.get("age_specific_guidance", {}).get(age_group, {})
        
        # Get hydration guidelines
        hydration = template.get("hydration_guidelines", {})
        
        return {
            "user_profile": {
                "age": age,
                "weight": weight,
                "activity_level": activity_level,
                "objectives": objectives,
                "primary_objective": primary_objective
            },
            "nutrition_targets": {
                "calories": target_calories,
                "macros": macros
            },
            "meal_options": meal_options,
            "meal_timing": meal_timing,
            "hydration": hydration,
            "age_guidance": age_guidance,
            "monthly_progression": template.get("monthly_progression", {}),
            "special_considerations": template.get("special_considerations", {})
        }

    def _determine_age_group(self, age: int) -> str:
        """Determine age group from age"""
        if age < 26:
            return "18-25"
        elif age < 36:
            return "26-35"
        elif age < 46:
            return "36-45"
        elif age < 61:
            return "46-60"
        else:
            return "60+"

    def _determine_weight_category(self, weight: float) -> str:
        """Determine weight category for calorie targeting"""
        if weight < 70:
            return "light_person"
        elif weight < 85:
            return "medium_person"
        else:
            return "heavy_person"

    def _determine_primary_nutrition_objective(self, objectives: List[str]) -> str:
        """Determine primary nutrition objective from user objectives"""
        # Priority order for nutrition planning
        nutrition_priority = [
            "weight_loss",
            "muscle_building", 
            "athletic_performance",
            "health_optimization",
            "maintenance"
        ]
        
        for priority_obj in nutrition_priority:
            if priority_obj in objectives:
                return priority_obj
        
        # Default to maintenance if no specific nutrition objective found
        return "maintenance"

    def get_user_recommendations(self, age: int, weight: float, objectives: List[str], 
                               experience: str = "beginner", equipment: str = "gym",
                               activity_level: str = "moderately_active") -> Dict[str, Any]:
        """
        Get complete recommendations for both workout and meal planning
        """
        workout_plan = self.get_workout_plan(age, weight, objectives, experience, equipment)
        meal_plan = self.get_meal_plan(age, weight, objectives, activity_level)
        
        return {
            "user_profile": {
                "age": age,
                "weight": weight,
                "objectives": objectives,
                "experience": experience,
                "equipment": equipment,
                "activity_level": activity_level
            },
            "workout_plan": workout_plan,
            "meal_plan": meal_plan,
            "integration_notes": self._get_integration_notes(objectives, age, experience)
        }

    def _get_integration_notes(self, objectives: List[str], age: int, experience: str) -> Dict[str, str]:
        """Get notes on how to integrate workout and nutrition plans"""
        notes = {}
        
        if "weight_loss" in objectives:
            notes["weight_loss"] = "Combine consistent workouts with calorie deficit. Focus on protein to maintain muscle during weight loss."
        
        if "muscle_building" in objectives:
            notes["muscle_building"] = "Time protein intake around workouts. Ensure adequate calories to support muscle growth."
        
        if age >= 60:
            notes["senior_considerations"] = "Allow extra recovery time between workouts. Focus on nutrient-dense foods for health maintenance."
        
        if experience == "beginner":
            notes["beginner_approach"] = "Start slowly with both exercise and nutrition changes. Focus on building sustainable habits."
        
        return notes
    
    def get_workout_plan(self, user_profile: Dict[str, Any], session_duration: int) -> Dict[str, Any]:
        """
        Create complete workout plan structure for AI customization
        """
        # Step 1: Get standardized exercises (instant)
        exercises = self.get_standardized_exercises(session_duration)
        
        # Step 2: Get execution defaults
        execution_defaults = self.get_execution_defaults(
            age=user_profile.get("age", 30),
            training_environment=user_profile.get("training_environment", "HOME_TRAINING"),
            goal=user_profile.get("goal", "GENERAL_FITNESS"),
            fitness_level=user_profile.get("fitness_level", "beginner")
        )
        
        if not execution_defaults:
            execution_defaults = self._get_fallback_defaults("age_26_35", "beginner")
        
        # Step 3: Prepare AI customization context
        ai_context = self.prepare_ai_customization_context(
            user_profile, exercises, execution_defaults
        )
        
        return {
            "exercises": exercises,
            "execution_defaults": execution_defaults,
            "ai_customization_context": ai_context,
            "requires_ai_customization": self._requires_ai_customization(user_profile)
        }
    
    def _requires_ai_customization(self, user_profile: Dict[str, Any]) -> bool:
        """
        Determine if user needs AI customization or can use defaults
        """
        return (
            len(user_profile.get("medical_conditions", [])) > 0 or
            len(user_profile.get("injuries", [])) > 0 or
            len(user_profile.get("dietary_restrictions", [])) > 0 or
            len(user_profile.get("forbidden_foods", [])) > 0 or
            user_profile.get("age", 30) > 55 or
            user_profile.get("age", 30) < 20
        )
    
    def get_system_summary(self) -> Dict[str, Any]:
        """Get summary of standardized system"""
        return {
            "standardized_exercises": {
                "total_exercises": "Available from templates",
                "categories": "Gym and home exercises",
                "consistency": "Same exercises for all users"
            },
            "ai_customization": {
                "focus": ["sets", "reps", "rest", "modifications", "safety"],
                "triggers": ["medical conditions", "injuries", "age extremes", "dietary needs"],
                "speed": "Fast generation with template structure"
            },
            "benefits": [
                "Consistent exercise foundation",
                "Easy progress tracking",
                "Safe, pre-vetted movements", 
                "Fast generation",
                "Personalized execution"
            ]
        }
