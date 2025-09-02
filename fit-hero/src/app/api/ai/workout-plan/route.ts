import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { MonthlyPlanService } from '../../../../lib/monthly-plan-service'
import { prisma } from '../../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's player profile
    const player = await prisma.player.findUnique({
      where: { userId: session.user.id }
    })

    if (!player) {
      return NextResponse.json(
        { error: 'Player profile not found' },
        { status: 404 }
      )
    }

    const requestData = await request.json()
    
    // Use current month/year if not provided
    const currentDate = new Date()
    const month = requestData.month || currentDate.getMonth() + 1
    const year = requestData.year || currentDate.getFullYear()
    
    // Prepare the request for the Monthly Plan Service
    const monthlyPlanRequest = {
      month,
      year,
      fitnessLevel: requestData.fitness_level || 'beginner',
      goals: requestData.goals || [],
      availableTime: requestData.available_time || 30,
      equipment: requestData.equipment || [],
      injuries: requestData.injuries_limitations,
      preferences: requestData.preferred_activities
    }

    // Call the Monthly Plan Service
    const monthlyPlanService = new MonthlyPlanService()
    const monthlyPlan = await monthlyPlanService.generateMonthlyWorkoutPlan(
      player.id, 
      monthlyPlanRequest
    )

    // Return the monthly plan data
    return NextResponse.json({
      success: true,
      monthly_plan: {
        id: monthlyPlan.id,
        month: monthlyPlan.month,
        year: monthlyPlan.year,
        status: monthlyPlan.status,
        filteredData: monthlyPlan.filteredData,
        validatedData: monthlyPlan.validatedData
      },
      // For backward compatibility, extract a daily workout if available
      workout_plan: monthlyPlan.filteredData || monthlyPlan.validatedData
    })

  } catch (error) {
    console.error('Workout plan generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate workout plan' },
      { status: 500 }
    )
  }
}
