import { 
  getRandomWorkoutTemplate, 
  getRandomMealTemplate,
  PlaceholderWorkoutSection,
  PlaceholderMealPlan 
} from './placeholder-templates';

// Error types for better error handling
export enum PlaceholderErrorType {
  TEMPLATE_LOADING_FAILED = 'TEMPLATE_LOADING_FAILED',
  DATA_MALFORMED = 'DATA_MALFORMED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface PlaceholderError {
  type: PlaceholderErrorType;
  message: string;
  originalError?: Error;
}

export interface PlaceholderResult<T> {
  success: boolean;
  data?: T;
  error?: PlaceholderError;
  isFallback?: boolean;
}

/**
 * Lightweight service for providing placeholder workout and meal plans
 * when custom AI-generated plans are not yet available
 */
export class PlaceholderPlanService {
  
  /**
   * Get a placeholder workout plan with comprehensive error handling
   * Returns static workout data in the format expected by the dashboard
   */
  static getPlaceholderWorkout(userId?: string): PlaceholderResult<PlaceholderWorkoutSection[]> {
    console.log('PlaceholderPlanService: Getting placeholder workout for user:', userId);
    
    try {
      // Validate input parameters
      if (userId && typeof userId !== 'string') {
        throw new Error('Invalid userId parameter');
      }

      // Get a random workout template from the available templates
      const workoutTemplate = getRandomWorkoutTemplate();
      
      // Validate template data structure
      if (!workoutTemplate || !Array.isArray(workoutTemplate)) {
        throw new Error('Invalid workout template structure');
      }

      // Validate each section in the template
      for (const section of workoutTemplate) {
        if (!section || typeof section !== 'object' || !section.id || !section.name || !Array.isArray(section.exercises)) {
          throw new Error('Malformed workout section data');
        }
        
        // Validate exercises in each section
        for (const exercise of section.exercises) {
          if (!exercise || typeof exercise !== 'object' || !exercise.id || !exercise.name || typeof exercise.xp !== 'number') {
            throw new Error('Malformed exercise data');
          }
        }
      }
      
      // Add some basic randomization to exercise order within each section
      const randomizedWorkout = workoutTemplate.map(section => ({
        ...section,
        exercises: this.shuffleExercises(section.exercises)
      }));
      
      console.log('PlaceholderPlanService: Generated placeholder workout with', 
        randomizedWorkout.reduce((total, section) => total + section.exercises.length, 0), 'exercises');
      
      return {
        success: true,
        data: randomizedWorkout
      };
    } catch (error) {
      console.error('PlaceholderPlanService: Error generating placeholder workout:', error);
      
      // Determine error type
      let errorType = PlaceholderErrorType.UNKNOWN_ERROR;
      let errorMessage = 'Failed to generate placeholder workout';
      
      if (error instanceof Error) {
        if (error.message.includes('template') || error.message.includes('structure')) {
          errorType = PlaceholderErrorType.TEMPLATE_LOADING_FAILED;
          errorMessage = 'Failed to load workout templates';
        } else if (error.message.includes('Malformed') || error.message.includes('Invalid')) {
          errorType = PlaceholderErrorType.DATA_MALFORMED;
          errorMessage = 'Workout template data is corrupted';
        }
      }
      
      // Return fallback workout with error information
      const fallbackWorkout = this.getFallbackWorkout();
      
      return {
        success: false,
        data: fallbackWorkout,
        error: {
          type: errorType,
          message: errorMessage,
          originalError: error instanceof Error ? error : new Error(String(error))
        },
        isFallback: true
      };
    }
  }

  /**
   * Get placeholder meal plans with comprehensive error handling
   * Returns static meal data in the format expected by the dashboard
   */
  static getPlaceholderMeals(userId?: string): PlaceholderResult<PlaceholderMealPlan> {
    console.log('PlaceholderPlanService: Getting placeholder meals for user:', userId);
    
    try {
      // Validate input parameters
      if (userId && typeof userId !== 'string') {
        throw new Error('Invalid userId parameter');
      }

      // Get a random meal template from the available templates
      const mealTemplate = getRandomMealTemplate();
      
      // Validate template data structure
      if (!mealTemplate || typeof mealTemplate !== 'object') {
        throw new Error('Invalid meal template structure');
      }

      // Validate each meal in the template
      const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'] as const;
      for (const mealType of mealTypes) {
        const meal = mealTemplate[mealType];
        if (!meal || typeof meal !== 'object' || !meal.name || typeof meal.calories !== 'number' || !Array.isArray(meal.ingredients)) {
          throw new Error(`Malformed ${mealType} meal data`);
        }
        
        // Validate nutritional information
        if (!meal.protein || !meal.carbs || !meal.fat) {
          throw new Error(`Missing nutritional information for ${mealType}`);
        }
      }
      
      // Add some basic randomization to ingredient order
      const randomizedMeals: PlaceholderMealPlan = {
        breakfast: {
          ...mealTemplate.breakfast,
          ingredients: this.shuffleIngredients(mealTemplate.breakfast.ingredients)
        },
        lunch: {
          ...mealTemplate.lunch,
          ingredients: this.shuffleIngredients(mealTemplate.lunch.ingredients)
        },
        dinner: {
          ...mealTemplate.dinner,
          ingredients: this.shuffleIngredients(mealTemplate.dinner.ingredients)
        },
        snacks: {
          ...mealTemplate.snacks,
          ingredients: this.shuffleIngredients(mealTemplate.snacks.ingredients)
        }
      };
      
      console.log('PlaceholderPlanService: Generated placeholder meal plan with 4 meals');
      
      return {
        success: true,
        data: randomizedMeals
      };
    } catch (error) {
      console.error('PlaceholderPlanService: Error generating placeholder meals:', error);
      
      // Determine error type
      let errorType = PlaceholderErrorType.UNKNOWN_ERROR;
      let errorMessage = 'Failed to generate placeholder meals';
      
      if (error instanceof Error) {
        if (error.message.includes('template') || error.message.includes('structure')) {
          errorType = PlaceholderErrorType.TEMPLATE_LOADING_FAILED;
          errorMessage = 'Failed to load meal templates';
        } else if (error.message.includes('Malformed') || error.message.includes('Invalid') || error.message.includes('Missing')) {
          errorType = PlaceholderErrorType.DATA_MALFORMED;
          errorMessage = 'Meal template data is corrupted';
        }
      }
      
      // Return fallback meal plan with error information
      const fallbackMeals = this.getFallbackMeals();
      
      return {
        success: false,
        data: fallbackMeals,
        error: {
          type: errorType,
          message: errorMessage,
          originalError: error instanceof Error ? error : new Error(String(error))
        },
        isFallback: true
      };
    }
  }

  /**
   * Shuffle exercises within a workout section for variety
   * Keeps warm-up and cool-down exercises in their proper positions
   */
  private static shuffleExercises(exercises: any[]): any[] {
    try {
      if (!Array.isArray(exercises) || exercises.length <= 2) {
        return exercises; // Don't shuffle if invalid or too few exercises
      }
      
      // Validate exercise structure before processing
      const validExercises = exercises.filter(ex => 
        ex && typeof ex === 'object' && ex.id && ex.name
      );
      
      if (validExercises.length === 0) {
        console.warn('PlaceholderPlanService: No valid exercises found for shuffling');
        return exercises; // Return original if no valid exercises
      }
      
      // Separate warm-up, main, and cool-down exercises
      const warmupExercises = validExercises.filter(ex => ex.id.includes('warmup'));
      const mainExercises = validExercises.filter(ex => ex.id.includes('main'));
      const cooldownExercises = validExercises.filter(ex => ex.id.includes('cooldown'));
      
      // Shuffle only the main exercises
      const shuffledMain = this.shuffleArray([...mainExercises]);
      
      // Recombine in proper order
      return [...warmupExercises, ...shuffledMain, ...cooldownExercises];
    } catch (error) {
      console.error('PlaceholderPlanService: Error shuffling exercises:', error);
      return exercises; // Return original array on error
    }
  }

  /**
   * Shuffle ingredients for variety while maintaining nutritional balance
   */
  private static shuffleIngredients(ingredients: string[]): string[] {
    try {
      if (!Array.isArray(ingredients) || ingredients.length <= 1) {
        return ingredients;
      }
      
      // Filter out invalid ingredients
      const validIngredients = ingredients.filter(ingredient => 
        ingredient && typeof ingredient === 'string' && ingredient.trim().length > 0
      );
      
      if (validIngredients.length === 0) {
        console.warn('PlaceholderPlanService: No valid ingredients found for shuffling');
        return ingredients; // Return original if no valid ingredients
      }
      
      return this.shuffleArray([...validIngredients]);
    } catch (error) {
      console.error('PlaceholderPlanService: Error shuffling ingredients:', error);
      return ingredients; // Return original array on error
    }
  }

  /**
   * Simple array shuffle utility using Fisher-Yates algorithm with error handling
   */
  private static shuffleArray<T>(array: T[]): T[] {
    try {
      if (!Array.isArray(array) || array.length <= 1) {
        return array;
      }
      
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    } catch (error) {
      console.error('PlaceholderPlanService: Error in shuffle algorithm:', error);
      return array; // Return original array on error
    }
  }

  /**
   * Get fallback workout when all other options fail
   */
  private static getFallbackWorkout(): PlaceholderWorkoutSection[] {
    return [{
      id: 'emergency_fallback_workout',
      name: 'Basic Emergency Workout',
      icon: '/gym.png',
      exercises: [
        {
          id: 'emergency_1',
          name: 'Warm-up: 5-minute walk or march in place',
          completed: false,
          xp: 10
        },
        {
          id: 'emergency_2', 
          name: 'Bodyweight Squats - 2 sets x 10 reps',
          completed: false,
          xp: 20
        },
        {
          id: 'emergency_3',
          name: 'Wall Push-ups - 2 sets x 8 reps',
          completed: false,
          xp: 20
        },
        {
          id: 'emergency_4',
          name: 'Cool-down: Gentle stretching - 5 minutes',
          completed: false,
          xp: 5
        }
      ]
    }];
  }

  /**
   * Get fallback meals when all other options fail
   */
  private static getFallbackMeals(): PlaceholderMealPlan {
    return {
      breakfast: {
        name: 'Emergency Breakfast',
        calories: 300,
        protein: '15g',
        carbs: '40g',
        fat: '10g',
        ingredients: ['Oatmeal', 'Banana', 'Milk'],
        icon: '/salad.png',
        completed: false
      },
      lunch: {
        name: 'Emergency Lunch',
        calories: 400,
        protein: '20g',
        carbs: '45g',
        fat: '15g',
        ingredients: ['Chicken breast', 'Rice', 'Vegetables'],
        icon: '/salad.png',
        completed: false
      },
      dinner: {
        name: 'Emergency Dinner',
        calories: 450,
        protein: '25g',
        carbs: '40g',
        fat: '18g',
        ingredients: ['Fish', 'Quinoa', 'Broccoli'],
        icon: '/salad.png',
        completed: false
      },
      snacks: {
        name: 'Emergency Snack',
        calories: 150,
        protein: '5g',
        carbs: '20g',
        fat: '6g',
        ingredients: ['Apple', 'Nuts'],
        icon: '/salad.png',
        completed: false
      }
    };
  }

  /**
   * Check if custom AI plans are available for a user
   * This is a placeholder method that will be enhanced in later tasks
   */
  static async checkCustomPlansAvailable(userId: string): Promise<boolean> {
    console.log('PlaceholderPlanService: Checking custom plans availability for user:', userId);
    
    try {
      // Validate input
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid userId provided');
      }

      // For now, always return false to indicate placeholder content should be used
      // This will be implemented properly in later tasks when we integrate with the actual plan detection logic
      return false;
    } catch (error) {
      console.error('PlaceholderPlanService: Error checking custom plans availability:', error);
      // Default to using placeholder content if we can't determine availability
      return false;
    }
  }
}