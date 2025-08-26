import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'
import { AchievementService } from '../../../lib/achievement-service'

// Helper function to calculate streak
function calculateStreak(entries: { date: Date }[]): number {
  if (entries.length === 0) return 0;
  
  // Sort entries by date descending
  const sortedEntries = entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (daysDiff === streak + 1 && streak === 0) {
      // Allow for today or yesterday as streak start
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

// Get progress data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const player = await prisma.player.findUnique({
      where: { userId: session.user.id },
      include: {
        progressStats: true,
        workoutSessions: {
          orderBy: { date: 'desc' },
          take: 100 // Get last 100 entries for streak calculation
        },
        mealPlanEntries: {
          orderBy: { date: 'desc' },
          take: 100
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

    // Calculate current streaks
    const workoutStreak = calculateStreak(player.workoutSessions);
    const mealStreak = calculateStreak(player.mealPlanEntries);

    // Get weight data
    const latestWeight = player.weightEntries[0]?.weight || player.weight;
    const startingWeight = player.progressStats?.startingWeight || 
                          player.weightEntries[player.weightEntries.length - 1]?.weight || 
                          player.weight;

    // Calculate weight loss over different periods
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const weightOneMonthAgo = player.weightEntries.find(entry => 
      entry.date <= oneMonthAgo
    )?.weight || latestWeight;

    const weightSixMonthsAgo = player.weightEntries.find(entry => 
      entry.date <= sixMonthsAgo
    )?.weight || latestWeight;

    const weightOneYearAgo = player.weightEntries.find(entry => 
      entry.date <= oneYearAgo
    )?.weight || latestWeight;

    const progressData = {
      workoutStreak,
      mealPlanStreak: mealStreak,
      totalWorkoutDays: player.workoutSessions.length,
      totalMealPlanDays: player.mealPlanEntries.length,
      currentWeight: latestWeight,
      startingWeight,
      weightLoss: startingWeight && latestWeight ? startingWeight - latestWeight : 0,
      weightLossLastMonth: weightOneMonthAgo - (latestWeight || 0),
      weightLossLastSixMonths: weightSixMonthsAgo - (latestWeight || 0),
      weightLossLastYear: weightOneYearAgo - (latestWeight || 0),
      averageWeightLossPerMonth: startingWeight && latestWeight && player.weightEntries.length > 0 
        ? (startingWeight - latestWeight) / Math.max(1, player.weightEntries.length / 4) 
        : 0,
      lastWorkoutDate: player.workoutSessions[0]?.date,
      lastMealPlanDate: player.mealPlanEntries[0]?.date,
      lastWeightUpdate: player.weightEntries[0]?.date
    };

    return NextResponse.json({ progress: progressData })
  } catch (error) {
    console.error('Progress fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update progress (log workout, meal, or weight)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const player = await prisma.player.findUnique({
      where: { userId: session.user.id }
    })

    if (!player) {
      return NextResponse.json(
        { error: 'Player profile not found' },
        { status: 404 }
      )
    }

    const { type, data } = await request.json()

    switch (type) {
      case 'workout':
        await prisma.workoutSession.create({
          data: {
            playerId: player.id,
            date: data.date ? new Date(data.date) : new Date(),
            workoutType: data.workoutType,
            duration: data.duration,
            notes: data.notes
          }
        });
        
        // Increase experience for workout
        await prisma.player.update({
          where: { id: player.id },
          data: { 
            experience: player.experience + 10,
            level: Math.floor((player.experience + 10) / 100) + 1
          }
        });
        break;

      case 'meal':
        await prisma.mealPlanEntry.create({
          data: {
            playerId: player.id,
            date: data.date ? new Date(data.date) : new Date(),
            mealType: data.mealType,
            calories: data.calories,
            notes: data.notes
          }
        });
        
        // Increase experience for meal
        await prisma.player.update({
          where: { id: player.id },
          data: { 
            experience: player.experience + 5,
            level: Math.floor((player.experience + 5) / 100) + 1
          }
        });
        break;

      case 'weight':
        // Create weight entry
        await prisma.weightEntry.create({
          data: {
            playerId: player.id,
            weight: parseFloat(data.weight),
            date: data.date ? new Date(data.date) : new Date(),
            notes: data.notes
          }
        });

        // Update player's current weight
        await prisma.player.update({
          where: { id: player.id },
          data: { 
            weight: parseFloat(data.weight),
            experience: player.experience + 5,
            level: Math.floor((player.experience + 5) / 100) + 1
          }
        });

        // Update or create progress stats
        await prisma.progressStats.upsert({
          where: { playerId: player.id },
          update: {
            currentWeight: parseFloat(data.weight),
            lastWeightUpdate: new Date()
          },
          create: {
            playerId: player.id,
            currentWeight: parseFloat(data.weight),
            startingWeight: parseFloat(data.weight),
            lastWeightUpdate: new Date()
          }
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid progress type' },
          { status: 400 }
        )
    }

    // Check and update achievements after any progress update
    const unlockedAchievements = await AchievementService.checkAndUpdateAchievements(player.id);

    return NextResponse.json(
      { 
        message: 'Progress updated successfully',
        newAchievements: unlockedAchievements
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Progress update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
