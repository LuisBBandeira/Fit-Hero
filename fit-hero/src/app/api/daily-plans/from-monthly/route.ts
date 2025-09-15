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

    const url = new URL(request.url);
    const dateParam = url.searchParams.get('date');
    
    if (!dateParam) {
      return NextResponse.json(
        { error: 'Date parameter is required (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const requestedDate = new Date(dateParam);
    const month = requestedDate.getMonth() + 1;
    const year = requestedDate.getFullYear();
    const dayOfMonth = requestedDate.getDate();

    // Get the monthly workout plan
    const monthlyWorkoutPlan = await prisma.monthlyWorkoutPlan.findUnique({
      where: {
        playerId_month_year: {
          playerId: player.id,
          month,
          year
        }
      }
    });

    // Get the monthly meal plan
    const monthlyMealPlan = await prisma.monthlyMealPlan.findUnique({
      where: {
        playerId_month_year: {
          playerId: player.id,
          month,
          year
        }
      }
    });

    // Extract daily workout from monthly plan
    let dailyWorkout = null;
    if (monthlyWorkoutPlan && monthlyWorkoutPlan.status === MonthlyPlanStatus.ACTIVE) {
      const validatedData = monthlyWorkoutPlan.validatedData as any;
      const dailyWorkouts = validatedData?.daily_workouts || {};
      dailyWorkout = dailyWorkouts[dayOfMonth.toString()] || null;
    }

    // Extract daily meal from monthly plan
    let dailyMeal = null;
    if (monthlyMealPlan && monthlyMealPlan.status === MonthlyPlanStatus.ACTIVE) {
      const validatedData = monthlyMealPlan.validatedData as any;
      const dailyMeals = validatedData?.daily_meals || {};
      dailyMeal = dailyMeals[dayOfMonth.toString()] || null;
    }

    // Check if we need to generate plans
    const needsWorkoutPlan = !monthlyWorkoutPlan || monthlyWorkoutPlan.status !== MonthlyPlanStatus.ACTIVE;
    const needsMealPlan = !monthlyMealPlan || monthlyMealPlan.status !== MonthlyPlanStatus.ACTIVE;

    return NextResponse.json({
      success: true,
      data: {
        date: dateParam,
        workout: dailyWorkout,
        meal: dailyMeal,
        planStatus: {
          workoutPlan: {
            exists: !!monthlyWorkoutPlan,
            status: monthlyWorkoutPlan?.status || 'NOT_FOUND',
            needsGeneration: needsWorkoutPlan
          },
          mealPlan: {
            exists: !!monthlyMealPlan,
            status: monthlyMealPlan?.status || 'NOT_FOUND',
            needsGeneration: needsMealPlan
          }
        }
      }
    });

  } catch (error) {
    console.error('Error fetching daily plans from monthly data:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch daily plans',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
