import { prisma } from '@/lib/prisma';
import { aiActivationService } from '@/lib/ai-activation-service';

interface MonthlyRenewalStats {
  totalUsers: number;
  successfulRenewals: number;
  failedRenewals: number;
  skippedUsers: number;
  errors: string[];
}

class MonthlyRenewalService {
  /**
   * Renew monthly plans for all active users
   */
  async renewMonthlyPlansForAllUsers(month: number, year: number): Promise<MonthlyRenewalStats> {
    const stats: MonthlyRenewalStats = {
      totalUsers: 0,
      successfulRenewals: 0,
      failedRenewals: 0,
      skippedUsers: 0,
      errors: []
    };

    try {
      console.log(`🔍 Finding all active users for monthly renewal...`);
      
      // Get all users who have been active in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const activeUsers = await prisma.player.findMany({
        where: {
          updatedAt: {
            gte: thirtyDaysAgo
          }
        },
        select: {
          id: true,
          userId: true,
          name: true,
          age: true,
          weight: true,
          character: true,
          objective: true,
          trainingEnvironment: true,
          dietaryRestrictions: true,
          forbiddenFoods: true,
          updatedAt: true
        }
      });

      stats.totalUsers = activeUsers.length;
      console.log(`👥 Found ${stats.totalUsers} active users for renewal`);

      // Check if plans already exist for this month/year
      for (const user of activeUsers) {
        try {
          console.log(`🔄 Processing renewal for user: ${user.name} (${user.id})`);

          // Check if user already has plans for this month
          const existingWorkoutPlan = await prisma.monthlyWorkoutPlan.findFirst({
            where: {
              playerId: user.id,
              month,
              year
            }
          });

          const existingMealPlan = await prisma.monthlyMealPlan.findFirst({
            where: {
              playerId: user.id,
              month,
              year
            }
          });

          if (existingWorkoutPlan && existingMealPlan) {
            console.log(`⏭️ User ${user.name} already has plans for ${month}/${year}, skipping`);
            stats.skippedUsers++;
            continue;
          }

          // Generate new monthly plans using AI activation service
          const profileData = {
            age: user.age || 30,
            weight: user.weight || 75.0,
            character: user.character,
            objective: user.objective,
            trainingEnvironment: user.trainingEnvironment,
            dietaryRestrictions: user.dietaryRestrictions || [],
            forbiddenFoods: user.forbiddenFoods || []
          };

          // Use the existing AI activation service to generate plans
          await aiActivationService.activateAIForNewPlayer(user.id, profileData);

          console.log(`✅ Successfully renewed plans for user: ${user.name}`);
          stats.successfulRenewals++;

          // Add small delay to prevent overwhelming the AI service
          await this.delay(1000); // 1 second delay between users

        } catch (userError) {
          const errorMessage = `Failed to renew plans for user ${user.name}: ${userError instanceof Error ? userError.message : 'Unknown error'}`;
          console.error(`❌ ${errorMessage}`);
          stats.errors.push(errorMessage);
          stats.failedRenewals++;
        }
      }

      console.log(`🎉 Monthly renewal completed:`, stats);
      return stats;

    } catch (error) {
      console.error('💥 Critical error in monthly renewal:', error);
      stats.errors.push(`Critical error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Generate renewal plans for a specific user
   */
  async renewPlansForUser(userId: string, month: number, year: number): Promise<boolean> {
    try {
      console.log(`🔄 Renewing plans for specific user: ${userId} for ${month}/${year}`);

      const user = await prisma.player.findFirst({
        where: { userId }
      });

      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      // Check if plans already exist
      const existingWorkoutPlan = await prisma.monthlyWorkoutPlan.findFirst({
        where: {
          playerId: user.id,
          month,
          year
        }
      });

      const existingMealPlan = await prisma.monthlyMealPlan.findFirst({
        where: {
          playerId: user.id,
          month,
          year
        }
      });

      if (existingWorkoutPlan && existingMealPlan) {
        console.log(`⏭️ User already has plans for ${month}/${year}`);
        return false;
      }

      // Generate new plans
      const profileData = {
        age: user.age || 30,
        weight: user.weight || 75.0,
        character: user.character,
        objective: user.objective,
        trainingEnvironment: user.trainingEnvironment,
        dietaryRestrictions: user.dietaryRestrictions || [],
        forbiddenFoods: user.forbiddenFoods || []
      };

      await aiActivationService.activateAIForNewPlayer(user.id, profileData);
      console.log(`✅ Successfully renewed plans for user: ${user.name}`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to renew plans for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get renewal statistics for a specific month
   */
  async getRenewalStats(month: number, year: number) {
    const workoutPlans = await prisma.monthlyWorkoutPlan.count({
      where: { month, year }
    });

    const mealPlans = await prisma.monthlyMealPlan.count({
      where: { month, year }
    });

    const totalUsers = await prisma.player.count();

    return {
      month,
      year,
      totalUsers,
      workoutPlansGenerated: workoutPlans,
      mealPlansGenerated: mealPlans,
      renewalCoverage: `${Math.round((Math.min(workoutPlans, mealPlans) / totalUsers) * 100)}%`
    };
  }

  /**
   * Simple delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const monthlyRenewalService = new MonthlyRenewalService();
