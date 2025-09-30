import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MonthlyPlanStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's player profile
    const player = await prisma.player.findUnique({
      where: { userId: session.user.id }
    });

    if (!player) {
      return NextResponse.json(
        { error: 'Player profile not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    
    if (!dateStr) {
      return NextResponse.json(
        { error: 'Date parameter is required (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const dayOfMonth = date.getDate();

    // Get monthly workout plan
    const monthlyWorkoutPlan = await prisma.monthlyWorkoutPlan.findUnique({
      where: {
        playerId_month_year: {
          playerId: player.id,
          month,
          year
        }
      }
    });

    // Get monthly meal plan
    const monthlyMealPlan = await prisma.monthlyMealPlan.findUnique({
      where: {
        playerId_month_year: {
          playerId: player.id,
          month,
          year
        }
      }
    });

    // Extract daily workout data
    let dailyWorkout = null;
    if (monthlyWorkoutPlan && monthlyWorkoutPlan.status === MonthlyPlanStatus.VALIDATED) {
      const validatedData = monthlyWorkoutPlan.validatedData as any;
      const dailyWorkouts = validatedData.daily_workouts || validatedData.dailyWorkouts || {};
      dailyWorkout = dailyWorkouts[dayOfMonth.toString()];
    }

    // Extract daily meal data
    let dailyMeal = null;
    if (monthlyMealPlan && monthlyMealPlan.status === MonthlyPlanStatus.VALIDATED) {
      const validatedData = monthlyMealPlan.validatedData as any;
      const dailyMeals = validatedData.daily_meals || validatedData.dailyMeals || {};
      dailyMeal = dailyMeals[dayOfMonth.toString()];
    }

    // Transform data to match dashboard format
    const workoutPlan = dailyWorkout ? transformWorkoutForDashboard(dailyWorkout) : getDefaultWorkout();
    const mealPlan = dailyMeal ? transformMealForDashboard(dailyMeal) : getDefaultMeals();

    return NextResponse.json({
      success: true,
      data: {
        date: dateStr,
        workoutPlan,
        mealPlan,
        hasMonthlyWorkoutPlan: !!monthlyWorkoutPlan,
        hasMonthlyMealPlan: !!monthlyMealPlan,
        workoutPlanStatus: monthlyWorkoutPlan?.status || 'NOT_FOUND',
        mealPlanStatus: monthlyMealPlan?.status || 'NOT_FOUND'
      }
    });

  } catch (error) {
    console.error('Error fetching daily plans:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch daily plans',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function transformWorkoutForDashboard(dailyWorkout: any) {
  const exercises = dailyWorkout.exercises || [];
  
  return [{
    id: 'daily-workout',
    name: dailyWorkout.workout_type || 'Daily Workout',
    exercises: exercises.map((exercise: any, index: number) => ({
      id: `exercise-${index}`,
      name: exercise.name || 'Exercise',
      completed: false,
      xp: 25
    })),
    icon: getWorkoutIcon(dailyWorkout.workout_type)
  }];
}

function transformMealForDashboard(dailyMeal: any) {
  const meals: any = {};

  // Transform breakfast
  if (dailyMeal.breakfast) {
    meals.breakfast = {
      name: dailyMeal.breakfast.name || 'Breakfast',
      calories: dailyMeal.breakfast.calories || 400,
      protein: dailyMeal.breakfast.protein || '20g',
      carbs: dailyMeal.breakfast.carbs || '45g',
      fat: dailyMeal.breakfast.fat || '15g',
      ingredients: dailyMeal.breakfast.ingredients || [],
      icon: '/salad.png',
      completed: false
    };
  }

  // Transform lunch
  if (dailyMeal.lunch) {
    meals.lunch = {
      name: dailyMeal.lunch.name || 'Lunch',
      calories: dailyMeal.lunch.calories || 500,
      protein: dailyMeal.lunch.protein || '30g',
      carbs: dailyMeal.lunch.carbs || '55g',
      fat: dailyMeal.lunch.fat || '18g',
      ingredients: dailyMeal.lunch.ingredients || [],
      icon: '/salad.png',
      completed: false
    };
  }

  // Transform dinner
  if (dailyMeal.dinner) {
    meals.dinner = {
      name: dailyMeal.dinner.name || 'Dinner',
      calories: dailyMeal.dinner.calories || 600,
      protein: dailyMeal.dinner.protein || '35g',
      carbs: dailyMeal.dinner.carbs || '60g',
      fat: dailyMeal.dinner.fat || '22g',
      ingredients: dailyMeal.dinner.ingredients || [],
      icon: '/salad.png',
      completed: false
    };
  }

  // Add snacks if available
  if (dailyMeal.snacks && dailyMeal.snacks.length > 0) {
    dailyMeal.snacks.forEach((snack: any, index: number) => {
      meals[`snack${index + 1}`] = {
        name: snack.name || 'Snack',
        calories: snack.calories || 150,
        protein: '5g',
        carbs: '15g',
        fat: '8g',
        ingredients: snack.ingredients || [],
        icon: '/salad.png',
        completed: false
      };
    });
  }

  return meals;
}

function getWorkoutIcon(workoutType: string): string {
  switch (workoutType?.toLowerCase()) {
    case 'cardio':
      return '/gym.png';
    case 'strength':
      return '/gym.png';
    case 'flexibility':
      return '/yoga.png';
    case 'rest':
      return '/hourglass.png';
    default:
      return '/gym.png';
  }
}

function getDefaultWorkout() {
  return [{
    id: 'default-workout',
    name: 'Generate Your Plan',
    exercises: [{
      id: 'placeholder',
      name: 'Click to generate AI workout plan',
      completed: false,
      xp: 0
    }],
    icon: '/robot.png'
  }];
}

function getDefaultMeals() {
  return {
    breakfast: {
      name: 'Generate Your Plan',
      calories: 0,
      protein: '0g',
      carbs: '0g',
      fat: '0g',
      ingredients: ['Click to generate AI meal plan'],
      icon: '/robot.png',
      completed: false
    },
    lunch: {
      name: 'Generate Your Plan',
      calories: 0,
      protein: '0g',
      carbs: '0g',
      fat: '0g',
      ingredients: ['Click to generate AI meal plan'],
      icon: '/robot.png',
      completed: false
    },
    dinner: {
      name: 'Generate Your Plan',
      calories: 0,
      protein: '0g',
      carbs: '0g',
      fat: '0g',
      ingredients: ['Click to generate AI meal plan'],
      icon: '/robot.png',
      completed: false
    }
  };
}
