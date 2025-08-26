import { NextRequest, NextResponse } from 'next/server';
import { dailyScheduler } from '@/lib/daily-scheduler';

// Manual trigger for daily plan generation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, trigger_type } = body;

    if (trigger_type === 'single_user' && user_id) {
      // Generate plans for a single user
      const userData = {
        user_id,
        fitness_level: body.fitness_level || 'beginner',
        goals: body.goals || ['general fitness'],
        available_time: body.available_time || 30,
        equipment: body.equipment || ['bodyweight'],
        dietary_preferences: body.dietary_preferences || ['no restrictions'],
        calorie_target: body.calorie_target || 2000,
        allergies: body.allergies || [],
      };

      const result = await dailyScheduler.generateDailyPlansForUser(userData);
      
      return NextResponse.json({
        success: true,
        message: `Daily plan generated for user ${user_id}`,
        data: result
      });

    } else if (trigger_type === 'all_users') {
      // Generate plans for all users
      await dailyScheduler.generateDailyPlansForAllUsers();
      
      return NextResponse.json({
        success: true,
        message: `Daily plans generated for all users`,
        timestamp: new Date().toISOString()
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid trigger_type. Use "single_user" or "all_users"' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error in daily plans API:', error);
    return NextResponse.json(
      { error: 'Failed to generate daily plans', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Get status of daily plan generation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (user_id) {
      // Get daily plan for specific user
      // TODO: Implement database query to get stored daily plans
      return NextResponse.json({
        success: true,
        message: `Daily plan status for user ${user_id}`,
        data: {
          user_id,
          has_daily_plan: true, // This should come from database
          last_generated: new Date().toISOString(),
          next_generation: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      });
    } else {
      // Get overall status
      return NextResponse.json({
        success: true,
        message: 'Daily plan generation service status',
        status: {
          service_active: true,
          last_run: new Date().toISOString(),
          next_scheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          total_users: 0 // This should come from database
        }
      });
    }

  } catch (error) {
    console.error('Error getting daily plans status:', error);
    return NextResponse.json(
      { error: 'Failed to get daily plans status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
