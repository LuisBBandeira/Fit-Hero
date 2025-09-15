#!/usr/bin/env python3
"""
Standardized Template Service
Service for loading and processing unified workout and meal templates
"""

import json
import os
from typing import Dict, Any, List

class StandardizedTemplateService:
    def __init__(self):
        self.workout_template = self._load_workout_template()
        self.meal_template = self._load_meal_template()

    def _load_workout_template(self) -> Dict[str, Any]:
        """Load the unified workout template from JSON file"""
        template_path = os.path.join(os.path.dirname(__file__), "../templates/workout_templates.json")
        try:
            with open(template_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Warning: Workout template file not found at {template_path}")
            return {}

    def _load_meal_template(self) -> Dict[str, Any]:
        """Load the unified meal template from JSON file"""
        template_path = os.path.join(os.path.dirname(__file__), "../templates/meal_templates.json")
        try:
            with open(template_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Warning: Meal template file not found at {template_path}")
            return {}

    def get_standardized_exercises(self, session_duration: int) -> Dict[str, Any]:
        """Get standardized exercises based on session duration"""
        exercises = self.workout_template.get("standardized_exercises", {})
        
        # Filter exercises based on session duration
        if session_duration <= 30:
            category = "quick_workouts"
        elif session_duration <= 60:
            category = "standard_workouts"
        else:
            category = "extended_workouts"
        
        return exercises.get(category, exercises.get("standard_workouts", {}))

    def get_execution_defaults(self, age: int, training_environment: str, goal: str, fitness_level: str) -> Dict[str, Any]:
        """Get execution defaults based on user profile"""
        # Determine age group
        age_group = self._determine_age_group(age)
        
        # Get defaults from template
        defaults = self.workout_template.get("execution_defaults", {})
        age_defaults = defaults.get(age_group, {})
        
        # Get environment-specific defaults
        env_defaults = age_defaults.get(training_environment, age_defaults.get("HOME_TRAINING", {}))
        
        # Get goal-specific adjustments
        goal_defaults = env_defaults.get(goal, env_defaults.get("GENERAL_FITNESS", {}))
        
        # Get fitness level adjustments
        level_defaults = goal_defaults.get(fitness_level, goal_defaults.get("beginner", {}))
        
        return level_defaults

    def _get_fallback_defaults(self, age_group: str, fitness_level: str) -> Dict[str, Any]:
        """Get fallback defaults if specific combination not found"""
        return {
            "sets": {"min": 2, "max": 4, "default": 3},
            "reps": {"min": 8, "max": 15, "default": 12},
            "rest_seconds": {"min": 30, "max": 90, "default": 60},
            "progression": "weekly",
            "intensity": "moderate"
        }

    def prepare_ai_customization_context(self, user_profile: Dict[str, Any], exercises: Dict[str, Any], 
                                       execution_defaults: Dict[str, Any]) -> Dict[str, str]:
        """Prepare context for AI customization"""
        context = {
            "user_summary": f"Age {user_profile.get('age', 30)}, {user_profile.get('fitness_level', 'beginner')} level",
            "goal": user_profile.get("goal", "GENERAL_FITNESS"),
            "environment": user_profile.get("training_environment", "HOME_TRAINING"),
            "medical_conditions": ", ".join(user_profile.get("medical_conditions", [])) or "None",
            "injuries": ", ".join(user_profile.get("injuries", [])) or "None",
            "exercise_count": str(len(exercises.get("exercises", []))),
            "default_sets": str(execution_defaults.get("sets", {}).get("default", 3)),
            "default_reps": str(execution_defaults.get("reps", {}).get("default", 12)),
            "default_rest": str(execution_defaults.get("rest_seconds", {}).get("default", 60))
        }
        return context

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

    def get_meal_plan(self, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create complete meal plan structure for AI customization
        """
        # Get age and weight from user profile
        age = user_profile.get("age", 30)
        weight = user_profile.get("weight", 70.0)
        
        # Determine categories
        age_group = self._determine_age_group(age)
        weight_category = self._determine_weight_category(weight)
        objectives = user_profile.get("objectives", ["general_health"])
        nutrition_objective = self._determine_primary_nutrition_objective(objectives)
        
        # Get meal template structure
        meal_structure = self.meal_template.get("meal_structure", {})
        nutrition_guidelines = self.meal_template.get("nutrition_guidelines", {})
        
        # Get specific guidelines for user
        age_guidelines = nutrition_guidelines.get(age_group, {})
        weight_guidelines = age_guidelines.get(weight_category, {})
        objective_guidelines = weight_guidelines.get(nutrition_objective, {})
        
        return {
            "meal_structure": meal_structure,
            "nutrition_guidelines": objective_guidelines,
            "user_categories": {
                "age_group": age_group,
                "weight_category": weight_category,
                "nutrition_objective": nutrition_objective
            },
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

    def _determine_age_group(self, age: int) -> str:
        """Determine age group from age"""
        if age < 20:
            return "age_under_20"
        elif age < 26:
            return "age_20_25"
        elif age < 36:
            return "age_26_35"
        elif age < 46:
            return "age_36_45"
        elif age < 56:
            return "age_46_55"
        else:
            return "age_over_55"

    def _determine_weight_category(self, weight: float) -> str:
        """Determine weight category for calorie targeting"""
        if weight < 60:
            return "under_60kg"
        elif weight < 80:
            return "60_80kg"
        else:
            return "over_80kg"

    def _determine_primary_nutrition_objective(self, objectives: List[str]) -> str:
        """Determine primary nutrition objective from user objectives"""
        objective_priority = {
            "weight_loss": 1,
            "muscle_building": 2,
            "strength": 2,
            "endurance": 3,
            "general_health": 4
        }
        
        # Find highest priority objective
        primary = "general_health"
        highest_priority = 5
        
        for obj in objectives:
            priority = objective_priority.get(obj.lower(), 4)
            if priority < highest_priority:
                highest_priority = priority
                primary = obj.lower()
        
        return primary

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
