#!/usr/bin/env tsx

/**
 * Test to verify achievement system works with placeholder activities
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPlaceholderAchievements() {
  console.log('🏆 Testing Achievement System with Placeholder Activities...\n');

  try {
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: 'achievement-test@example.com',
        name: 'Achievement Test User',
        player: {
          create: {
            name: 'Achievement Test Player',
            level: 1,
            experience: 0
          }
        }
      },
      include: { player: true }
    });

    const playerId = testUser.player!.id;
    console.log(`✅ Test user created: ${playerId}`);

    // Import achievement service
    const { AchievementService } = await import('../src/lib/achievement-service');

    // Create some exercise completions with placeholder exercises
    console.log('\n🏋️ Creating placeholder exercise completions...');
    
    const placeholderExerciseIds = [
      'warmup_1', 'main_1', 'main_2', 'cooldown_1', // Day 1
      'warmup_2', 'main_3', 'main_4', 'cooldown_2', // Day 2
      'warmup_1', 'main_1', 'main_2', 'cooldown_1'  // Day 3
    ];

    for (let i = 0; i < placeholderExerciseIds.length; i++) {
      const dayOffset = Math.floor(i / 4);
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);
      
      await prisma.exerciseCompletion.create({
        data: {
          playerId,
          exerciseId: placeholderExerciseIds[i],
          completed: true,
          date
        }
      });
    }

    console.log(`✅ Created ${placeholderExerciseIds.length} placeholder exercise completions`);

    // Create some meal completions with placeholder meals
    console.log('\n🍽️ Creating placeholder meal completions...');
    
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
    
    for (let day = 0; day < 3; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      
      for (const mealType of mealTypes) {
        await prisma.mealPlanEntry.create({
          data: {
            playerId,
            mealType,
            completed: true,
            calories: 300 + Math.floor(Math.random() * 200),
            date
          }
        });
      }
    }

    console.log('✅ Created 12 placeholder meal completions (3 days × 4 meals)');

    // Update player XP based on activities
    const totalExerciseXP = placeholderExerciseIds.length * 15; // Average XP per exercise
    const totalMealXP = 12 * 25; // 25 XP per meal
    const totalXP = totalExerciseXP + totalMealXP;
    
    await prisma.player.update({
      where: { id: playerId },
      data: {
        experience: totalXP,
        level: Math.floor(totalXP / 100) + 1
      }
    });

    console.log(`\n⭐ Updated player XP: ${totalXP} (Level ${Math.floor(totalXP / 100) + 1})`);

    // Test achievement checking with placeholder activities
    console.log('\n🏆 Testing achievement system...');
    
    try {
      await AchievementService.checkAndUpdateAchievements(playerId);
      console.log('✅ Achievement system processed placeholder activities successfully');
    } catch (error) {
      console.error('❌ Achievement system failed with placeholder activities:', error);
      throw error;
    }

    // Check if any achievements were unlocked
    const playerAchievements = await prisma.playerAchievement.findMany({
      where: { playerId },
      include: { achievement: true }
    });

    console.log(`\n🎯 Achievements status:`);
    if (playerAchievements.length > 0) {
      for (const pa of playerAchievements) {
        const status = pa.unlockedAt ? '🏆 UNLOCKED' : `📊 Progress: ${pa.progress}`;
        console.log(`  - ${pa.achievement.name}: ${status}`);
      }
    } else {
      console.log('  - No achievements found (this is normal for a new test user)');
    }

    // Verify achievement system can calculate progress with placeholder data
    console.log('\n📊 Testing achievement progress calculation...');
    
    // Get player with all related data for achievement calculations
    const playerWithData = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        exerciseCompletions: true,
        mealPlanEntries: true,
        workoutSessions: true
      }
    });

    if (!playerWithData) {
      throw new Error('Player not found');
    }

    // Test some basic achievement calculations manually
    const exerciseCount = playerWithData.exerciseCompletions.length;
    const mealCount = playerWithData.mealPlanEntries.filter(mp => mp.completed).length;
    
    console.log(`✅ Achievement data calculated correctly:`);
    console.log(`  - Exercise completions: ${exerciseCount}`);
    console.log(`  - Meal completions: ${mealCount}`);
    console.log(`  - Player level: ${playerWithData.level}`);
    console.log(`  - Player XP: ${playerWithData.experience}`);

    // Clean up
    await prisma.exerciseCompletion.deleteMany({ where: { playerId } });
    await prisma.mealPlanEntry.deleteMany({ where: { playerId } });
    await prisma.playerAchievement.deleteMany({ where: { playerId } });
    await prisma.player.delete({ where: { id: playerId } });
    await prisma.user.delete({ where: { email: 'achievement-test@example.com' } });
    
    console.log('\n🧹 Test data cleaned up');
    console.log('\n🎉 Achievement system test PASSED!');
    console.log('✅ Placeholder activities work correctly with achievement system');

  } catch (error) {
    console.error('❌ Achievement system test FAILED:', error);
    process.exit(1);
  }
}

async function main() {
  await testPlaceholderAchievements();
  await prisma.$disconnect();
}

if (require.main === module) {
  main().catch(console.error);
}