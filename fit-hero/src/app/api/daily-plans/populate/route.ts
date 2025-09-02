import { NextRequest, NextResponse } from 'next/server'
import { DailyPlanPopulationService } from '@/lib/daily-plan-population'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get player
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { player: true }
    })

    if (!user?.player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    const body = await request.json()
    const { date, endDate } = body

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    const targetDate = new Date(date)
    const populationService = new DailyPlanPopulationService()

    // Handle single date or date range
    if (endDate) {
      const targetEndDate = new Date(endDate)
      
      if (targetEndDate < targetDate) {
        return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
      }

      // Get plans for date range
      const result = await populationService.getDailyPlansRange(
        user.player.id,
        targetDate,
        targetEndDate
      )

      return NextResponse.json({
        success: true,
        data: result.dailyPlans,
        errors: result.errors,
        dateRange: {
          start: targetDate.toISOString().split('T')[0],
          end: targetEndDate.toISOString().split('T')[0]
        }
      })
    } else {
      // Handle single date
      const result = await populationService.populateDaily(user.player.id, targetDate)

      return NextResponse.json({
        success: true,
        data: {
          date: targetDate.toISOString().split('T')[0],
          workout: result.workoutPlan,
          meal: result.mealPlan,
          populated: !!(result.workoutPlan || result.mealPlan)
        },
        errors: result.errors
      })
    }

  } catch (error) {
    console.error('Error in daily plan population:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get player
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { player: true }
    })

    if (!user?.player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const populationService = new DailyPlanPopulationService()

    if (date) {
      // Get specific date
      const targetDate = new Date(date)
      const result = await populationService.populateDaily(user.player.id, targetDate)

      return NextResponse.json({
        success: true,
        data: {
          date: targetDate.toISOString().split('T')[0],
          workout: result.workoutPlan,
          meal: result.mealPlan,
          populated: !!(result.workoutPlan || result.mealPlan)
        },
        errors: result.errors
      })
    } else if (month && year) {
      // Get monthly plan status
      const monthNum = parseInt(month)
      const yearNum = parseInt(year)
      
      if (isNaN(monthNum) || isNaN(yearNum) || monthNum < 1 || monthNum > 12) {
        return NextResponse.json({ error: 'Invalid month or year' }, { status: 400 })
      }

      const status = await populationService.getMonthlyPlanStatus(user.player.id, monthNum, yearNum)

      return NextResponse.json({
        success: true,
        data: {
          month: monthNum,
          year: yearNum,
          workout: status.workout,
          meal: status.meal
        }
      })
    } else {
      return NextResponse.json({ error: 'Date or month/year is required' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error getting daily plans:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get player
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { player: true }
    })

    if (!user?.player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    const body = await request.json()
    const { startDate, endDate } = body

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 })
    }

    const populationService = new DailyPlanPopulationService()
    const results = await populationService.regenerateDailyPlans(
      user.player.id,
      new Date(startDate),
      new Date(endDate)
    )

    return NextResponse.json({
      success: true,
      data: results,
      message: 'Daily plans regenerated'
    })

  } catch (error) {
    console.error('Error regenerating daily plans:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
