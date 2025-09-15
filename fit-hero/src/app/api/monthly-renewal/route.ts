import { NextRequest, NextResponse } from 'next/server';
import { monthlyRenewalService } from '@/lib/monthly-renewal-service';
import { getServerSession } from 'next-auth';

// Manual monthly renewal trigger for admins or testing
export async function POST(request: NextRequest) {
  try {
    // Optional: Add admin authentication
    // const session = await getServerSession();
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    const { month, year, userId } = body;

    if (!month || !year) {
      return NextResponse.json(
        { error: 'Month and year are required' },
        { status: 400 }
      );
    }

    console.log(`🔧 Manual renewal triggered for ${month}/${year}`);

    let result;
    if (userId) {
      // Renew for specific user
      console.log(`👤 Renewing plans for specific user: ${userId}`);
      const success = await monthlyRenewalService.renewPlansForUser(userId, month, year);
      result = { 
        userId, 
        success, 
        message: success ? 'Plans renewed successfully' : 'Plans already exist for this month' 
      };
    } else {
      // Renew for all users
      console.log(`👥 Renewing plans for all active users`);
      result = await monthlyRenewalService.renewMonthlyPlansForAllUsers(month, year);
    }

    return NextResponse.json({
      success: true,
      message: 'Manual renewal completed',
      timestamp: new Date().toISOString(),
      month,
      year,
      result
    });

  } catch (error) {
    console.error('❌ Manual renewal failed:', error);
    return NextResponse.json(
      { 
        error: 'Manual renewal failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Get renewal statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || '0');
    const year = parseInt(searchParams.get('year') || '0');

    if (!month || !year) {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      const stats = await monthlyRenewalService.getRenewalStats(currentMonth, currentYear);
      return NextResponse.json(stats);
    }

    const stats = await monthlyRenewalService.getRenewalStats(month, year);
    return NextResponse.json(stats);

  } catch (error) {
    console.error('❌ Failed to get renewal stats:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get renewal stats', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
