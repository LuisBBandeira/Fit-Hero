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

    // Get user's player profile with all progress data
    const player = await prisma.player.findUnique({
      where: { userId: session.user.id },
      include: {
        progressStats: true,
        workoutSessions: {
          orderBy: { date: 'desc' },
          take: 50
        },
        mealPlanEntries: {
          orderBy: { date: 'desc' },
          take: 50
        },
        weightEntries: {
          orderBy: { date: 'desc' },
          take: 50
        }
      }
    })

    if (!player) {
      return NextResponse.json(
        { error: 'Player profile not found' },
        { status: 404 }
      )
    }

    const requestData = await request.json()
    
    // Prepare workout data
    const workoutData = {
      sessions: player.workoutSessions.map(session => ({
        date: session.date,
        type: session.workoutType,
        duration: session.duration,
        notes: session.notes
      })),
      totalSessions: player.workoutSessions.length,
      consistency: calculateWorkoutConsistency(player.workoutSessions)
    }

    // Prepare weight data
    const weightData = {
      entries: player.weightEntries.map(entry => ({
        date: entry.date,
        weight: entry.weight,
        notes: entry.notes
      })),
      currentWeight: player.weight,
      startingWeight: player.progressStats?.startingWeight || player.weight,
      trend: calculateWeightTrend(player.weightEntries)
    }

    // Prepare meal data
    const mealData = {
      entries: player.mealPlanEntries.map(entry => ({
        date: entry.date,
        type: entry.mealType,
        calories: entry.calories,
        notes: entry.notes
      })),
      totalEntries: player.mealPlanEntries.length,
      consistency: calculateMealConsistency(player.mealPlanEntries)
    }

    // Prepare the request for the AI service
    const progressAnalysisRequest = {
      user_id: player.id,
      workout_data: workoutData,
      weight_data: weightData,
      meal_data: mealData,
      goals: requestData.goals || ['general_fitness']
    }

    // Call the AI service
    const aiResponse = await aiService.analyzeProgress(progressAnalysisRequest)

    return NextResponse.json({
      success: true,
      analysis: aiResponse.analysis
    })

  } catch (error) {
    console.error('Progress analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze progress' },
      { status: 500 }
    )
  }
}

// Helper functions
function calculateWorkoutConsistency(sessions: Array<{ date: Date }>): number {
  if (sessions.length === 0) return 0
  
  const last30Days = new Date()
  last30Days.setDate(last30Days.getDate() - 30)
  
  const recentSessions = sessions.filter(session => 
    new Date(session.date) >= last30Days
  )
  
  return Math.min((recentSessions.length / 20) * 100, 100) // 20 workouts in 30 days = 100%
}

function calculateWeightProgress(entries: Array<{ weight: number; date: Date }>): string {
  if (entries.length < 2) return 'No weight data available'
  
  const sortedEntries = entries.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  
  const firstEntry = sortedEntries[0]
  const lastEntry = sortedEntries[sortedEntries.length - 1]
  const weightChange = lastEntry.weight - firstEntry.weight
  
  if (Math.abs(weightChange) < 0.5) {
    return 'Weight maintained'
  } else if (weightChange > 0) {
    return `Gained ${weightChange.toFixed(1)} kg`
  } else {
    return `Lost ${Math.abs(weightChange).toFixed(1)} kg`
  }
}

function calculateMealConsistency(entries: Array<{ date: Date }>): number {
  if (entries.length === 0) return 0
  
  const last30Days = new Date()
  last30Days.setDate(last30Days.getDate() - 30)
  
  const recentEntries = entries.filter(entry => 
    new Date(entry.date) >= last30Days
  )
  
  return Math.min((recentEntries.length / 90) * 100, 100) // 3 meals per day for 30 days = 100%
}

function calculateWeightTrend(entries: Array<{ weight: number; date: Date }>): string {
  if (entries.length < 2) return 'insufficient_data'
  
  const recent = entries[0]?.weight
  const older = entries[Math.min(4, entries.length - 1)]?.weight
  
  if (!recent || !older) return 'insufficient_data'
  
  const difference = recent - older
  if (Math.abs(difference) < 0.5) return 'stable'
  return difference < 0 ? 'decreasing' : 'increasing'
}
