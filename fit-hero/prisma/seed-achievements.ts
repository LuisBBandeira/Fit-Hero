import { PrismaClient, AchievementCategory, AchievementRarity } from '@prisma/client';

const prisma = new PrismaClient();

const achievements = [
  // Workout Achievements
  {
    name: 'FIRST STEPS',
    description: 'Complete your first workout session',
    icon: '👟',
    category: AchievementCategory.WORKOUT,
    rarity: AchievementRarity.COMMON,
    points: 10,
    requirement: JSON.stringify({ type: 'workout_count', value: 1 }),
    maxProgress: 1
  },
  {
    name: 'WEEK WARRIOR',
    description: 'Complete 7 consecutive days of workouts',
    icon: '🗓️',
    category: AchievementCategory.WORKOUT,
    rarity: AchievementRarity.UNCOMMON,
    points: 25,
    requirement: JSON.stringify({ type: 'workout_streak', value: 7 }),
    maxProgress: 7
  },
  {
    name: 'CENTURY CLUB',
    description: 'Complete 100 total workout sessions',
    icon: '💯',
    category: AchievementCategory.WORKOUT,
    rarity: AchievementRarity.RARE,
    points: 100,
    requirement: JSON.stringify({ type: 'workout_count', value: 100 }),
    maxProgress: 100
  },
  {
    name: 'IRON WILL',
    description: 'Complete 30 consecutive days of workouts',
    icon: '⚡',
    category: AchievementCategory.WORKOUT,
    rarity: AchievementRarity.EPIC,
    points: 150,
    requirement: JSON.stringify({ type: 'workout_streak', value: 30 }),
    maxProgress: 30
  },

  // Weight Loss Achievements
  {
    name: 'FIRST POUND',
    description: 'Lose your first kilogram',
    icon: '📉',
    category: AchievementCategory.WEIGHT,
    rarity: AchievementRarity.COMMON,
    points: 15,
    requirement: JSON.stringify({ type: 'weight_loss', value: 1 }),
    maxProgress: 1
  },
  {
    name: 'TRANSFORMATION',
    description: 'Lose 10 kilograms',
    icon: '🦋',
    category: AchievementCategory.WEIGHT,
    rarity: AchievementRarity.RARE,
    points: 200,
    requirement: JSON.stringify({ type: 'weight_loss', value: 10 }),
    maxProgress: 10
  },

  // Nutrition Achievements
  {
    name: 'MEAL MASTER',
    description: 'Complete 50 meal plans',
    icon: '🍽️',
    category: AchievementCategory.NUTRITION,
    rarity: AchievementRarity.UNCOMMON,
    points: 30,
    requirement: JSON.stringify({ type: 'meal_count', value: 50 }),
    maxProgress: 50
  },
  {
    name: 'HYDRATION HERO',
    description: 'Drink 8 glasses of water for 7 consecutive days',
    icon: '💧',
    category: AchievementCategory.NUTRITION,
    rarity: AchievementRarity.COMMON,
    points: 20,
    requirement: JSON.stringify({ type: 'hydration_streak', value: 7 }),
    maxProgress: 7
  },

  // Special Achievements
  {
    name: 'PERFECTIONIST',
    description: 'Complete every daily quest for a full week',
    icon: '⭐',
    category: AchievementCategory.SPECIAL,
    rarity: AchievementRarity.LEGENDARY,
    points: 500,
    requirement: JSON.stringify({ type: 'perfect_week', value: 1 }),
    maxProgress: 1
  },
  {
    name: 'EARLY BIRD',
    description: 'Complete workouts before 8 AM for 10 days',
    icon: '🌅',
    category: AchievementCategory.SPECIAL,
    rarity: AchievementRarity.EPIC,
    points: 100,
    requirement: JSON.stringify({ type: 'early_workout', value: 10 }),
    maxProgress: 10
  }
];

async function main() {
  console.log('Seeding achievements...');
  
  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: achievement,
      create: achievement
    });
  }
  
  console.log('Achievements seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
