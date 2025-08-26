import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AchievementCategory, AchievementRarity } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('No session or email found:', session);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Looking for user with email:', session.user.email);

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { player: true }
    });

    console.log('Found user:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.player) {
      console.log('User has no player profile');
      return NextResponse.json({ error: 'Player profile not found. Please complete character creation.' }, { status: 404 });
    }

    console.log('Found player:', user.player.id);

    // Get all achievements with player progress
    const achievements = await prisma.achievement.findMany({
      include: {
        playerAchievements: {
          where: { playerId: user.player.id },
          select: {
            unlockedAt: true,
            progress: true
          }
        }
      },
      orderBy: [
        { category: 'asc' },
        { rarity: 'asc' },
        { name: 'asc' }
      ]
    });

    console.log('Found achievements:', achievements.length);

    // Transform the data to match the frontend interface
    const transformedAchievements = achievements.map(achievement => {
      const playerProgress = achievement.playerAchievements[0];
      
      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category.toLowerCase(),
        unlocked: !!playerProgress?.unlockedAt,
        unlockedDate: playerProgress?.unlockedAt?.toISOString().split('T')[0],
        rarity: achievement.rarity.toLowerCase(),
        points: achievement.points,
        progress: playerProgress?.progress || 0,
        maxProgress: achievement.maxProgress
      };
    });

    return NextResponse.json({ achievements: transformedAchievements });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { achievementId, progress } = body;

    // Get the player
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { player: true }
    });

    if (!user?.player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Get the achievement
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId }
    });

    if (!achievement) {
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });
    }

    // Check if achievement should be unlocked
    const shouldUnlock = achievement.maxProgress ? progress >= achievement.maxProgress : progress >= 1;

    // Update or create player achievement
    const playerAchievement = await prisma.playerAchievement.upsert({
      where: {
        playerId_achievementId: {
          playerId: user.player.id,
          achievementId: achievementId
        }
      },
      update: {
        progress: progress,
        unlockedAt: shouldUnlock ? new Date() : undefined
      },
      create: {
        playerId: user.player.id,
        achievementId: achievementId,
        progress: progress,
        unlockedAt: shouldUnlock ? new Date() : undefined
      }
    });

    // If achievement was unlocked, award experience points
    if (shouldUnlock && !playerAchievement.unlockedAt) {
      await prisma.player.update({
        where: { id: user.player.id },
        data: {
          experience: {
            increment: achievement.points
          }
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      unlocked: shouldUnlock,
      points: shouldUnlock ? achievement.points : 0
    });
  } catch (error) {
    console.error('Error updating achievement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
