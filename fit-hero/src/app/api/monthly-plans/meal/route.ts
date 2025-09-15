import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { monthlyPlanService } from '@/lib/monthly-plan-service';

export async function POST(request: NextRequest) {
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

    const { month, year } = await request.json();

    // Validate input
    if (!month || !year || month < 1 || month > 12 || year < 2024) {
      return NextResponse.json(
        { error: 'Invalid month or year' },
        { status: 400 }
      );
    }

    // Generate monthly meal plan
    const monthlyPlan = await monthlyPlanService.generateMonthlyMealPlan(player.id, {
      month,
      year,
      dietaryPreferences: player.dietaryRestrictions,
      allergies: [],
      calorieTarget: calculateCalorieTarget(player),
      budgetRange: 'medium',
      mealPrepTime: 30
    });

    return NextResponse.json({
      success: true,
      data: {
        id: monthlyPlan.id,
        month: monthlyPlan.month,
        year: monthlyPlan.year,
        status: monthlyPlan.status,
        generatedAt: monthlyPlan.generatedAt,
        hasValidData: !!monthlyPlan.validatedData && Object.keys(monthlyPlan.validatedData as object).length > 0
      }
    });

  } catch (error) {
    console.error('Error generating monthly meal plan:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate monthly meal plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

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
    const month = parseInt(searchParams.get('month') || '');
    const year = parseInt(searchParams.get('year') || '');

    if (!month || !year) {
      return NextResponse.json(
        { error: 'Month and year are required' },
        { status: 400 }
      );
    }

    // Get existing monthly plan
    const monthlyPlan = await prisma.monthlyMealPlan.findUnique({
      where: {
        playerId_month_year: {
          playerId: player.id,
          month,
          year
        }
      }
    });

    if (!monthlyPlan) {
      return NextResponse.json(
        { error: 'Monthly plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: monthlyPlan.id,
        month: monthlyPlan.month,
        year: monthlyPlan.year,
        status: monthlyPlan.status,
        dietaryPreferences: monthlyPlan.dietaryPreferences,
        calorieTarget: monthlyPlan.calorieTarget,
        validatedData: monthlyPlan.validatedData,
        generatedAt: monthlyPlan.generatedAt,
        errorLog: monthlyPlan.errorLog
      }
    });

  } catch (error) {
    console.error('Error fetching monthly meal plan:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch monthly meal plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function
function calculateCalorieTarget(player: any): number {
  // Simple BMR calculation with activity factor
  if (!player.weight || !player.age) {
    return 2000; // Default
  }

  // Basic BMR formula (simplified)
  const bmr = 1500 + (player.weight * 10) + (player.age * 5);
  return Math.round(bmr * 1.5); // Activity factor
}
