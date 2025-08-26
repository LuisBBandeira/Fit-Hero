interface WorkoutPlanRequest {
  user_id: string;
  fitness_level: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  available_time: number;
  equipment: string[];
  injuries_limitations?: string[];
  preferred_activities?: string[];
}

interface ProgressAnalysisRequest {
  user_id: string;
  workout_data: Record<string, unknown>;
  weight_data: Record<string, unknown>;
  meal_data: Record<string, unknown>;
  goals: string[];
}

interface MealRecommendationRequest {
  user_id: string;
  dietary_preferences: string[];
  allergies?: string[];
  calorie_target?: number;
  meal_prep_time?: number;
  budget_range?: string;
}

interface DailyPlanRequest {
  user_id: string;
  fitness_level?: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[];
  available_time?: number;
  equipment?: string[];
  dietary_preferences?: string[];
  calorie_target?: number;
  allergies?: string[];
}

class AIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';
  }

  private async makeRequest(endpoint: string, data: WorkoutPlanRequest | ProgressAnalysisRequest | MealRecommendationRequest | DailyPlanRequest) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`AI Service error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.log(`AI service unavailable for ${endpoint}, using mock response:`, error);
      
      // Return mock responses when AI service is unavailable
      if (endpoint === '/generate-workout-plan') {
        return this.getMockWorkoutPlan(data as WorkoutPlanRequest);
      } else if (endpoint === '/analyze-progress') {
        return this.getMockProgressAnalysis(data as ProgressAnalysisRequest);
      } else if (endpoint === '/recommend-meals') {
        return this.getMockMealRecommendations(data as MealRecommendationRequest);
      }
      
      throw error;
    }
  }

  private getMockWorkoutPlan(request: WorkoutPlanRequest) {
    return {
      workout_plan: {
        weekly_schedule: `${request.available_time <= 30 ? "3-4 days" : "4-5 days"} per week`,
        fitness_level: request.fitness_level,
        goals: request.goals,
        routines: [
          {
            day: "Day 1",
            focus: "Upper Body Strength",
            exercises: [
              { name: "Push-ups", sets: 3, reps: request.fitness_level === 'beginner' ? "5-8" : "10-15", rest: "60s" },
              { name: "Pike Push-ups", sets: 3, reps: request.fitness_level === 'beginner' ? "3-5" : "8-12", rest: "60s" },
              { name: "Tricep Dips", sets: 3, reps: request.fitness_level === 'beginner' ? "5-8" : "10-15", rest: "60s" }
            ]
          },
          {
            day: "Day 2", 
            focus: "Lower Body Power",
            exercises: [
              { name: "Bodyweight Squats", sets: 3, reps: request.fitness_level === 'beginner' ? "8-12" : "15-20", rest: "60s" },
              { name: "Lunges", sets: 3, reps: request.fitness_level === 'beginner' ? "6 each leg" : "12 each leg", rest: "60s" },
              { name: "Calf Raises", sets: 3, reps: "15-25", rest: "45s" }
            ]
          },
          {
            day: "Day 3",
            focus: "Core & Cardio",
            exercises: [
              { name: "Plank", sets: 3, reps: request.fitness_level === 'beginner' ? "20-30s" : "45-60s", rest: "60s" },
              { name: "Mountain Climbers", sets: 3, reps: request.fitness_level === 'beginner' ? "20" : "30", rest: "60s" },
              { name: "Jumping Jacks", sets: 3, reps: "30", rest: "45s" }
            ]
          }
        ],
        progression: "Increase reps by 2-3 each week. Add extra set when comfortable.",
        safety_notes: [
          "Warm up for 5-10 minutes before starting",
          "Focus on proper form over speed",
          "Stop if you feel pain",
          "Stay hydrated throughout workout"
        ],
        estimated_duration: `${request.available_time || 45} minutes`,
        equipment_used: request.equipment.length > 0 ? request.equipment : ["bodyweight"]
      }
    };
  }

  private getMockProgressAnalysis(request: ProgressAnalysisRequest) {
    return {
      analysis: {
        progress_summary: "Great progress this month! You've been consistent with workouts and nutrition.",
        trends: [
          "Workout frequency increased by 20%",
          "Average workout duration: 35 minutes",
          "Consistency improved week over week"
        ],
        recommendations: [
          "Continue current workout routine",
          "Consider adding one extra strength training session",
          "Focus on progressive overload",
          "Maintain current meal timing"
        ],
        goal_achievement: "On track to meet fitness goals",
        next_steps: [
          "Increase workout intensity gradually",
          "Track protein intake more closely",
          "Consider adding flexibility training"
        ],
        motivation_score: 85
      }
    };
  }

  private getMockMealRecommendations(request: MealRecommendationRequest) {
    const targetCalories = request.calorie_target || 2000;
    
    return {
      meal_plan: {
        daily_calories: targetCalories,
        meals: {
          breakfast: {
            name: "Protein-Packed Oatmeal",
            calories: Math.round(targetCalories * 0.25),
            protein: "25g",
            carbs: "45g", 
            fat: "8g",
            ingredients: ["oats", "protein powder", "banana", "almond milk", "berries"],
            prep_time: 10,
            instructions: "Mix oats with protein powder, add almond milk, top with banana and berries"
          },
          lunch: {
            name: "Quinoa Power Bowl",
            calories: Math.round(targetCalories * 0.35),
            protein: "30g",
            carbs: "50g",
            fat: "15g", 
            ingredients: ["quinoa", "grilled chicken", "mixed vegetables", "avocado", "olive oil"],
            prep_time: 20,
            instructions: "Cook quinoa, grill chicken, mix with vegetables and dressing"
          },
          dinner: {
            name: "Salmon with Sweet Potato",
            calories: Math.round(targetCalories * 0.30),
            protein: "35g",
            carbs: "40g",
            fat: "18g",
            ingredients: ["salmon fillet", "sweet potato", "broccoli", "lemon", "herbs"],
            prep_time: 25,
            instructions: "Bake salmon and sweet potato, steam broccoli, season with herbs"
          },
          snacks: [
            {
              name: "Greek Yogurt with Nuts",
              calories: Math.round(targetCalories * 0.10),
              description: "High protein snack with healthy fats"
            }
          ]
        },
        nutrition_notes: [
          "Balanced macronutrient distribution",
          "High protein content supports muscle building",
          "Complex carbs provide sustained energy"
        ],
        shopping_list: ["quinoa", "salmon", "sweet potato", "greek yogurt", "mixed nuts", "vegetables"]
      }
    };
  }

  async generateWorkoutPlan(request: WorkoutPlanRequest) {
    return this.makeRequest('/generate-workout-plan', request);
  }

  async analyzeProgress(request: ProgressAnalysisRequest) {
    return this.makeRequest('/analyze-progress', request);
  }

  async recommendMeals(request: MealRecommendationRequest) {
    return this.makeRequest('/recommend-meals', request);
  }

  async generateDailyPlans(request: DailyPlanRequest) {
    return this.makeRequest('/generate-daily-plans', request);
  }

  // Health check for AI service
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return await response.json();
    } catch (error) {
      console.log('AI service health check failed:', error);
      return { status: 'unavailable', ai_available: false };
    }
  }
}

export const aiService = new AIService();
