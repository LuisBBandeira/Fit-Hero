import { NextRequest, NextResponse } from 'next/server';
import { dailyScheduler } from '@/lib/daily-scheduler';

// This endpoint is designed to be called by a cron job service
// For example: curl -X POST http://localhost:3000/api/cron/daily-plans
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication for cron jobs
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🕐 Cron job triggered: Generating daily plans for all users');
    
    // Generate daily plans for all users
    await dailyScheduler.scheduleDailyPlanGeneration();
    
    return NextResponse.json({
      success: true,
      message: 'Daily plan generation completed',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Cron job failed:', error);
    return NextResponse.json(
      { 
        error: 'Cron job failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Health check for cron service
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Daily plans cron service is healthy',
    timestamp: new Date().toISOString(),
    next_run: '06:00 UTC daily'
  });
}
