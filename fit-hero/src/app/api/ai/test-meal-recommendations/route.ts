import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { MonthlyPlanService } from '@/lib/monthly-plan-service'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test meal plan endpoint called')
    
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
    const mealPlanRequest = {
      month,
      year,
      dietaryPreferences: requestData.dietary_preferences || ['balanced'],
      allergies: requestData.allergies || [],
      calorieTarget: requestData.calorie_target || 2000,
      mealPrepTime: requestData.meal_prep_time || 30,
      budgetRange: requestData.budget_range || 'medium'
    }

    console.log('MEAL Meal plan request:', mealPlanRequest)

    // Call the Monthly Plan Service
    const monthlyPlanService = new MonthlyPlanService()
    const mealPlan = await monthlyPlanService.generateMonthlyMealPlan(
      testPlayer.id, 
      mealPlanRequest
    )

    console.log('✅ Meal plan generated:', {
      id: mealPlan.id,
      status: mealPlan.status,
      month: mealPlan.month,
      year: mealPlan.year
    })

    // Return the meal plan data
    return NextResponse.json({
      success: true,
      monthly_plan: {
        id: mealPlan.id,
        month: mealPlan.month,
        year: mealPlan.year,
        status: mealPlan.status,
        calorieTarget: mealPlan.calorieTarget,
        budgetRange: mealPlan.budgetRange,
        dietaryPreferences: mealPlan.dietaryPreferences,
        allergies: mealPlan.allergies,
        mealPrepTime: mealPlan.mealPrepTime,
        filteredData: mealPlan.filteredData,
        validatedData: mealPlan.validatedData,
        rawAiResponse: mealPlan.rawAiResponse,
        errorLog: mealPlan.errorLog
      },
      recommendations: mealPlan.filteredData || mealPlan.validatedData
    })

  } catch (error) {
    console.error('❌ Test meal plan generation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate meal plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
