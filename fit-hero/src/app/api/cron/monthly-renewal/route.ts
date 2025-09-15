import { NextRequest, NextResponse } from 'next/server';
import { monthlyRenewalService } from '@/lib/monthly-renewal-service';

// This endpoint is designed to be called by a cron job service on the 1st of each month
// For example: curl -X POST http://localhost:3000/api/cron/monthly-renewal
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

    console.log('🗓️ Monthly renewal cron job triggered: Generating plans for all active users');
    
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1; // JavaScript months are 0-based
    const year = currentDate.getFullYear();
    
    console.log(`📅 Generating monthly plans for ${month}/${year}`);
    
    // Generate monthly plans for all active users
    const result = await monthlyRenewalService.renewMonthlyPlansForAllUsers(month, year);
    
    return NextResponse.json({
      success: true,
      message: 'Monthly plan renewal completed',
      timestamp: new Date().toISOString(),
      month,
      year,
      stats: result
    });

  } catch (error) {
    console.error('❌ Monthly renewal cron job failed:', error);
    return NextResponse.json(
      { 
        error: 'Monthly renewal cron job failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Health check for monthly renewal cron service
export async function GET() {
  const currentDate = new Date();
  const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  
  return NextResponse.json({
    success: true,
    message: 'Monthly renewal cron service is healthy',
    timestamp: new Date().toISOString(),
    next_run: '1st of each month at 02:00 UTC',
    next_renewal_date: nextMonth.toISOString(),
    current_month: `${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`
  });
}
