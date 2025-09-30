import { prisma } from '@/lib/prisma';
import { PlaceholderPlanService, PlaceholderResult, PlaceholderError } from './placeholder-plan-service';

interface TodaysPlan {
  workoutPlan: Array<{
    id: string;
    name: string;
    exercises: Array<{
      id: string;
      name: string;
      completed: boolean;
      xp: number;
    }>;
    icon: string;
  }>;
  mealPlan: {
    breakfast?: any;
    lunch?: any;
    dinner?: any;
    snacks?: any;
  };
  isPlaceholder?: boolean;
  message?: string;
  error?: PlaceholderError;
  isFallback?: boolean;
}

export class TodaysPlanService {
  /**
   * Get today's workout and meal plans from the monthly AI-generated plans
   * Falls back to placeholder content when custom plans are not available
   */
  static async getTodaysPlans(userId: string): Promise<TodaysPlan> {
    console.log('TodaysPlanService: Getting plans for user:', userId);

    const today = new Date();
    const dayOfMonth = today.getDate();
    const currentMonth = today.getMonth() + 1; // getMonth() returns 0-11
    const currentYear = today.getFullYear();

    console.log('TodaysPlanService: Today is day', dayOfMonth, 'of month', currentMonth, 'year', currentYear);

    try {
      // First get the player for this user
      console.log('TodaysPlanService: Looking up player with userId:', userId);
      const player = await prisma.player.findUnique({
        where: { userId: userId }
      });

      if (!player) {
        console.log('TodaysPlanService: No player found for user ID:', userId);

        // Let's also check if there are any players at all and what their userIds look like
        const allPlayers = await prisma.player.findMany({
          select: { id: true, userId: true, name: true }
        });
        console.log('TodaysPlanService: All players in database:', allPlayers);

        // Return placeholder content for users without player records
        return this.getPlaceholderPlans(userId);
      }

      console.log('TodaysPlanService: Found player:', player.id);

      // Check if custom AI plans are available
      const hasCustomPlans = await this.checkCustomPlansExist(player.id, currentMonth, currentYear);

      if (!hasCustomPlans) {
        console.log('TodaysPlanService: No custom plans available, using placeholder content');
        return this.getPlaceholderPlans(userId);
      }

      // Get workout plan for today
      const workoutPlan = await this.extractTodaysWorkout(player.id, dayOfMonth, currentMonth, currentYear);
      console.log('TodaysPlanService: Found today\'s workout:', !!workoutPlan);

      // Get meal plan for today
      const mealPlan = await this.extractTodaysMeals(player.id, dayOfMonth, currentMonth, currentYear);
      console.log('TodaysPlanService: Found today\'s meals:', !!mealPlan);

      // If either workout or meal plan is missing, fall back to placeholder
      if (!workoutPlan || !mealPlan) {
        console.log('TodaysPlanService: Missing workout or meal plan, using placeholder content');
        return this.getPlaceholderPlans(userId);
      }

      return {
        workoutPlan: workoutPlan,
        mealPlan: mealPlan,
        isPlaceholder: false
      };
    } catch (error) {
      console.error('TodaysPlanService: Error getting plans:', error);
      // Fall back to placeholder content on error
      return this.getPlaceholderPlans(userId);
    }
  }

  /**
   * Check if custom AI plans exist for the current month
   */
  private static async checkCustomPlansExist(playerId: string, month: number, year: number): Promise<boolean> {
    try {
      console.log('TodaysPlanService: Checking for custom plans for player', playerId, 'month', month, 'year', year);

      // Check for both workout and meal plans
      const [workoutPlan, mealPlan] = await Promise.all([
        prisma.monthlyWorkoutPlan.findFirst({
          where: {
            playerId: playerId,
            month: month,
            year: year
          },
          select: { id: true, validatedData: true }
        }),
        prisma.monthlyMealPlan.findFirst({
          where: {
            playerId: playerId,
            month: month,
            year: year
          },
          select: { id: true, validatedData: true }
        })
      ]);

      const hasWorkoutPlan = !!(workoutPlan && workoutPlan.validatedData !== null);
      const hasMealPlan = !!(mealPlan && mealPlan.validatedData !== null);

      console.log('TodaysPlanService: Custom plans availability - workout:', hasWorkoutPlan, 'meal:', hasMealPlan);

      // Return true only if both plans exist and have valid data
      return hasWorkoutPlan && hasMealPlan;
    } catch (error) {
      console.error('TodaysPlanService: Error checking custom plans existence:', error);
      return false;
    }
  }

  /**
   * Get placeholder plans when custom AI plans are not available
   */
  private static getPlaceholderPlans(userId: string): TodaysPlan {
    console.log('TodaysPlanService: Generating placeholder plans for user:', userId);

    try {
      // Validate input
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid userId provided to getPlaceholderPlans');
      }

      // Get placeholder workout and meal plans with error handling
      const workoutResult = PlaceholderPlanService.getPlaceholderWorkout(userId);
      const mealsResult = PlaceholderPlanService.getPlaceholderMeals(userId);

      // Check if both services succeeded
      if (workoutResult.success && mealsResult.success && workoutResult.data && mealsResult.data) {
        return {
          workoutPlan: workoutResult.data,
          mealPlan: mealsResult.data,
          isPlaceholder: true,
          message: "Your custom plans are being created. These are temporary plans to get you started!"
        };
      }

      // Handle partial failures - use available data and report errors
      const workoutPlan = workoutResult.data || [];
      const mealPlan = mealsResult.data || {};

      // Determine the most relevant error to show
      const primaryError = !workoutResult.success ? workoutResult.error : mealsResult.error;

      let message = "Your custom plans are being created. ";
      if (workoutResult.isFallback || mealsResult.isFallback) {
        message += "We're using basic backup plans due to a temporary issue.";
      } else {
        message += "These are temporary plans to get you started!";
      }

      return {
        workoutPlan,
        mealPlan,
        isPlaceholder: true,
        message,
        error: primaryError,
        isFallback: workoutResult.isFallback || mealsResult.isFallback
      };
    } catch (error) {
      console.error('TodaysPlanService: Critical error generating placeholder plans:', error);

      // Return absolute minimal fallback content
      return {
        workoutPlan: [{
          id: 'critical_fallback',
          name: 'Basic Movement',
          icon: '/gym.png',
          exercises: [
            {
              id: 'critical_1',
              name: 'Take a 10-minute walk',
              completed: false,
              xp: 25
            }
          ]
        }],
        mealPlan: {
          breakfast: {
            name: 'Simple Breakfast',
            calories: 300,
            protein: '15g',
            carbs: '40g',
            fat: '10g',
            ingredients: ['Healthy breakfast of your choice'],
            icon: '/salad.png',
            completed: false
          },
          lunch: {
            name: 'Simple Lunch',
            calories: 400,
            protein: '20g',
            carbs: '45g',
            fat: '15g',
            ingredients: ['Balanced lunch meal'],
            icon: '/salad.png',
            completed: false
          },
          dinner: {
            name: 'Simple Dinner',
            calories: 450,
            protein: '25g',
            carbs: '40g',
            fat: '18g',
            ingredients: ['Nutritious dinner'],
            icon: '/salad.png',
            completed: false
          }
        },
        isPlaceholder: true,
        message: "We're experiencing technical difficulties. Please try refreshing the page or contact support if the issue persists.",
        error: {
          type: 'SERVICE_UNAVAILABLE' as any,
          message: 'Placeholder service is temporarily unavailable',
          originalError: error instanceof Error ? error : new Error(String(error))
        },
        isFallback: true
      };
    }
  }

  /**
   * Extract today's workout from monthly workout plans
   */
  private static async extractTodaysWorkout(playerId: string, dayOfMonth: number, month: number, year: number) {
    try {
      console.log('TodaysPlanService: Looking for workout plan for player', playerId, 'day', dayOfMonth);

      // Get the monthly workout plan
      const monthlyPlan = await prisma.monthlyWorkoutPlan.findFirst({
        where: {
          playerId: playerId,
          month: month,
          year: year
        }
      });

      if (!monthlyPlan || !monthlyPlan.validatedData) {
        console.log('TodaysPlanService: No monthly workout plan found');
        return null;
      }

      console.log('TodaysPlanService: Found monthly workout plan, extracting data...');
      const planData = monthlyPlan.validatedData as any;
      console.log('TodaysPlanService: Plan data structure:', Object.keys(planData));

      // Look for today's workout in the plan - check both possible structures
      let todaysWorkout = null;

      // Try the new structure first (daily_workouts)
      if (planData.daily_workouts) {
        console.log('TodaysPlanService: Found daily_workouts structure');
        console.log('TodaysPlanService: daily_workouts keys:', Object.keys(planData.daily_workouts));

        // Check if daily_workouts has day-specific data
        todaysWorkout = planData.daily_workouts[`day_${dayOfMonth}`];
        if (!todaysWorkout) {
          // Try alternative key formats
          const alternativeKeys = [`${dayOfMonth}`, `day${dayOfMonth}`, dayOfMonth.toString()];
          for (const key of alternativeKeys) {
            if (planData.daily_workouts[key]) {
              console.log('TodaysPlanService: Found workout with alternative key:', key);
              todaysWorkout = planData.daily_workouts[key];
              break;
            }
          }
        }

        // If still not found, check if daily_workouts contains a nested structure
        if (!todaysWorkout && typeof planData.daily_workouts === 'object') {
          // Look for nested workout data
          for (const [key, value] of Object.entries(planData.daily_workouts)) {
            if (typeof value === 'object' && value && Object.keys(value).some(k => k.includes(dayOfMonth.toString()) || k.includes(`day_${dayOfMonth}`) || k.includes(`day${dayOfMonth}`))) {
              console.log('TodaysPlanService: Found nested workout structure in:', key);
              console.log('TodaysPlanService: Nested keys:', Object.keys(value));
              // Try to extract from nested structure
              const nestedData = value as Record<string, any>;
              todaysWorkout = nestedData[`day_${dayOfMonth}`] || nestedData[`${dayOfMonth}`] || nestedData[`day${dayOfMonth}`];
              if (todaysWorkout) {
                console.log('TodaysPlanService: Found workout in nested structure');
                break;
              }
            }
          }
        }
      }
      // Fallback to old structure (workout_plan.days)
      else if (planData.workout_plan && planData.workout_plan.days) {
        console.log('TodaysPlanService: Found workout_plan.days structure');
        todaysWorkout = planData.workout_plan.days[`day_${dayOfMonth}`];
      }

      if (todaysWorkout) {
        console.log('TodaysPlanService: Found workout for day', dayOfMonth, ':', todaysWorkout.name || 'Unnamed workout');

        // Transform the workout into the expected format
        const exercises: Array<{
          id: string;
          name: string;
          completed: boolean;
          xp: number;
        }> = [];

        // Add warm-up exercises
        if (todaysWorkout.warm_up || todaysWorkout.warmup) {
          const warmUpExercises = todaysWorkout.warm_up || todaysWorkout.warmup;
          if (Array.isArray(warmUpExercises)) {
            warmUpExercises.forEach((exercise: any, index: number) => {
              // Handle string warm-up exercises (like "5-8 min moderate cardio")
              const exerciseName = typeof exercise === 'string' ? exercise : (exercise.name || exercise.exercise || 'Warm-up exercise');
              exercises.push({
                id: `warmup_${index}`,
                name: `Warm-up: ${exerciseName}`,
                completed: false,
                xp: 10
              });
            });
          }
        }

        // Add main exercises
        if (todaysWorkout.exercises && Array.isArray(todaysWorkout.exercises)) {
          todaysWorkout.exercises.forEach((exercise: any, index: number) => {
            exercises.push({
              id: `main_${index}`,
              name: `${exercise.name || exercise.exercise} - ${exercise.sets || '3 sets'} x ${exercise.reps || '10 reps'}`,
              completed: false,
              xp: 20
            });
          });
        }

        // Add cool-down exercises
        if (todaysWorkout.cool_down || todaysWorkout.cooldown) {
          const coolDownExercises = todaysWorkout.cool_down || todaysWorkout.cooldown;
          if (Array.isArray(coolDownExercises)) {
            coolDownExercises.forEach((exercise: any, index: number) => {
              // Handle string cool-down exercises (like "10-15 min walk/light bike")
              const exerciseName = typeof exercise === 'string' ? exercise : (exercise.name || exercise.exercise || 'Cool-down exercise');
              exercises.push({
                id: `cooldown_${index}`,
                name: `Cool-down: ${exerciseName}`,
                completed: false,
                xp: 5
              });
            });
          }
        }

        console.log('TodaysPlanService: Created', exercises.length, 'exercises for today');

        return [{
          id: 'todays_workout',
          name: todaysWorkout.name || `Day ${dayOfMonth} Workout`,
          exercises: exercises,
          icon: '/gym.png'
        }];
      }

      console.log('TodaysPlanService: No workout found for day', dayOfMonth);
      return null;
    } catch (error) {
      console.error('TodaysPlanService: Error extracting workout:', error);
      return null;
    }
  }

  /**
   * Extract today's meals from monthly meal plans
   */
  private static async extractTodaysMeals(playerId: string, dayOfMonth: number, month: number, year: number) {
    try {
      console.log('TodaysPlanService: Looking for meal plan for player', playerId, 'day', dayOfMonth);

      // Get the monthly meal plan
      const monthlyPlan = await prisma.monthlyMealPlan.findFirst({
        where: {
          playerId: playerId,
          month: month,
          year: year
        }
      });

      if (!monthlyPlan || !monthlyPlan.validatedData) {
        console.log('TodaysPlanService: No monthly meal plan found');
        return null;
      }

      console.log('TodaysPlanService: Found monthly meal plan, extracting data...');
      const planData = monthlyPlan.validatedData as any;
      console.log('TodaysPlanService: Meal plan data structure:', Object.keys(planData));

      // Look for today's meals in the plan - check both possible structures
      let todaysMeals = null;

      // Try the new structure first (daily_meals)
      if (planData.daily_meals) {
        console.log('TodaysPlanService: Found daily_meals structure');
        console.log('TodaysPlanService: Available days:', Object.keys(planData.daily_meals));
        todaysMeals = planData.daily_meals[`day_${dayOfMonth}`];
        if (!todaysMeals) {
          // Try alternative key formats
          const alternativeKeys = [`${dayOfMonth}`, `day${dayOfMonth}`, dayOfMonth.toString()];
          for (const key of alternativeKeys) {
            if (planData.daily_meals[key]) {
              console.log('TodaysPlanService: Found meals with alternative key:', key);
              todaysMeals = planData.daily_meals[key];
              break;
            }
          }
        }
      }
      // Fallback to old structure (meal_plan.days)
      else if (planData.meal_plan && planData.meal_plan.days) {
        console.log('TodaysPlanService: Found meal_plan.days structure');
        todaysMeals = planData.meal_plan.days[`day_${dayOfMonth}`];
      }

      if (todaysMeals) {
        console.log('TodaysPlanService: Found meals for day', dayOfMonth);

        const meals: any = {};          // Extract each meal type with proper formatting to match placeholder structure
        if (todaysMeals.breakfast) {
          meals.breakfast = {
            name: todaysMeals.breakfast.name || 'Breakfast',
            calories: todaysMeals.breakfast.calories || 0,
            protein: todaysMeals.breakfast.protein || this.estimateProtein(todaysMeals.breakfast.calories || 0, 'breakfast'),
            carbs: todaysMeals.breakfast.carbs || todaysMeals.breakfast.carbohydrates || this.estimateCarbs(todaysMeals.breakfast.calories || 0, 'breakfast'),
            fat: todaysMeals.breakfast.fat || todaysMeals.breakfast.fats || this.estimateFat(todaysMeals.breakfast.calories || 0, 'breakfast'),
            ingredients: todaysMeals.breakfast.ingredients || [],
            icon: '/salad.png',
            completed: false,
            description: todaysMeals.breakfast.description || ''
          };
        }

        if (todaysMeals.lunch) {
          meals.lunch = {
            name: todaysMeals.lunch.name || 'Lunch',
            calories: todaysMeals.lunch.calories || 0,
            protein: todaysMeals.lunch.protein || this.estimateProtein(todaysMeals.lunch.calories || 0, 'lunch'),
            carbs: todaysMeals.lunch.carbs || todaysMeals.lunch.carbohydrates || this.estimateCarbs(todaysMeals.lunch.calories || 0, 'lunch'),
            fat: todaysMeals.lunch.fat || todaysMeals.lunch.fats || this.estimateFat(todaysMeals.lunch.calories || 0, 'lunch'),
            ingredients: todaysMeals.lunch.ingredients || [],
            icon: '/salad.png',
            completed: false,
            description: todaysMeals.lunch.description || ''
          };
        }

        if (todaysMeals.dinner) {
          meals.dinner = {
            name: todaysMeals.dinner.name || 'Dinner',
            calories: todaysMeals.dinner.calories || 0,
            protein: todaysMeals.dinner.protein || this.estimateProtein(todaysMeals.dinner.calories || 0, 'dinner'),
            carbs: todaysMeals.dinner.carbs || todaysMeals.dinner.carbohydrates || this.estimateCarbs(todaysMeals.dinner.calories || 0, 'dinner'),
            fat: todaysMeals.dinner.fat || todaysMeals.dinner.fats || this.estimateFat(todaysMeals.dinner.calories || 0, 'dinner'),
            ingredients: todaysMeals.dinner.ingredients || [],
            icon: '/salad.png',
            completed: false,
            description: todaysMeals.dinner.description || ''
          };
        }

        // Handle snacks - convert to single meal format to match dashboard expectations
        if (todaysMeals.snacks) {
          if (Array.isArray(todaysMeals.snacks)) {
            // Combine all snacks into a single meal entry
            const allSnackIngredients: string[] = [];
            let totalCalories = 0;
            const snackNames: string[] = [];

            todaysMeals.snacks.forEach((snack: any) => {
              if (snack.ingredients && Array.isArray(snack.ingredients)) {
                allSnackIngredients.push(...snack.ingredients);
              }
              if (snack.calories) {
                totalCalories += snack.calories;
              }
              if (snack.name) {
                snackNames.push(snack.name);
              }
            });

            meals.snacks = {
              name: snackNames.join(', ') || 'Snacks',
              calories: totalCalories,
              protein: this.estimateProtein(totalCalories, 'snacks'),
              carbs: this.estimateCarbs(totalCalories, 'snacks'),
              fat: this.estimateFat(totalCalories, 'snacks'),
              ingredients: allSnackIngredients,
              icon: '/salad.png',
              completed: false,
              description: `${todaysMeals.snacks.length} snack${todaysMeals.snacks.length > 1 ? 's' : ''}`
            };
          } else {
            meals.snacks = {
              name: todaysMeals.snacks.name || 'Snack',
              calories: todaysMeals.snacks.calories || 0,
              protein: todaysMeals.snacks.protein || this.estimateProtein(todaysMeals.snacks.calories || 0, 'snacks'),
              carbs: todaysMeals.snacks.carbs || todaysMeals.snacks.carbohydrates || this.estimateCarbs(todaysMeals.snacks.calories || 0, 'snacks'),
              fat: todaysMeals.snacks.fat || todaysMeals.snacks.fats || this.estimateFat(todaysMeals.snacks.calories || 0, 'snacks'),
              ingredients: todaysMeals.snacks.ingredients || [],
              icon: '/salad.png',
              completed: false,
              description: todaysMeals.snacks.description || ''
            };
          }
        }

        console.log('TodaysPlanService: Created meal plan with', Object.keys(meals).length, 'meal types');
        return meals;
      }

      console.log('TodaysPlanService: No meals found for day', dayOfMonth);
      return null;
    } catch (error) {
      console.error('TodaysPlanService: Error extracting meals:', error);
      return null;
    }
  }

  /**
   * Estimate protein content based on calories and meal type
   */
  private static estimateProtein(calories: number, mealType: string): string {
    if (calories === 0) return '0g';

    // Protein provides ~4 calories per gram
    // Different meal types have different protein ratios
    let proteinRatio = 0.15; // Default 15% of calories from protein

    switch (mealType) {
      case 'breakfast':
        proteinRatio = 0.12; // 12% - typically lower protein
        break;
      case 'lunch':
        proteinRatio = 0.18; // 18% - higher protein
        break;
      case 'dinner':
        proteinRatio = 0.20; // 20% - highest protein
        break;
      case 'snacks':
        proteinRatio = 0.10; // 10% - lowest protein
        break;
    }

    const proteinCalories = calories * proteinRatio;
    const proteinGrams = Math.round(proteinCalories / 4);
    return `${proteinGrams}g`;
  }

  /**
   * Estimate carbohydrate content based on calories and meal type
   */
  private static estimateCarbs(calories: number, mealType: string): string {
    if (calories === 0) return '0g';

    // Carbs provide ~4 calories per gram
    // Different meal types have different carb ratios
    let carbRatio = 0.50; // Default 50% of calories from carbs

    switch (mealType) {
      case 'breakfast':
        carbRatio = 0.55; // 55% - higher carbs for energy
        break;
      case 'lunch':
        carbRatio = 0.45; // 45% - moderate carbs
        break;
      case 'dinner':
        carbRatio = 0.40; // 40% - lower carbs
        break;
      case 'snacks':
        carbRatio = 0.60; // 60% - often carb-heavy
        break;
    }

    const carbCalories = calories * carbRatio;
    const carbGrams = Math.round(carbCalories / 4);
    return `${carbGrams}g`;
  }

  /**
   * Estimate fat content based on calories and meal type
   */
  private static estimateFat(calories: number, mealType: string): string {
    if (calories === 0) return '0g';

    // Fat provides ~9 calories per gram
    // Different meal types have different fat ratios
    let fatRatio = 0.30; // Default 30% of calories from fat

    switch (mealType) {
      case 'breakfast':
        fatRatio = 0.25; // 25% - moderate fat
        break;
      case 'lunch':
        fatRatio = 0.30; // 30% - balanced fat
        break;
      case 'dinner':
        fatRatio = 0.35; // 35% - higher fat
        break;
      case 'snacks':
        fatRatio = 0.25; // 25% - lower fat
        break;
    }

    const fatCalories = calories * fatRatio;
    const fatGrams = Math.round(fatCalories / 9);
    return `${fatGrams}g`;
  }
}