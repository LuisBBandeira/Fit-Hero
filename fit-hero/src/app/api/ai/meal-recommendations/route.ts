import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { MonthlyPlanService } from '@/lib/monthly-plan-service'
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
    const monthlyMealRequest = {
      month,
      year,
      dietaryPreferences: requestData.dietary_preferences || [],
      allergies: requestData.allergies || [],
      calorieTarget: requestData.calorie_target || 2000,
      budgetRange: requestData.budget_range || 'medium',
      mealPrepTime: requestData.meal_prep_time || 30
    }

    // Call the Monthly Plan Service
    const monthlyPlanService = new MonthlyPlanService()
    const monthlyPlan = await monthlyPlanService.generateMonthlyMealPlan(
      player.id, 
      monthlyMealRequest
    )

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
      // For backward compatibility, extract meal recommendations if available
      recommendations: monthlyPlan.filteredData || monthlyPlan.validatedData
    })

  } catch (error) {
    console.error('Meal recommendation error:', error)
    return NextResponse.json(
      { error: 'Failed to get meal recommendations' },
      { status: 500 }
    )
  }
}
