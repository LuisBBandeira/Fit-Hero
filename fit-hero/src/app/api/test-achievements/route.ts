import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // For testing, use the test user we created
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
      include: { player: true }
    });

    if (!user?.player) {
      return NextResponse.json({ error: 'Test user or player not found' }, { status: 404 });
    }

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

    return NextResponse.json({ 
      achievements: transformedAchievements,
      user: user.email,
      player: user.player.name
    });
  } catch (error) {
    console.error('Error fetching test achievements:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
