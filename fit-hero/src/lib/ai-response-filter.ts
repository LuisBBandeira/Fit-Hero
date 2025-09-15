import { z } from 'zod';

// Validation schemas for AI responses
const WorkoutExerciseSchema = z.object({
  name: z.string().min(1).max(100),
  sets: z.number().int().min(1).max(10),
  reps: z.string().max(20), // Can be "8-12" or "30s" etc.
  rest: z.string().max(10), // Like "60s" or "2min"
  notes: z.string().max(200).optional()
});

const WorkoutRoutineSchema = z.object({
  day: z.string().min(1).max(50),
  focus: z.string().min(1).max(100),
  exercises: z.array(WorkoutExerciseSchema).min(1).max(15)
});

const WorkoutPlanSchema = z.object({
  weekly_schedule: z.string().max(100),
  fitness_level: z.enum(['beginner', 'intermediate', 'advanced']),
  goals: z.array(z.string()).max(10),
  routines: z.array(WorkoutRoutineSchema).min(1).max(7),
  progression: z.string().max(500),
  safety_notes: z.array(z.string().max(200)).max(10),
  estimated_duration: z.string().max(50),
  equipment_used: z.array(z.string().max(50)).max(20)
});

const MealSchema = z.object({
  name: z.string().min(1).max(100),
  calories: z.number().int().min(0).max(2000),
  protein: z.string().max(20),
  carbs: z.string().max(20),
  fat: z.string().max(20),
  ingredients: z.array(z.string().max(50)).max(20),
  prep_time: z.number().int().min(0).max(240).optional(),
  instructions: z.string().max(1000).optional()
});

const MealPlanSchema = z.object({
  daily_calories: z.number().int().min(800).max(5000),
  meals: z.object({
    breakfast: MealSchema,
    lunch: MealSchema,
    dinner: MealSchema,
    snacks: z.array(z.object({
      name: z.string().max(50),
      calories: z.number().int().min(0).max(500),
      description: z.string().max(200)
    })).max(5)
  }),
  nutrition_notes: z.array(z.string().max(300)).max(10),
  shopping_list: z.array(z.string().max(50)).max(50).optional()
});

const ProgressAnalysisSchema = z.object({
  progress_summary: z.string().max(500),
  trends: z.array(z.string().max(200)).max(10),
  recommendations: z.array(z.string().max(300)).max(15),
  goal_achievement: z.string().max(100),
  next_steps: z.array(z.string().max(200)).max(10),
  motivation_score: z.number().min(0).max(100).optional(),
  areas_for_improvement: z.array(z.string().max(200)).max(10).optional()
});

// Allowed/blocked content filters
const BLOCKED_KEYWORDS = [
  'medication', 'pills', 'drugs', 'steroids', 'supplements',
  'extreme', 'dangerous', 'harmful', 'injury', 'pain',
  'doctor', 'medical', 'prescription', 'diagnosis'
];

const ALLOWED_EQUIPMENT = [
  'bodyweight', 'dumbbells', 'barbells', 'resistance bands',
  'kettlebells', 'pull-up bar', 'yoga mat', 'stability ball',
  'jump rope', 'treadmill', 'stationary bike', 'elliptical'
];

const ALLOWED_EXERCISE_TYPES = [
  'push-ups', 'squats', 'lunges', 'planks', 'burpees',
  'jumping jacks', 'mountain climbers', 'sit-ups', 'crunches',
  'deadlifts', 'bench press', 'overhead press', 'rows',
  'pull-ups', 'chin-ups', 'dips', 'leg raises'
];

export class AIResponseFilter {
  /**
   */
  static validateWorkoutPlan(aiResponse: Record<string, unknown>): {
    isValid: boolean;
    data?: unknown;
    errors?: string[];
  } {
    try {
      const errors: string[] = [];

      const result = WorkoutPlanSchema.safeParse(aiResponse.workout_plan);
      if (!result.success) {
        return {
          isValid: false,
          errors: result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
        };
      }

      const workoutPlan = result.data;

      // Content safety checks
      const allText = JSON.stringify(workoutPlan).toLowerCase();
      const foundBlockedKeywords = BLOCKED_KEYWORDS.filter(keyword => 
        allText.includes(keyword.toLowerCase())
      );

      if (foundBlockedKeywords.length > 0) {
        errors.push(`Contains blocked keywords: ${foundBlockedKeywords.join(', ')}`);
      }

      // Equipment validation
      const invalidEquipment = workoutPlan.equipment_used.filter(
        equipment => !ALLOWED_EQUIPMENT.some(allowed => 
          equipment.toLowerCase().includes(allowed.toLowerCase())
        )
      );

      if (invalidEquipment.length > 0) {
        errors.push(`Invalid equipment: ${invalidEquipment.join(', ')}`);
      }

      // Exercise name validation (basic check)
      for (const routine of workoutPlan.routines) {
        for (const exercise of routine.exercises) {
          const exerciseName = exercise.name.toLowerCase();
          const isValidExercise = ALLOWED_EXERCISE_TYPES.some(allowed =>
            exerciseName.includes(allowed) || 
            allowed.includes(exerciseName.split(' ')[0])
          );

          if (!isValidExercise && exerciseName.length > 3) {
            // Allow if it's a reasonable exercise name (basic heuristic)
            const hasValidTerms = ['push', 'pull', 'squat', 'lunge', 'press', 'raise', 'curl', 'extension', 'fly', 'row'].some(term =>
              exerciseName.includes(term)
            );
            
            if (!hasValidTerms) {
              errors.push(`Potentially invalid exercise: ${exercise.name}`);
            }
          }
        }
      }

      if (errors.length > 0) {
        return { isValid: false, errors };
      }

      // Sanitize and return clean data
      return {
        isValid: true,
        data: this.sanitizeWorkoutPlan(workoutPlan)
      };

    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Validates and sanitizes a meal plan from AI
   */
  static validateMealPlan(aiResponse: Record<string, unknown>): {
    isValid: boolean;
    data?: unknown;
    errors?: string[];
  } {
    try {
      const result = MealPlanSchema.safeParse(aiResponse.meal_plan);
      if (!result.success) {
        return {
          isValid: false,
          errors: result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
        };
      }

      const mealPlan = result.data;
      const errors: string[] = [];

      // Safety checks for meal content
      const allText = JSON.stringify(mealPlan).toLowerCase();
      const foundBlockedKeywords = BLOCKED_KEYWORDS.filter(keyword => 
        allText.includes(keyword.toLowerCase())
      );

      if (foundBlockedKeywords.length > 0) {
        errors.push(`Contains blocked keywords: ${foundBlockedKeywords.join(', ')}`);
      }

      // Calorie validation
      if (mealPlan.daily_calories < 1000 || mealPlan.daily_calories > 4000) {
        errors.push('Daily calories outside safe range (1000-4000)');
      }

      if (errors.length > 0) {
        return { isValid: false, errors };
      }

      return {
        isValid: true,
        data: this.sanitizeMealPlan(mealPlan)
      };

    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Validates and sanitizes progress analysis from AI
   */
  static validateProgressAnalysis(aiResponse: Record<string, unknown>): {
    isValid: boolean;
    data?: unknown;
    errors?: string[];
  } {
    try {
      const result = ProgressAnalysisSchema.safeParse(aiResponse.analysis);
      if (!result.success) {
        return {
          isValid: false,
          errors: result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
        };
      }

      const analysis = result.data;
      const errors: string[] = [];

      // Content safety checks
      const allText = JSON.stringify(analysis).toLowerCase();
      const foundBlockedKeywords = BLOCKED_KEYWORDS.filter(keyword => 
        allText.includes(keyword.toLowerCase())
      );

      if (foundBlockedKeywords.length > 0) {
        errors.push(`Contains blocked keywords: ${foundBlockedKeywords.join(', ')}`);
      }

      if (errors.length > 0) {
        return { isValid: false, errors };
      }

      return {
        isValid: true,
        data: this.sanitizeProgressAnalysis(analysis)
      };

    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Sanitize workout plan data
   */
  private static sanitizeWorkoutPlan(workoutPlan: z.infer<typeof WorkoutPlanSchema>) {
    return {
      ...workoutPlan,
      routines: workoutPlan.routines.map((routine: z.infer<typeof WorkoutRoutineSchema>) => ({
        ...routine,
        exercises: routine.exercises.map((exercise: z.infer<typeof WorkoutExerciseSchema>) => ({
          ...exercise,
          name: this.sanitizeText(exercise.name),
          sets: Math.min(Math.max(exercise.sets, 1), 10), // Limit to 1-10 sets
          reps: this.sanitizeText(exercise.reps),
          rest: this.sanitizeText(exercise.rest)
        }))
      })),
      safety_notes: workoutPlan.safety_notes.map((note: string) => this.sanitizeText(note)),
      progression: this.sanitizeText(workoutPlan.progression)
    };
  }

  /**
   * Sanitize meal plan data
   */
  private static sanitizeMealPlan(mealPlan: z.infer<typeof MealPlanSchema>) {
    return {
      ...mealPlan,
      daily_calories: Math.min(Math.max(mealPlan.daily_calories, 800), 5000),
      meals: {
        breakfast: this.sanitizeMeal(mealPlan.meals.breakfast),
        lunch: this.sanitizeMeal(mealPlan.meals.lunch),
        dinner: this.sanitizeMeal(mealPlan.meals.dinner),
        snacks: mealPlan.meals.snacks.map((snack) => ({
          ...snack,
          name: this.sanitizeText(snack.name),
          description: this.sanitizeText(snack.description),
          calories: Math.min(Math.max(snack.calories, 0), 500)
        }))
      },
      nutrition_notes: mealPlan.nutrition_notes.map((note: string) => this.sanitizeText(note))
    };
  }

  /**
   * Sanitize individual meal
   */
  private static sanitizeMeal(meal: z.infer<typeof MealSchema>) {
    return {
      ...meal,
      name: this.sanitizeText(meal.name),
      calories: Math.min(Math.max(meal.calories, 0), 2000),
      ingredients: meal.ingredients.map((ingredient: string) => this.sanitizeText(ingredient)),
      instructions: meal.instructions ? this.sanitizeText(meal.instructions) : undefined
    };
  }

  /**
   * Sanitize progress analysis data
   */
  private static sanitizeProgressAnalysis(analysis: z.infer<typeof ProgressAnalysisSchema>) {
    return {
      ...analysis,
      progress_summary: this.sanitizeText(analysis.progress_summary),
      trends: analysis.trends.map((trend: string) => this.sanitizeText(trend)),
      recommendations: analysis.recommendations.map((rec: string) => this.sanitizeText(rec)),
      next_steps: analysis.next_steps.map((step: string) => this.sanitizeText(step)),
      areas_for_improvement: analysis.areas_for_improvement?.map((area: string) => this.sanitizeText(area))
    };
  }

  /**
   * Basic text sanitization
   */
  private static sanitizeText(text: string): string {
    return text
      .trim()
      .replace(/[<>\"'&]/g, '') // Remove potentially dangerous HTML chars
      .replace(/\s+/g, ' ') // Normalize whitespace
      .substring(0, 500); // Limit length
  }
}

export type { WorkoutPlanSchema, MealPlanSchema, ProgressAnalysisSchema };
