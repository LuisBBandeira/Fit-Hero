import { prisma } from './prisma';

interface UserPlanData {
  user_id: string;
  fitness_level: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  available_time: number;
  equipment: string[];
  dietary_preferences: string[];
  allergies: string[];
  calorie_target: number;
}

interface DailyPlan {
  user_id: string;
  date: string;
  workout_plan: Record<string, unknown>;
  meal_plan: Record<string, unknown>;
  generated_at: string;
}

class DailyScheduler {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';
  }

  /**
   * Generate daily plans for a single user
   */
  async generateDailyPlansForUser(userData: UserPlanData): Promise<DailyPlan> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate-daily-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`AI Service error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to generate daily plans for user ${userData.user_id}:`, error);
      
      // Fallback to mock plans if AI service is unavailable
      return this.generateMockDailyPlan(userData);
    }
  }

  /**
   * Get all users for batch daily plan generation
   */
  async generateDailyPlansForAllUsers(): Promise<void> {
    try {
      console.log('� Starting batch daily plan generation for all users...');
      
      // Temporarily using mock user data until database is properly migrated
      console.log('📝 Using mock user data - database query temporarily disabled');
      const mockUsers = [
        { id: 'user-1' },
        { id: 'user-2' }
      ];
      
      // TODO: Enable after database migration is complete
      // const users = await prisma.player.findMany({
      //   select: {
      //     id: true,
      //     objectives: true,
      //     trainingEnvironment: true,
      //     dietaryRestrictions: true
      //   }
      // });

      for (const user of mockUsers) {
        try {
          // Create mock user data for the API call
          const userData: UserPlanData = {
            user_id: user.id,
            fitness_level: 'beginner',
            goals: ['general_fitness'],
            available_time: 30,
            equipment: ['bodyweight'],
            dietary_preferences: ['no_restrictions'],
            allergies: [],
            calorie_target: 2000
          };
          
          await this.generateDailyPlansForUser(userData);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
        } catch (error) {
          console.error(`Failed to generate plans for user ${user.id}:`, error);
        }
      }
      
      console.log('✅ Batch daily plan generation completed');
      
    } catch (error) {
      console.error('Error in batch daily plan generation:', error);
      throw error;
    }
  }

  /**
   * Get all active users who need daily plans
   */
  private async getActiveUsers(): Promise<UserPlanData[]> {
    try {
      // Temporarily returning mock data until database is properly migrated
      console.log('📝 Using mock active users - database query temporarily disabled');
      
      const mockActiveUsers: UserPlanData[] = [
        {
          user_id: 'active-user-1',
          fitness_level: 'beginner',
          goals: ['weight_loss'],
          available_time: 45,
          equipment: ['dumbbells'],
          dietary_preferences: ['vegetarian'],
          allergies: [],
          calorie_target: 1800
        },
        {
          user_id: 'active-user-2', 
          fitness_level: 'intermediate',
          goals: ['muscle_gain'],
          available_time: 60,
          equipment: ['full_gym'],
          dietary_preferences: ['high_protein'],
          allergies: ['nuts'],
          calorie_target: 2200
        }
      ];
      
      // TODO: Enable after database migration is complete
      // const players = await prisma.player.findMany({
      //   where: {
      //     createdAt: {
      //       lt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      //     }
      //   },
      //   select: {
      //     id: true,
      //     objectives: true,
      //     trainingEnvironment: true,
      //     dietaryRestrictions: true
      //   }
      // });
      //
      // return players.map(player => ({
      //   user_id: player.id,
      //   fitness_level: 'beginner', // Default until we have this field
      //   goals: player.objectives || ['general_fitness'],
      //   available_time: 30, // Default
      //   equipment: player.trainingEnvironment === 'gym' ? ['full_gym'] : ['bodyweight'],
      //   dietary_preferences: ['no_restrictions'], // Default
      //   allergies: player.dietaryRestrictions || [],
      //   calorie_target: 2000 // Default
      // }));
      
      return mockActiveUsers;
      
    } catch (error) {
      console.error('Error getting active users:', error);
      return [];
    }
  }

  /**
   * Store daily plan in database
   */
  private async storeDailyPlan(dailyPlan: DailyPlan): Promise<void> {
    try {
      // Temporarily disabled until database migration is complete
      console.log(`📝 Would store daily plan for user ${dailyPlan.user_id} on ${dailyPlan.date}`);
      console.log('Database storage pending migration - currently logging only');
      
      // TODO: Enable after running database migration
      // const planDate = new Date(dailyPlan.date);
      // 
      // await prisma.dailyWorkoutPlan.upsert({
      //   where: { playerId_date: { playerId: dailyPlan.user_id, date: planDate } },
      //   update: { workoutData: dailyPlan.workout_plan, generatedBy: 'ai', updatedAt: new Date() },
      //   create: {
      //     playerId: dailyPlan.user_id,
      //     date: planDate,
      //     fitnessLevel: 'beginner',
      //     goals: ['general_fitness'],
      //     availableTime: 30,
      //     equipment: ['bodyweight'],
      //     workoutData: dailyPlan.workout_plan,
      //     generatedBy: 'ai'
      //   }
      // });
      //
      // await prisma.dailyMealPlan.upsert({
      //   where: { playerId_date: { playerId: dailyPlan.user_id, date: planDate } },
      //   update: { mealData: dailyPlan.meal_plan, generatedBy: 'ai', updatedAt: new Date() },
      //   create: {
      //     playerId: dailyPlan.user_id,
      //     date: planDate,
      //     dietaryPreferences: ['no_restrictions'],
      //     allergies: [],
      //     calorieTarget: 2000,
      //     mealData: dailyPlan.meal_plan,
      //     generatedBy: 'ai'
      //   }
      // });
      
    } catch (error) {
      console.error('Error in storeDailyPlan:', error);
    }
  }

  /**
   * Generate mock daily plan as fallback
   */
  private generateMockDailyPlan(userData: UserPlanData): DailyPlan {
    const today = new Date().toISOString().split('T')[0];
    
    return {
      user_id: userData.user_id,
      date: today,
      workout_plan: {
        daily_workout: {
          focus: "Full Body",
          duration: userData.available_time,
          exercises: [
            { name: "Push-ups", sets: 3, reps: "8-12", rest: "60s" },
            { name: "Squats", sets: 3, reps: "12-15", rest: "60s" },
            { name: "Plank", sets: 3, reps: "30s", rest: "60s" }
          ],
          warm_up: "5 minutes light movement",
          cool_down: "5 minutes stretching"
        }
      },
      meal_plan: {
        daily_meals: {
          breakfast: {
            name: "Protein Oatmeal",
            calories: Math.round(userData.calorie_target * 0.25),
            protein: "25g"
          },
          lunch: {
            name: "Chicken Quinoa Bowl",
            calories: Math.round(userData.calorie_target * 0.35),
            protein: "30g"
          },
          dinner: {
            name: "Salmon & Vegetables",
            calories: Math.round(userData.calorie_target * 0.30),
            protein: "35g"
          },
          snacks: [
            {
              name: "Greek Yogurt",
              calories: Math.round(userData.calorie_target * 0.10)
            }
          ]
        }
      },
      generated_at: new Date().toISOString()
    };
  }

  /**
   * Schedule daily plan generation (for cron jobs)
   */
  async scheduleDailyPlanGeneration(): Promise<void> {
    try {
      console.log('🕐 Starting scheduled daily plan generation...');
      await this.generateDailyPlansForAllUsers();
      console.log('✅ Scheduled daily plan generation completed successfully');
    } catch (error) {
      console.error('❌ Scheduled daily plan generation failed:', error);
    }
  }
}

export const dailyScheduler = new DailyScheduler();
