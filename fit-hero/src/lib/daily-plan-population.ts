import { prisma } from '@/lib/prisma'
import { MonthlyPlanStatus } from '@prisma/client'
import { MonthlyPlanFilter } from '@/lib/monthly-plan-filter'

export class DailyPlanPopulationService {
  /**
   * Populate daily plans for a specific date from monthly plans
   * This service is responsible for converting monthly AI-generated plans into daily consumable data
   */
  async populateDaily(playerId: string, date: Date): Promise<{
    workoutPlan?: any;
    mealPlan?: any;
    errors?: string[];
  }> {
    const errors: string[] = [];
    let workoutPlan = null;
    let mealPlan = null;

    try {
      // Try to populate workout plan
      try {
        workoutPlan = await this.populateDailyWorkout(playerId, date);
      } catch (error) {
        errors.push(`Workout: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Try to populate meal plan
      try {
        mealPlan = await this.populateDailyMeal(playerId, date);
      } catch (error) {
        errors.push(`Meal: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      return {
        workoutPlan,
        mealPlan,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      return {
        errors: [`Service error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Get daily plans for a date range (useful for weekly/monthly views)
   */
  async getDailyPlansRange(
    playerId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<{
    dailyPlans: Array<{
      date: Date;
      workout?: any;
      meal?: any;
      populated: boolean;
    }>;
    errors?: string[];
  }> {
    const dailyPlans: Array<any> = [];
    const errors: string[] = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      try {
        const result = await this.getDailyPlansForDate(playerId, new Date(currentDate));
        dailyPlans.push({
          date: new Date(currentDate),
          workout: result.workout,
          meal: result.meal,
          populated: !!(result.workout || result.meal)
        });
      } catch (error) {
        errors.push(`${currentDate.toISOString().split('T')[0]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        dailyPlans.push({
          date: new Date(currentDate),
          workout: null,
          meal: null,
          populated: false
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      dailyPlans,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Get existing daily plans for a specific date (without populating)
   */
  private async getDailyPlansForDate(playerId: string, date: Date) {
    const [workout, meal] = await Promise.all([
      prisma.dailyWorkoutPlan.findUnique({
        where: {
          playerId_date: { playerId, date }
        }
      }),
      prisma.dailyMealPlan.findUnique({
        where: {
          playerId_date: { playerId, date }
        }
      })
    ]);

    return { workout, meal };
  }

  /**
   * Populate daily workout plan from monthly plan
   */
  private async populateDailyWorkout(playerId: string, date: Date) {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // Check if daily plan already exists
    const existing = await prisma.dailyWorkoutPlan.findUnique({
      where: {
        playerId_date: { playerId, date }
      }
    });

    if (existing) {
      return existing;
    }

    // Get monthly plan
    const monthlyPlan = await prisma.monthlyWorkoutPlan.findUnique({
      where: {
        playerId_month_year: { playerId, month, year }
      }
    });

    if (!monthlyPlan) {
      throw new Error('No monthly workout plan found');
    }

    if (monthlyPlan.status !== MonthlyPlanStatus.ACTIVE) {
      throw new Error(`Monthly workout plan status is ${monthlyPlan.status}, expected ACTIVE`);
    }

    // Extract daily workout using the filter
    const validatedData = monthlyPlan.validatedData as Record<string, unknown>;
    const dailyWorkout = MonthlyPlanFilter.extractDailyWorkout(validatedData, date);

    if (!dailyWorkout) {
      throw new Error(`No workout data available for ${date.toISOString().split('T')[0]}`);
    }

      // Validate and sanitize the daily workout data
      const sanitizedWorkout = this.sanitizeDailyWorkout(dailyWorkout)

      // Create daily workout plan
      const dailyPlan = await prisma.dailyWorkoutPlan.create({
        data: {
          playerId,
          date,
          fitnessLevel: monthlyPlan.fitnessLevel,
          goals: monthlyPlan.goals,
          availableTime: monthlyPlan.availableTime,
          equipment: monthlyPlan.equipment,
          workoutData: sanitizedWorkout as any, // Type assertion for JSON compatibility
          generatedBy: 'monthly_ai',
          monthlyPlanId: monthlyPlan.id
        }
      })    // Update monthly plan's last populated date
    await prisma.monthlyWorkoutPlan.update({
      where: { id: monthlyPlan.id },
      data: { lastPopulatedDate: date }
    });

    return dailyPlan;
  }

  /**
   * Populate daily meal plan from monthly plan
   */
  private async populateDailyMeal(playerId: string, date: Date) {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // Check if daily plan already exists
    const existing = await prisma.dailyMealPlan.findUnique({
      where: {
        playerId_date: { playerId, date }
      }
    });

    if (existing) {
      return existing;
    }

    // Get monthly plan
    const monthlyPlan = await prisma.monthlyMealPlan.findUnique({
      where: {
        playerId_month_year: { playerId, month, year }
      }
    });

    if (!monthlyPlan) {
      throw new Error('No monthly meal plan found');
    }

    if (monthlyPlan.status !== MonthlyPlanStatus.ACTIVE) {
      throw new Error(`Monthly meal plan status is ${monthlyPlan.status}, expected ACTIVE`);
    }

    // Extract daily meal using the filter
    const validatedData = monthlyPlan.validatedData as Record<string, unknown>;
    const dailyMeal = MonthlyPlanFilter.extractDailyMeal(validatedData, date);

    if (!dailyMeal) {
      throw new Error(`No meal data available for ${date.toISOString().split('T')[0]}`);
    }

    // Validate and sanitize the daily meal data
    const sanitizedMeal = this.sanitizeDailyMeal(dailyMeal);

    // Create daily meal plan
    const dailyPlan = await prisma.dailyMealPlan.create({
      data: {
        playerId,
        date,
        dietaryPreferences: monthlyPlan.dietaryPreferences,
        allergies: monthlyPlan.allergies,
        calorieTarget: monthlyPlan.calorieTarget,
        mealData: sanitizedMeal as any, // Type assertion for JSON compatibility
        generatedBy: 'monthly_ai',
        monthlyPlanId: monthlyPlan.id
      }
    });

    // Update monthly plan's last populated date
    await prisma.monthlyMealPlan.update({
      where: { id: monthlyPlan.id },
      data: { lastPopulatedDate: date }
    });

    return dailyPlan;
  }

  /**
   * Get monthly plan status for debugging
   */
  async getMonthlyPlanStatus(playerId: string, month: number, year: number) {
    const [workoutPlan, mealPlan] = await Promise.all([
      prisma.monthlyWorkoutPlan.findUnique({
        where: {
          playerId_month_year: { playerId, month, year }
        },
        select: {
          id: true,
          status: true,
          generatedAt: true,
          lastPopulatedDate: true,
          errorLog: true
        }
      }),
      prisma.monthlyMealPlan.findUnique({
        where: {
          playerId_month_year: { playerId, month, year }
        },
        select: {
          id: true,
          status: true,
          generatedAt: true,
          lastPopulatedDate: true,
          errorLog: true
        }
      })
    ]);

    return {
      workout: workoutPlan,
      meal: mealPlan
    };
  }

  /**
   * Force regenerate daily plans for a date range from monthly plans
   */
  async regenerateDailyPlans(playerId: string, startDate: Date, endDate: Date) {
    const results: Array<{
      date: Date;
      success: boolean;
      error?: string;
    }> = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      try {
        // Delete existing daily plans
        await Promise.all([
          prisma.dailyWorkoutPlan.deleteMany({
            where: {
              playerId,
              date: new Date(currentDate)
            }
          }),
          prisma.dailyMealPlan.deleteMany({
            where: {
              playerId,
              date: new Date(currentDate)
            }
          })
        ]);

        // Repopulate
        await this.populateDaily(playerId, new Date(currentDate));
        
        results.push({
          date: new Date(currentDate),
          success: true
        });
      } catch (error) {
        results.push({
          date: new Date(currentDate),
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return results;
  }

  /**
   * Sanitize daily workout data to ensure it's safe for storage and display
   */
  private sanitizeDailyWorkout(workout: Record<string, unknown>): Record<string, unknown> {
    return {
      day_of_week: String(workout.day_of_week || 'Unknown').slice(0, 15),
      workout_type: String(workout.workout_type || 'General').slice(0, 100),
      duration: Math.min(Math.max(Number(workout.duration) || 30, 0), 240),
      intensity: this.sanitizeIntensity(workout.intensity),
      exercises: this.sanitizeExercises(workout.exercises),
      warm_up: this.sanitizeStringArray(workout.warm_up, 200, 10),
      cool_down: this.sanitizeStringArray(workout.cool_down, 200, 10),
      estimated_calories: workout.estimated_calories ? Math.min(Math.max(Number(workout.estimated_calories), 0), 1500) : undefined,
      focus_areas: this.sanitizeStringArray(workout.focus_areas, 50, 10)
    };
  }

  /**
   * Sanitize daily meal data to ensure it's safe for storage and display
   */
  private sanitizeDailyMeal(meal: Record<string, unknown>): Record<string, unknown> {
    return {
      day_of_week: String(meal.day_of_week || 'Unknown').slice(0, 15),
      breakfast: this.sanitizeMealItem(meal.breakfast),
      lunch: this.sanitizeMealItem(meal.lunch),
      dinner: this.sanitizeMealItem(meal.dinner),
      snacks: this.sanitizeSnacks(meal.snacks),
      daily_totals: this.sanitizeDailyTotals(meal.daily_totals)
    };
  }

  private sanitizeIntensity(intensity: unknown): string {
    const validIntensities = ['Low', 'Moderate', 'High', 'Very High'];
    const intensityStr = String(intensity || 'Low');
    return validIntensities.includes(intensityStr) ? intensityStr : 'Low';
  }

  private sanitizeExercises(exercises: unknown): unknown[] {
    if (!Array.isArray(exercises)) return [];
    
    return exercises.slice(0, 20).map(exercise => {
      if (exercise && typeof exercise === 'object') {
        const ex = exercise as Record<string, unknown>;
        return {
          name: this.sanitizeText(String(ex.name || 'Unknown Exercise'), 150),
          type: this.sanitizeExerciseType(ex.type),
          sets: Math.min(Math.max(Number(ex.sets) || 1, 1), 12),
          reps: String(ex.reps || '1').slice(0, 30),
          rest_time: String(ex.rest_time || '60s').slice(0, 15),
          notes: ex.notes ? this.sanitizeText(String(ex.notes), 300) : undefined,
          progression: ex.progression ? this.sanitizeText(String(ex.progression), 400) : undefined,
          equipment: this.sanitizeStringArray(ex.equipment, 50, 10),
          target_muscles: this.sanitizeStringArray(ex.target_muscles, 50, 10)
        };
      }
      return null;
    }).filter(Boolean);
  }

  private sanitizeExerciseType(type: unknown): string {
    const validTypes = ['strength', 'cardio', 'flexibility', 'mixed'];
    const typeStr = String(type || 'strength');
    return validTypes.includes(typeStr) ? typeStr : 'strength';
  }

  private sanitizeStringArray(arr: unknown, maxLength: number, maxItems: number): string[] {
    if (!Array.isArray(arr)) return [];
    return arr.slice(0, maxItems).map(item => this.sanitizeText(String(item), maxLength));
  }

  private sanitizeMealItem(meal: unknown): Record<string, unknown> {
    if (!meal || typeof meal !== 'object') {
      return {
        name: 'Default Meal',
        calories: 400,
        protein: '20g',
        carbs: '40g',
        fat: '15g',
        prep_time: '15min',
        ingredients: ['Basic ingredients'],
        instructions: ['Basic preparation']
      };
    }

    const mealData = meal as Record<string, unknown>;
    return {
      name: this.sanitizeText(String(mealData.name || 'Default Meal'), 150),
      calories: Math.min(Math.max(Number(mealData.calories) || 400, 0), 3000),
      protein: String(mealData.protein || '20g').slice(0, 10),
      carbs: String(mealData.carbs || '40g').slice(0, 10),
      fat: String(mealData.fat || '15g').slice(0, 10),
      prep_time: String(mealData.prep_time || '15min').slice(0, 15),
      ingredients: this.sanitizeStringArray(mealData.ingredients, 100, 30),
      instructions: this.sanitizeStringArray(mealData.instructions, 1000, 15),
      meal_prep_notes: mealData.meal_prep_notes ? this.sanitizeText(String(mealData.meal_prep_notes), 500) : undefined,
      dietary_tags: this.sanitizeStringArray(mealData.dietary_tags, 30, 10)
    };
  }

  private sanitizeSnacks(snacks: unknown): unknown[] {
    if (!Array.isArray(snacks)) return [];
    
    return snacks.slice(0, 5).map(snack => {
      if (snack && typeof snack === 'object') {
        const snackData = snack as Record<string, unknown>;
        return {
          name: this.sanitizeText(String(snackData.name || 'Snack'), 100),
          calories: Math.min(Math.max(Number(snackData.calories) || 150, 0), 800),
          ingredients: this.sanitizeStringArray(snackData.ingredients, 50, 15),
          prep_time: snackData.prep_time ? String(snackData.prep_time).slice(0, 15) : undefined
        };
      }
      return null;
    }).filter(Boolean);
  }

  private sanitizeDailyTotals(totals: unknown): Record<string, number> {
    if (!totals || typeof totals !== 'object') {
      return {
        calories: 2000,
        protein: 100,
        carbs: 250,
        fat: 65,
        fiber: 25
      };
    }

    const totalsData = totals as Record<string, unknown>;
    return {
      calories: Math.min(Math.max(Number(totalsData.calories) || 2000, 0), 8000),
      protein: Math.min(Math.max(Number(totalsData.protein) || 100, 0), 500),
      carbs: Math.min(Math.max(Number(totalsData.carbs) || 250, 0), 1000),
      fat: Math.min(Math.max(Number(totalsData.fat) || 65, 0), 400),
      fiber: Math.min(Math.max(Number(totalsData.fiber) || 25, 0), 200),
      sugar: Math.min(Math.max(Number(totalsData.sugar) || 50, 0), 300)
    };
  }

  private sanitizeText(text: string, maxLength: number): string {
    return text
      .trim()
      .replace(/[<>\"'&]/g, '') // Remove potentially dangerous HTML chars
      .replace(/\s+/g, ' ') // Normalize whitespace
      .substring(0, maxLength);
  }
}
