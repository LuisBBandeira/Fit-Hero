import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

/**
 * GET /api/ai/activate  
 * Internal health check for AI service activation status
 * This is used internally by the system, not exposed to users
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
        }
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
