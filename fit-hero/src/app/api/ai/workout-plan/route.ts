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
    const workoutPlanRequest = {
      user_id: player.id,
      fitness_level: requestData.fitness_level || 'beginner',
      goals: requestData.goals || [],
      available_time: requestData.available_time || 30,
      equipment: requestData.equipment || [],
      injuries_limitations: requestData.injuries_limitations,
      preferred_activities: requestData.preferred_activities
    }

    // Call the AI service
    const aiResponse = await aiService.generateWorkoutPlan(workoutPlanRequest)

    // Optionally save the workout plan to database
    if (aiResponse.workout_plan) {
      // You could save this to a workout_plans table
      // await prisma.workoutPlan.create({
      //   data: {
      //     playerId: player.id,
      //     plan: aiResponse.workout_plan,
      //     createdAt: new Date()
      //   }
      // })
    }

    return NextResponse.json({
      success: true,
      workout_plan: aiResponse.workout_plan
    })

  } catch (error) {
    console.error('Workout plan generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate workout plan' },
      { status: 500 }
    )
  }
}
