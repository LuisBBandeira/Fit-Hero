import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import { aiActivationService } from '../../../../lib/ai-activation-service'

/**
 * POST /api/ai/activate
 * Manually trigger AI service activation for a player
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find the player profile for this user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { player: true }
    })

    if (!user?.player) {
      return NextResponse.json(
        { error: 'Player profile not found. Please create your character first.' },
        { status: 404 }
      )
    }

    const player = user.player

    console.log(`🔄 Manual AI activation requested for player: ${player.id}`)

    // Trigger AI service activation
    const result = await aiActivationService.activateAIForNewPlayer(player.id, {
      age: player.age || 30,
      weight: player.weight || 75.0,
      character: player.character,
      objective: player.objective,
      trainingEnvironment: player.trainingEnvironment,
      dietaryRestrictions: player.dietaryRestrictions,
      forbiddenFoods: player.forbiddenFoods
    })

    return NextResponse.json(
      {
        success: true,
        message: 'AI service activation completed',
        player: {
          id: player.id,
          name: player.name
        },
        results: {
          workout_plan_generated: !!result.workout_plan,
          meal_plan_generated: !!result.meal_plan,
          errors: result.errors
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('AI activation API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to activate AI service',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ai/activate  
 * Check AI service activation status for current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find the player profile for this user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { 
        player: {
          include: {
            monthlyWorkoutPlans: {
              orderBy: { createdAt: 'desc' },
              take: 1
            },
            monthlyMealPlans: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    })

    if (!user?.player) {
      return NextResponse.json(
        { 
          hasPlayer: false,
          aiActivated: false,
          message: 'No player profile found'
        },
        { status: 200 }
      )
    }

    const player = user.player
    const hasWorkoutPlan = player.monthlyWorkoutPlans.length > 0
    const hasMealPlan = player.monthlyMealPlans.length > 0
    const aiActivated = hasWorkoutPlan && hasMealPlan

    return NextResponse.json(
      {
        hasPlayer: true,
        aiActivated,
        player: {
          id: player.id,
          name: player.name,
          createdAt: player.createdAt
        },
        plans: {
          hasWorkoutPlan,
          hasMealPlan,
          latestWorkoutPlan: hasWorkoutPlan ? {
            id: player.monthlyWorkoutPlans[0].id,
            month: player.monthlyWorkoutPlans[0].month,
            year: player.monthlyWorkoutPlans[0].year,
            createdAt: player.monthlyWorkoutPlans[0].createdAt
          } : null,
          latestMealPlan: hasMealPlan ? {
            id: player.monthlyMealPlans[0].id,
            month: player.monthlyMealPlans[0].month,
            year: player.monthlyMealPlans[0].year,
            createdAt: player.monthlyMealPlans[0].createdAt
          } : null
        },
        recommendations: aiActivated ? [] : [
          'Click the "Activate AI" button to generate your personalized plans',
          'Make sure your player profile is complete with accurate information'
        ]
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('AI activation status check error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check AI activation status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
