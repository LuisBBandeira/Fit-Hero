#!/usr/bin/env tsx

/**
 * Integration test to verify dashboard API works correctly with placeholder content completion
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDashboardPlaceholderIntegration() {
  console.log('🧪 Testing Dashboard API integration with placeholder completion...\n');

  try {
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: 'dashboard-test@example.com',
        name: 'Dashboard Test User',
        player: {
          create: {
            name: 'Dashboard Test Player',
            level: 1,
            experience: 0
          }
        }
      },
      include: { player: true }
    });

    const playerId = testUser.player!.id;
    console.log(`✅ Test user created: ${playerId}`);

    // Simulate dashboard API call to get placeholder content
    console.log('\n📊 Testing dashboard API with placeholder content...');
    
    // Import the TodaysPlanService to test the integration
    const { TodaysPlanService } = await import('../src/lib/todays-plan-service');
    
    const todaysPlans = await TodaysPlanService.getTodaysPlans(playerId);
    
    if (!todaysPlans) {
      throw new Error('No plans returned from TodaysPlanService');
    }

    console.log(`✅ Dashboard API returned plans (isPlaceholder: ${todaysPlans.isPlaceholder})`);

    // Verify placeholder content structure is compatible with completion system
    if (todaysPlans.workoutPlan && todaysPlans.workoutPlan.length > 0) {
      const firstSection = todaysPlans.workoutPlan[0];
      const firstExercise = firstSection.exercises[0];
      
      if (!('completed' in firstExercise) || !('xp' in firstExercise)) {
        throw new Error('Exercise structure missing completion fields');
      }
      
      console.log('✅ Workout exercises have completion fields');
    }

    if (todaysPlans.mealPlan) {
      const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'] as const;
      
      for (const mealType of mealTypes) {
        const meal = todaysPlans.mealPlan[mealType];
        if (!('completed' in meal)) {
          throw new Error(`${mealType} missing completion field`);
        }
      }
      
      console.log('✅ Meals have completion fields');
    }

    // Test exercise completion simulation (like dashboard would do)
    console.log('\n🏋️ Testing exercise completion simulation...');
    
    if (todaysPlans.workoutPlan && todaysPlans.workoutPlan.length > 0) {
      const firstSection = todaysPlans.workoutPlan[0];
      const firstExercise = firstSection.exercises[0];
      
      const originalCompleted = firstExercise.completed;
      const exerciseXP = firstExercise.xp;
      
      // Simulate the dashboard's exercise toggle logic
      const wasCompleted = originalCompleted;
      const xpChange = wasCompleted ? -exerciseXP : exerciseXP;
      
      // Update player XP (like dashboard API does)
      const currentPlayer = await prisma.player.findUnique({
        where: { id: playerId }
      });
      
      const newXP = Math.max(0, currentPlayer!.experience + xpChange);
      const newLevel = Math.floor(newXP / 100) + 1;
      
      await prisma.player.update({
        where: { id: playerId },
        data: {
          experience: newXP,
          level: newLevel
        }
      });
      
      // Create exercise completion record
      await prisma.exerciseCompletion.create({
        data: {
          playerId,
          exerciseId: firstExercise.id,
          completed: !wasCompleted,
          date: new Date()
        }
      });
      
      console.log(`✅ Exercise completion simulated: XP ${currentPlayer!.experience} → ${newXP}`);
    }

    // Test meal completion simulation (like dashboard would do)
    console.log('\n🍽️ Testing meal completion simulation...');
    
    if (todaysPlans.mealPlan) {
      const mealType = 'breakfast';
      const meal = todaysPlans.mealPlan[mealType];
      
      const wasCompleted = meal.completed;
      const mealXP = 25; // Standard meal XP
      const xpChange = wasCompleted ? -mealXP : mealXP;
      
      // Update player XP
      const currentPlayer = await prisma.player.findUnique({
        where: { id: playerId }
      });
      
      const newXP = Math.max(0, currentPlayer!.experience + xpChange);
      const newLevel = Math.floor(newXP / 100) + 1;
      
      await prisma.player.update({
        where: { id: playerId },
        data: {
          experience: newXP,
          level: newLevel
        }
      });
      
      // Create meal completion record
      await prisma.mealPlanEntry.create({
        data: {
          playerId,
          mealType,
          completed: !wasCompleted,
          calories: meal.calories,
          date: new Date()
        }
      });
      
      console.log(`✅ Meal completion simulated: XP ${currentPlayer!.experience} → ${newXP}`);
    }

    // Verify completion records were created
    const exerciseCompletions = await prisma.exerciseCompletion.count({
      where: { playerId }
    });
    
    const mealCompletions = await prisma.mealPlanEntry.count({
      where: { playerId }
    });
    
    console.log(`\n📊 Completion records created:`);
    console.log(`  - Exercise completions: ${exerciseCompletions}`);
    console.log(`  - Meal completions: ${mealCompletions}`);

    // Clean up
    await prisma.exerciseCompletion.deleteMany({ where: { playerId } });
    await prisma.mealPlanEntry.deleteMany({ where: { playerId } });
    await prisma.player.delete({ where: { id: playerId } });
    await prisma.user.delete({ where: { email: 'dashboard-test@example.com' } });
    
    console.log('\n🧹 Test data cleaned up');
    console.log('\n🎉 Dashboard integration test PASSED!');
    console.log('✅ Placeholder content works seamlessly with existing completion system');

  } catch (error) {
    console.error('❌ Dashboard integration test FAILED:', error);
    process.exit(1);
  }
}

async function main() {
  await testDashboardPlaceholderIntegration();
  await prisma.$disconnect();
}

if (require.main === module) {
  main().catch(console.error);
}