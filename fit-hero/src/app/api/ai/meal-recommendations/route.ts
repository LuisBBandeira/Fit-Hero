import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { aiService } from '../../../../lib/ai-service'
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
    
    // Prepare the request for the AI service
    const mealRecommendationRequest = {
      user_id: player.id,
      dietary_preferences: requestData.dietary_preferences || [],
      allergies: requestData.allergies,
      calorie_target: requestData.calorie_target,
      meal_prep_time: requestData.meal_prep_time,
      budget_range: requestData.budget_range
    }

    // Call the AI service
    const aiResponse = await aiService.recommendMeals(mealRecommendationRequest)

    return NextResponse.json({
      success: true,
      recommendations: aiResponse.recommendations
    })

  } catch (error) {
    console.error('Meal recommendation error:', error)
    return NextResponse.json(
      { error: 'Failed to get meal recommendations' },
      { status: 500 }
    )
  }
}
