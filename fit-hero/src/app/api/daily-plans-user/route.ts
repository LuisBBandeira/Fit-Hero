import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

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
    const dateParam = searchParams.get('date');
    
    // Use provided date or today's date
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    targetDate.setHours(0, 0, 0, 0); // Set to beginning of day

    // Get workout plan for the date (temporarily disabled until migration)
    // const workoutPlan = await prisma.dailyWorkoutPlan.findUnique({
    //   where: {
    //     playerId_date: {
    //       playerId: player.id,
    //       date: targetDate
    //     }
    //   }
    // });

    // Get meal plan for the date (temporarily disabled until migration)
    // const mealPlan = await prisma.dailyMealPlan.findUnique({
    //   where: {
    //     playerId_date: {
    //       playerId: player.id,
    //       date: targetDate
    //     }
    //   }
    // });

    // Temporary: Return placeholder data until database tables are created
    const workoutPlan = null;
    const mealPlan = null;

    if (!workoutPlan && !mealPlan) {
      return NextResponse.json(
        { 
          error: 'No daily plans found for this date',
          date: targetDate.toISOString().split('T')[0],
          suggestion: 'Daily plans are generated automatically each morning at 6 AM'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      date: targetDate.toISOString().split('T')[0],
      workoutPlan: null, // Will be populated once database tables are created
      mealPlan: null, // Will be populated once database tables are created
      message: 'Daily plans feature coming soon - database migration pending'
    });

  } catch (error) {
    console.error('Error fetching daily plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily plans', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
