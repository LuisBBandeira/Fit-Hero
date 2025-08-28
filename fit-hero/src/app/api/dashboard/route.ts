import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get today's date for filtering
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const player = await prisma.player.findUnique({
      where: { userId: session.user.id }
    })

    if (!player) {
      return NextResponse.json(
        { error: 'Player profile not found' },
        { status: 404 }
      )
    }

    // Get today's exercise completions
    const todayExerciseCompletions = await prisma.exerciseCompletion.findMany({
      where: {
        playerId: player.id,
        date: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    })

    // Get today's workout sessions
    const todayWorkouts = await prisma.workoutSession.findMany({
      where: {
        playerId: player.id,
        date: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    })

    // Get today's meal entries
    const todayMeals = await prisma.mealPlanEntry.findMany({
      where: {
        playerId: player.id,
        date: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    })

    // Get latest weight entry
    const latestWeight = await prisma.weightEntry.findFirst({
      where: {
        playerId: player.id
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Get progress stats
    const progressStats = await prisma.progressStats.findUnique({
      where: {
        playerId: player.id
      }
    })

    // Calculate XP percentage for next level
    const xpForNextLevel = player.level * 100;
    const xpPercentage = (player.experience % 100);

    // Character image mapping
    const characterImageMap = {
      FITNESS_WARRIOR: '/orange_wariar%20/rotations/south.png',
      CARDIO_RUNNER: '/blue_runner/rotations/south.png',
      AGILITY_NINJA: '/purple_ninja/rotations/south.png',
      VITALITY_GUARDIAN: '/sean_guardian/rotations/south.png'
    };

    // Character name mapping
    const characterNameMap = {
      FITNESS_WARRIOR: 'FITNESS WARRIOR',
      CARDIO_RUNNER: 'CARDIO RUNNER',
      AGILITY_NINJA: 'AGILITY NINJA',
      VITALITY_GUARDIAN: 'VITALITY GUARDIAN'
    };

    const completedExerciseIds = new Set(todayExerciseCompletions.map((ec: { exerciseId: string }) => ec.exerciseId));

    type MealEntry = {
      id: string;
      createdAt: Date;
      playerId: string;
      date: Date;
      completed: boolean;
      mealType: string | null;
      calories: number | null;
      notes: string | null;
    };

    const mealsByType = todayMeals.reduce((acc: Record<string, MealEntry>, meal) => {
      if (meal.mealType) {
        acc[meal.mealType] = meal;
      }
      return acc;
    }, {});

    // Default workout plan with completion status based on today's data
    const workoutPlan = [
      {
        id: 'warmup',
        name: 'WARM-UP',
        exercises: [
          { id: 'jumping-jacks', name: '50 Jumping Jacks', completed: completedExerciseIds.has('jumping-jacks'), xp: 50 },
          { id: 'arm-circles', name: '20 Arm Circles (each direction)', completed: completedExerciseIds.has('arm-circles'), xp: 30 },
          { id: 'leg-swings', name: '15 Leg Swings (each leg)', completed: completedExerciseIds.has('leg-swings'), xp: 40 }
        ],
        icon: '🔥'
      },
      {
        id: 'strength',
        name: 'STRENGTH TRAINING',
        exercises: [
          { id: 'push-ups', name: '3 sets of 15 Push-ups', completed: completedExerciseIds.has('push-ups'), xp: 100 },
          { id: 'squats', name: '3 sets of 20 Squats', completed: completedExerciseIds.has('squats'), xp: 120 },
          { id: 'plank', name: '3 sets of 30s Plank', completed: completedExerciseIds.has('plank'), xp: 80 },
          { id: 'lunges', name: '3 sets of 12 Lunges (each leg)', completed: completedExerciseIds.has('lunges'), xp: 90 }
        ],
        icon: '💪'
      },
      {
        id: 'cardio',
        name: 'CARDIO BLAST',
        exercises: [
          { id: 'burpees', name: '3 sets of 10 Burpees', completed: completedExerciseIds.has('burpees'), xp: 150 },
          { id: 'mountain-climbers', name: '3 sets of 20 Mountain Climbers', completed: completedExerciseIds.has('mountain-climbers'), xp: 110 },
          { id: 'high-knees', name: '3 sets of 30s High Knees', completed: completedExerciseIds.has('high-knees'), xp: 80 }
        ],
        icon: '❤️'
      },
      {
        id: 'cooldown',
        name: 'COOL DOWN',
        exercises: [
          { id: 'stretching', name: '10 minutes Full Body Stretching', completed: completedExerciseIds.has('stretching'), xp: 60 },
          { id: 'breathing', name: '5 minutes Deep Breathing', completed: completedExerciseIds.has('breathing'), xp: 40 }
        ],
        icon: '🧘‍♂️'
      }
    ];

    // Default meal plan with actual completion status
    const mealPlan = {
      breakfast: {
        name: 'PROTEIN POWER BOWL',
        calories: 450,
        protein: '35g',
        carbs: '25g',
        fat: '18g',
        ingredients: ['Oatmeal', 'Greek Yogurt', 'Berries', 'Almonds', 'Honey'],
        icon: '🥣',
        completed: !!mealsByType.breakfast
      },
      lunch: {
        name: 'WARRIOR SALAD',
        calories: 520,
        protein: '42g',
        carbs: '30g',
        fat: '22g',
        ingredients: ['Grilled Chicken', 'Mixed Greens', 'Quinoa', 'Avocado', 'Olive Oil'],
        icon: '🥗',
        completed: !!mealsByType.lunch
      },
      snack: {
        name: 'ENERGY BOOST',
        calories: 200,
        protein: '15g',
        carbs: '18g',
        fat: '8g',
        ingredients: ['Apple', 'Almond Butter', 'Protein Powder'],
        icon: '🍎',
        completed: !!mealsByType.snack
      },
      dinner: {
        name: 'HERO FEAST',
        calories: 680,
        protein: '48g',
        carbs: '55g',
        fat: '25g',
        ingredients: ['Salmon', 'Sweet Potato', 'Broccoli', 'Brown Rice', 'Herbs'],
        icon: '🍽️',
        completed: !!mealsByType.dinner
      }
    };

    const dashboardData = {
      player: {
        name: player.name,
        level: player.level,
        currentXP: player.experience,
        xpToNextLevel: xpForNextLevel,
        xpPercentage: xpPercentage,
        character: {
          id: player.character.toLowerCase(),
          name: characterNameMap[player.character] || player.character,
          imagePath: characterImageMap[player.character] || '/orange_wariar%20/rotations/south.png'
        }
      },
      workoutPlan,
      mealPlan,
      stats: {
        currentWeight: latestWeight?.weight || player.weight,
        workoutStreak: progressStats?.currentWorkoutStreak || 0,
        mealStreak: progressStats?.currentMealStreak || 0,
        totalWorkoutDays: progressStats?.totalWorkoutDays || 0,
        totalMealPlanDays: progressStats?.totalMealPlanDays || 0
      }
    };

    return NextResponse.json({ data: dashboardData })
  } catch (error) {
    console.error('Dashboard fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update dashboard data (complete exercises/meals)
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
      case 'toggle_exercise':
        // Update player XP for individual exercise
        const { exerciseId, completed, xpChange } = data;
        
        const newXP = Math.max(0, player.experience + xpChange);
        const newLevel = Math.floor(newXP / 100) + 1;

        await prisma.player.update({
          where: { id: player.id },
          data: { 
            experience: newXP,
            level: newLevel
          }
        });

        // Handle exercise completion in database
        if (completed) {
          // Create exercise completion record
          await prisma.exerciseCompletion.create({
            data: {
              playerId: player.id,
              exerciseId: exerciseId,
              date: new Date()
            }
          });
        } else {
          // Remove exercise completion record
          await prisma.exerciseCompletion.deleteMany({
            where: {
              playerId: player.id,
              exerciseId: exerciseId,
              date: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lt: new Date(new Date().setHours(23, 59, 59, 999))
              }
            }
          });
        }
        break;

      case 'complete_workout':
        // Create a workout session for today if it doesn't exist
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existingWorkout = await prisma.workoutSession.findFirst({
          where: {
            playerId: player.id,
            date: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        });

        if (!existingWorkout) {
          await prisma.workoutSession.create({
            data: {
              playerId: player.id,
              date: new Date(),
              workoutType: 'Full Body Workout',
              duration: 60,
              notes: 'Completed daily workout routine'
            }
          });
        }
        break;

      case 'toggle_meal':
        // Update player XP for individual meal
        const { mealType, mealCompleted, mealXpChange } = data;
        
        const newMealXP = Math.max(0, player.experience + mealXpChange);
        const newMealLevel = Math.floor(newMealXP / 100) + 1;

        await prisma.player.update({
          where: { id: player.id },
          data: { 
            experience: newMealXP,
            level: newMealLevel
          }
        });

        // If completing a meal, create/update meal entry
        if (mealCompleted) {
          const existingMeal = await prisma.mealPlanEntry.findFirst({
            where: {
              playerId: player.id,
              mealType: mealType,
              date: {
                gte: new Date(new Date().setHours(0, 0, 0, 0))
              }
            }
          });

          if (!existingMeal) {
            await prisma.mealPlanEntry.create({
              data: {
                playerId: player.id,
                date: new Date(),
                mealType: mealType,
                calories: data.calories || 500,
                notes: `Completed ${mealType} meal`
              }
            });
          }
        } else {
          // If uncompleting a meal, remove the entry
          await prisma.mealPlanEntry.deleteMany({
            where: {
              playerId: player.id,
              mealType: mealType,
              date: {
                gte: new Date(new Date().setHours(0, 0, 0, 0))
              }
            }
          });
        }
        break;

      case 'complete_meal':
        // Legacy support - create a meal entry for the specified meal type
        const existingMealLegacy = await prisma.mealPlanEntry.findFirst({
          where: {
            playerId: player.id,
            mealType: data.mealType,
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        });

        if (!existingMealLegacy) {
          await prisma.mealPlanEntry.create({
            data: {
              playerId: player.id,
              date: new Date(),
              mealType: data.mealType,
              calories: data.calories || 500,
              notes: `Completed ${data.mealType} meal`
            }
          });
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action type' },
          { status: 400 }
        )
    }

    return NextResponse.json(
      { message: 'Action completed successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Dashboard update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
