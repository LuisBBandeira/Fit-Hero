import { prisma } from '@/lib/prisma';
import type { Player, WorkoutSession, MealPlanEntry, WeightEntry, ProgressStats, PlayerAchievement, Achievement } from '@prisma/client';

interface AchievementCheck {
  type: string;
  value: number;
}

type PlayerWithRelations = Player & {
  workoutSessions: WorkoutSession[];
  mealPlanEntries: MealPlanEntry[];
  weightEntries: WeightEntry[];
  progressStats: ProgressStats | null;
  playerAchievements: (PlayerAchievement & { achievement: Achievement })[];
};

export class AchievementService {
  static async checkAndUpdateAchievements(playerId: string) {
    try {
      // Get player data with all related records
      const player = await prisma.player.findUnique({
        where: { id: playerId },
        include: {
          workoutSessions: {
            orderBy: { date: 'desc' }
          },
          mealPlanEntries: {
            orderBy: { date: 'desc' }
          },
          weightEntries: {
            orderBy: { date: 'desc' }
          },
          progressStats: true,
          playerAchievements: {
            include: {
              achievement: true
            }
          }
        }
      }) as PlayerWithRelations | null;

      if (!player) {
        throw new Error('Player not found');
      }

      // Get all achievements
      const achievements = await prisma.achievement.findMany();

      const updatedAchievements = [];

      for (const achievement of achievements) {
        const requirement: AchievementCheck = JSON.parse(achievement.requirement);
        const currentProgress = this.calculateProgress(player, requirement);
        
        // Find existing player achievement
        const existingPlayerAchievement = player.playerAchievements.find(
          (pa: PlayerAchievement & { achievement: Achievement }) => pa.achievementId === achievement.id
        );

        const shouldUnlock = achievement.maxProgress 
          ? currentProgress >= achievement.maxProgress 
          : currentProgress >= requirement.value;

        // Update or create player achievement
        const playerAchievement = await prisma.playerAchievement.upsert({
          where: {
            playerId_achievementId: {
              playerId: playerId,
              achievementId: achievement.id
            }
          },
          update: {
            progress: currentProgress,
            unlockedAt: shouldUnlock && !existingPlayerAchievement?.unlockedAt ? new Date() : existingPlayerAchievement?.unlockedAt
          },
          create: {
            playerId: playerId,
            achievementId: achievement.id,
            progress: currentProgress,
            unlockedAt: shouldUnlock ? new Date() : null
          }
        });

        // If achievement was just unlocked, award experience points
        if (shouldUnlock && !existingPlayerAchievement?.unlockedAt) {
          await prisma.player.update({
            where: { id: playerId },
            data: {
              experience: {
                increment: achievement.points
              }
            }
          });

          updatedAchievements.push({
            achievement,
            unlocked: true,
            points: achievement.points
          });
        }
      }

      return updatedAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  private static calculateProgress(
    player: PlayerWithRelations,
    requirement: AchievementCheck
  ): number {
    switch (requirement.type) {
      case 'workout_count':
        return player.workoutSessions.filter(ws => ws.completed).length;

      case 'workout_streak':
        return this.calculateWorkoutStreak(player.workoutSessions);

      case 'meal_count':
        return player.mealPlanEntries.filter(mp => mp.completed).length;

      case 'meal_streak':
        return this.calculateMealStreak(player.mealPlanEntries);

      case 'weight_loss':
        return this.calculateWeightLoss(player.weightEntries);

      case 'early_workout':
        return this.calculateEarlyWorkouts(player.workoutSessions);

      case 'perfect_week':
        return this.calculatePerfectWeeks(player);

      case 'hydration_streak':
        // This would need additional tracking - for now return 0
        return 0;

      default:
        return 0;
    }
  }

  private static calculateWorkoutStreak(workoutSessions: WorkoutSession[]): number {
    if (workoutSessions.length === 0) return 0;

    let streak = 0;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const completedSessions = workoutSessions
      .filter(ws => ws.completed)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    for (const session of completedSessions) {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);

      if (sessionDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (sessionDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    return streak;
  }

  private static calculateMealStreak(mealEntries: MealPlanEntry[]): number {
    if (mealEntries.length === 0) return 0;

    let streak = 0;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const completedMeals = mealEntries
      .filter(mp => mp.completed)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    for (const meal of completedMeals) {
      const mealDate = new Date(meal.date);
      mealDate.setHours(0, 0, 0, 0);

      if (mealDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (mealDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    return streak;
  }

  private static calculateWeightLoss(weightEntries: WeightEntry[]): number {
    if (weightEntries.length < 2) return 0;

    const sortedEntries = weightEntries.sort((a, b) => a.date.getTime() - b.date.getTime());
    const startWeight = sortedEntries[0].weight;
    const currentWeight = sortedEntries[sortedEntries.length - 1].weight;

    return Math.max(0, startWeight - currentWeight);
  }

  private static calculateEarlyWorkouts(workoutSessions: WorkoutSession[]): number {
    return workoutSessions.filter(ws => {
      const hour = ws.date.getHours();
      return ws.completed && hour < 8;
    }).length;
  }

  private static calculatePerfectWeeks(player: Player & {
    workoutSessions: WorkoutSession[];
    mealPlanEntries: MealPlanEntry[];
  }): number {
    // This is a simplified calculation - in a real app you'd define what constitutes a "perfect week"
    // For now, let's say it's having at least 5 workouts and 15 meals in a week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentWorkouts = player.workoutSessions.filter(ws => 
      ws.completed && ws.date >= oneWeekAgo
    ).length;

    const recentMeals = player.mealPlanEntries.filter(mp => 
      mp.completed && mp.date >= oneWeekAgo
    ).length;

    return (recentWorkouts >= 5 && recentMeals >= 15) ? 1 : 0;
  }
}
