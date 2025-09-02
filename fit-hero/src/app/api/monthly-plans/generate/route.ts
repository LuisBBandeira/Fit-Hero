import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { monthlyPlanService } from '@/lib/monthly-plan-service'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get player
    const player = await prisma.player.findUnique({
      where: { userId: session.user.id }
    })

    if (!player) {
      return NextResponse.json(
        { error: 'Player profile not found' },
        { status: 404 }
      )
    }

    const { month, year, playerData } = await request.json()

    // Validate input
    if (!month || !year || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Invalid month or year' },
        { status: 400 }
      )
    }

    // Initialize service
    // Use the imported instance instead of creating a new one

    // Prepare workout plan parameters
    const workoutParams = {
      month,
      year,
      fitnessLevel: playerData?.fitnessLevel || 'intermediate',
      goals: playerData?.goals || ['general_fitness'],
      availableTime: playerData?.availableTime || 30,
      equipment: playerData?.equipment || ['bodyweight'],
      injuries: playerData?.injuries || [],
      preferences: playerData?.preferences || []
    }

    // Prepare meal plan parameters  
    const mealParams = {
      month,
      year,
      dietaryPreferences: playerData?.dietaryPreferences || [],
      allergies: playerData?.allergies || [],
      calorieTarget: playerData?.calorieTarget || 2000,
      mealPrepTime: playerData?.mealPrepTime || 30,
      budgetRange: playerData?.budgetRange || 'moderate'
    }

    // Generate plans with enhanced filtering
    const [workoutPlan, mealPlan] = await Promise.allSettled([
      monthlyPlanService.generateMonthlyWorkoutPlan(player.id, workoutParams),
      monthlyPlanService.generateMonthlyMealPlan(player.id, mealParams)
    ])

    // Handle results
    const result: any = {
      success: true,
      data: {}
    }

    if (workoutPlan.status === 'fulfilled') {
      result.data.workoutPlan = workoutPlan.value
    } else {
      result.workoutError = workoutPlan.reason instanceof Error ? workoutPlan.reason.message : 'Workout plan generation failed'
    }

    if (mealPlan.status === 'fulfilled') {
      result.data.mealPlan = mealPlan.value
    } else {
      result.mealError = mealPlan.reason instanceof Error ? mealPlan.reason.message : 'Meal plan generation failed'
    }

    // If both failed, return error
    if (workoutPlan.status === 'rejected' && mealPlan.status === 'rejected') {
      return NextResponse.json({
        error: 'Failed to generate monthly plans',
        workoutError: result.workoutError,
        mealError: result.mealError
      }, { status: 500 })
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error generating monthly plans:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate monthly plans',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get player
    const player = await prisma.player.findUnique({
      where: { userId: session.user.id }
    })

    if (!player) {
      return NextResponse.json(
        { error: 'Player profile not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get('month') || new Date().getMonth() + 1 + '')
    const year = parseInt(searchParams.get('year') || new Date().getFullYear() + '')

    // Get existing monthly plans
    const workoutPlan = await prisma.monthlyWorkoutPlan.findUnique({
      where: {
        playerId_month_year: {
          playerId: player.id,
          month,
          year
        }
      }
    })

    const mealPlan = await prisma.monthlyMealPlan.findUnique({
      where: {
        playerId_month_year: {
          playerId: player.id,
          month,
          year
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        workoutPlan,
        mealPlan,
        exists: {
          workout: !!workoutPlan,
          meal: !!mealPlan
        }
      }
    })

  } catch (error) {
    console.error('Error fetching monthly plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monthly plans' },
      { status: 500 }
    )
  }
}
