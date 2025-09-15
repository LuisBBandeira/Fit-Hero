import { prisma } from '@/lib/prisma';

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
}

export class TodaysPlanService {
  /**
   * Get today's workout and meal plans from the monthly AI-generated plans
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
        
        return {
          workoutPlan: [],
          mealPlan: {}
        };
      }

      console.log('TodaysPlanService: Found player:', player.id);
      
      // Get workout plan for today
      const workoutPlan = await this.extractTodaysWorkout(player.id, dayOfMonth, currentMonth, currentYear);
      console.log('TodaysPlanService: Found today\'s workout:', !!workoutPlan);
      
      // Get meal plan for today
      const mealPlan = await this.extractTodaysMeals(player.id, dayOfMonth, currentMonth, currentYear);
      console.log('TodaysPlanService: Found today\'s meals:', !!mealPlan);
      
      return {
        workoutPlan: workoutPlan || [],
        mealPlan: mealPlan || {}
      };
    } catch (error) {
      console.error('TodaysPlanService: Error getting plans:', error);
      return {
        workoutPlan: [],
        mealPlan: {}
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
              todaysWorkout = value[`day_${dayOfMonth}`] || value[`${dayOfMonth}`] || value[`day${dayOfMonth}`];
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
          const exercises = [];          // Add warm-up exercises
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
            icon: '🏋️'
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
          
          const meals: any = {};          // Extract each meal type
          if (todaysMeals.breakfast) {
            meals.breakfast = {
              name: todaysMeals.breakfast.name || 'Breakfast',
              calories: todaysMeals.breakfast.calories || 0,
              ingredients: todaysMeals.breakfast.ingredients || [],
              description: todaysMeals.breakfast.description || ''
            };
          }
          
          if (todaysMeals.lunch) {
            meals.lunch = {
              name: todaysMeals.lunch.name || 'Lunch',
              calories: todaysMeals.lunch.calories || 0,
              ingredients: todaysMeals.lunch.ingredients || [],
              description: todaysMeals.lunch.description || ''
            };
          }
          
          if (todaysMeals.dinner) {
            meals.dinner = {
              name: todaysMeals.dinner.name || 'Dinner',
              calories: todaysMeals.dinner.calories || 0,
              ingredients: todaysMeals.dinner.ingredients || [],
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
                ingredients: allSnackIngredients,
                description: `${todaysMeals.snacks.length} snack${todaysMeals.snacks.length > 1 ? 's' : ''}`
              };
            } else {
              meals.snacks = {
                name: todaysMeals.snacks.name || 'Snack',
                calories: todaysMeals.snacks.calories || 0,
                ingredients: todaysMeals.snacks.ingredients || [],
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
}