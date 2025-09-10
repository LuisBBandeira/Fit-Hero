import { NextRequest, NextResponse } from 'next/server'
import { MonthlyPlanService } from '../../../../lib/monthly-plan-service'
import { prisma } from '../../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test workout plan endpoint called')
    
    const requestData = await request.json()
    console.log('📋 Request data:', requestData)
    
    // Create or find a test player
    let testPlayer = await prisma.player.findFirst({
      where: { 
        OR: [
          { userId: 'test-user' },
          { name: 'Test Player' }
        ]
      }
    })

    if (!testPlayer) {
      console.log('🆕 Creating test player')
      testPlayer = await prisma.player.create({
        data: {
          userId: 'test-user',
          name: 'Test Player',
          character: 'FITNESS_WARRIOR',
          objective: 'GENERAL_FITNESS',
          trainingEnvironment: 'GYM_TRAINING',
          age: 25,
          weight: 70,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    console.log('👤 Using test player:', testPlayer.id)
    
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
      injuries: requestData.injuries_limitations || [],
      preferences: requestData.preferred_activities || []
    }

    console.log('🎯 Monthly plan request:', monthlyPlanRequest)

    // Call the Monthly Plan Service
    const monthlyPlanService = new MonthlyPlanService()
    const monthlyPlan = await monthlyPlanService.generateMonthlyWorkoutPlan(
      testPlayer.id, 
      monthlyPlanRequest
    )

    console.log('✅ Monthly plan generated:', {
      id: monthlyPlan.id,
      status: monthlyPlan.status,
      month: monthlyPlan.month,
      year: monthlyPlan.year
    })

    // Return the monthly plan data
    return NextResponse.json({
      success: true,
      monthly_plan: {
        id: monthlyPlan.id,
        month: monthlyPlan.month,
        year: monthlyPlan.year,
        status: monthlyPlan.status,
        fitnessLevel: monthlyPlan.fitnessLevel,
        availableTime: monthlyPlan.availableTime,
        goals: monthlyPlan.goals,
        equipment: monthlyPlan.equipment,
        filteredData: monthlyPlan.filteredData,
        validatedData: monthlyPlan.validatedData,
        rawAiResponse: monthlyPlan.rawAiResponse,
        errorLog: monthlyPlan.errorLog
      },
      // For backward compatibility, extract a daily workout if available
      workout_plan: monthlyPlan.filteredData || monthlyPlan.validatedData
    })

  } catch (error) {
    console.error('❌ Test workout plan generation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate workout plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
