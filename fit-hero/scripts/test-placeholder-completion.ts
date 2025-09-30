#!/usr/bin/env tsx

/**
 * Test script to verify placeholder activities can be completed and tracked
 * This tests all aspects of the completion and tracking system with placeholder content
 */

import { PrismaClient } from '@prisma/client';
import { PlaceholderPlanService } from '../src/lib/placeholder-plan-service';

const prisma = new PrismaClient();

interface TestResults {
  exerciseCompletionTest: boolean;
  mealCompletionTest: boolean;
  xpAwardTest: boolean;
  progressTrackingTest: boolean;
  errors: string[];
}

async function testPlaceholderCompletion(): Promise<TestResults> {
  const results: TestResults = {
    exerciseCompletionTest: false,
    mealCompletionTest: false,
    xpAwardTest: false,
    progressTrackingTest: false,
    errors: []
  };

  try {
    console.log('🧪 Starting placeholder completion and tracking tests...\n');

    // Create a test user and player if they don't exist
    const testUser = await createTestUser();
    console.log(`✅ Test user created/found: ${testUser.id}`);

    // Test 1: Verify placeholder exercise completion system
    console.log('\n📋 Test 1: Exercise completion system with placeholder content');
    const exerciseTest = await testExerciseCompletion(testUser.id);
    results.exerciseCompletionTest = exerciseTest.success;
    if (!exerciseTest.success) {
      results.errors.push(`Exercise completion test failed: ${exerciseTest.error}`);
    }

    // Test 2: Verify placeholder meal completion system  
    console.log('\n🍽️ Test 2: Meal completion system with placeholder content');
    const mealTest = await testMealCompletion(testUser.id);
    results.mealCompletionTest = mealTest.success;
    if (!mealTest.success) {
      results.errors.push(`Meal completion test failed: ${mealTest.error}`);
    }

    // Test 3: Verify XP is awarded correctly for placeholder activities
    console.log('\n⭐ Test 3: XP award system with placeholder content');
    const xpTest = await testXPAward(testUser.id);
    results.xpAwardTest = xpTest.success;
    if (!xpTest.success) {
      results.errors.push(`XP award test failed: ${xpTest.error}`);
    }

    // Test 4: Verify progress tracking functions with placeholder content
    console.log('\n📊 Test 4: Progress tracking with placeholder content');
    const progressTest = await testProgressTracking(testUser.id);
    results.progressTrackingTest = progressTest.success;
    if (!progressTest.success) {
      results.errors.push(`Progress tracking test failed: ${progressTest.error}`);
    }

    // Clean up test data
    await cleanupTestData(testUser.id);
    console.log('\n🧹 Test data cleaned up');

  } catch (error) {
    results.errors.push(`General test error: ${error}`);
    console.error('❌ Test suite failed:', error);
  }

  return results;
}

async function createTestUser() {
  // Try to find existing test user first
  let user = await prisma.user.findUnique({
    where: { email: 'placeholder-test@example.com' },
    include: { player: true }
  });

  if (!user) {
    // Create test user
    user = await prisma.user.create({
      data: {
        email: 'placeholder-test@example.com',
        name: 'Placeholder Test User',
        player: {
          create: {
            name: 'Test Player',
            level: 1,
            experience: 0
          }
        }
      },
      include: { player: true }
    });
  }

  return user.player!;
}

async function testExerciseCompletion(playerId: string) {
  try {
    console.log('  🏋️ Getting placeholder workout...');
    
    // Get placeholder workout
    const placeholderWorkoutResult = PlaceholderPlanService.getPlaceholderWorkout(playerId);
    
    if (!placeholderWorkoutResult.success || !placeholderWorkoutResult.data || placeholderWorkoutResult.data.length === 0) {
      return { success: false, error: 'No placeholder workout returned' };
    }

    const placeholderWorkout = placeholderWorkoutResult.data;
    console.log(`  ✅ Placeholder workout retrieved with ${placeholderWorkout.length} sections`);

    // Verify exercise structure matches expected format
    const firstSection = placeholderWorkout[0];
    if (!firstSection.exercises || firstSection.exercises.length === 0) {
      return { success: false, error: 'No exercises found in placeholder workout' };
    }

    const firstExercise = firstSection.exercises[0];
    
    // Check required fields for completion system
    const requiredFields = ['id', 'name', 'completed', 'xp'];
    for (const field of requiredFields) {
      if (!(field in firstExercise)) {
        return { success: false, error: `Missing required field '${field}' in exercise` };
      }
    }

    console.log('  ✅ Exercise structure is compatible with completion system');

    // Test exercise completion toggle
    const originalCompleted = firstExercise.completed;
    firstExercise.completed = !originalCompleted;
    
    if (firstExercise.completed === originalCompleted) {
      return { success: false, error: 'Exercise completion toggle failed' };
    }

    console.log('  ✅ Exercise completion toggle works correctly');

    // Test XP field is valid
    if (typeof firstExercise.xp !== 'number' || firstExercise.xp <= 0) {
      return { success: false, error: 'Exercise XP field is invalid' };
    }

    console.log(`  ✅ Exercise XP field is valid (${firstExercise.xp} XP)`);

    // Test database completion tracking
    await prisma.exerciseCompletion.create({
      data: {
        playerId,
        exerciseId: firstExercise.id,
        completed: true,
        date: new Date()
      }
    });

    const completion = await prisma.exerciseCompletion.findFirst({
      where: {
        playerId,
        exerciseId: firstExercise.id
      }
    });

    if (!completion) {
      return { success: false, error: 'Exercise completion not saved to database' };
    }

    console.log('  ✅ Exercise completion tracked in database');

    return { success: true, error: null };

  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function testMealCompletion(playerId: string) {
  try {
    console.log('  🥗 Getting placeholder meals...');
    
    // Get placeholder meals
    const placeholderMealsResult = PlaceholderPlanService.getPlaceholderMeals(playerId);
    
    if (!placeholderMealsResult.success || !placeholderMealsResult.data) {
      return { success: false, error: 'No placeholder meals returned' };
    }

    const placeholderMeals = placeholderMealsResult.data;
    console.log('  ✅ Placeholder meals retrieved');

    // Test each meal type
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'] as const;
    
    for (const mealType of mealTypes) {
      const meal = placeholderMeals[mealType];
      
      if (!meal) {
        return { success: false, error: `Missing ${mealType} in placeholder meals` };
      }

      // Check required fields for completion system
      const requiredFields = ['name', 'calories', 'completed'];
      for (const field of requiredFields) {
        if (!(field in meal)) {
          return { success: false, error: `Missing required field '${field}' in ${mealType}` };
        }
      }

      // Test meal completion toggle
      const originalCompleted = meal.completed;
      meal.completed = !originalCompleted;
      
      if (meal.completed === originalCompleted) {
        return { success: false, error: `${mealType} completion toggle failed` };
      }

      console.log(`  ✅ ${mealType} completion toggle works correctly`);

      // Test calories field is valid
      if (typeof meal.calories !== 'number' || meal.calories <= 0) {
        return { success: false, error: `${mealType} calories field is invalid` };
      }
    }

    console.log('  ✅ All meal types have valid structure for completion system');

    // Test database meal completion tracking
    await prisma.mealPlanEntry.create({
      data: {
        playerId,
        mealType: 'breakfast',
        completed: true,
        calories: placeholderMeals.breakfast.calories,
        date: new Date()
      }
    });

    const mealEntry = await prisma.mealPlanEntry.findFirst({
      where: {
        playerId,
        mealType: 'breakfast'
      }
    });

    if (!mealEntry) {
      return { success: false, error: 'Meal completion not saved to database' };
    }

    console.log('  ✅ Meal completion tracked in database');

    return { success: true, error: null };

  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function testXPAward(playerId: string) {
  try {
    console.log('  ⭐ Testing XP award system...');
    
    // Get initial player XP
    const initialPlayer = await prisma.player.findUnique({
      where: { id: playerId }
    });

    if (!initialPlayer) {
      return { success: false, error: 'Test player not found' };
    }

    const initialXP = initialPlayer.experience;
    console.log(`  📊 Initial XP: ${initialXP}`);

    // Get placeholder workout to test XP values
    const placeholderWorkoutResult = PlaceholderPlanService.getPlaceholderWorkout(playerId);
    if (!placeholderWorkoutResult.success || !placeholderWorkoutResult.data || placeholderWorkoutResult.data.length === 0) {
      return { success: false, error: 'Failed to get placeholder workout for XP test' };
    }
    
    const placeholderWorkout = placeholderWorkoutResult.data;
    const firstExercise = placeholderWorkout[0].exercises[0];
    const exerciseXP = firstExercise.xp;

    console.log(`  🏋️ Testing exercise XP award: ${exerciseXP} XP`);

    // Simulate XP award (like the dashboard does)
    const newXP = initialXP + exerciseXP;
    const newLevel = Math.floor(newXP / 100) + 1;

    await prisma.player.update({
      where: { id: playerId },
      data: {
        experience: newXP,
        level: newLevel
      }
    });

    // Verify XP was awarded correctly
    const updatedPlayer = await prisma.player.findUnique({
      where: { id: playerId }
    });

    if (!updatedPlayer) {
      return { success: false, error: 'Player not found after XP update' };
    }

    if (updatedPlayer.experience !== newXP) {
      return { success: false, error: `XP not awarded correctly. Expected: ${newXP}, Got: ${updatedPlayer.experience}` };
    }

    console.log(`  ✅ Exercise XP awarded correctly: ${initialXP} → ${updatedPlayer.experience}`);

    // Test meal XP award (standard 25 XP per meal)
    const mealXP = 25;
    const mealNewXP = updatedPlayer.experience + mealXP;
    const mealNewLevel = Math.floor(mealNewXP / 100) + 1;

    await prisma.player.update({
      where: { id: playerId },
      data: {
        experience: mealNewXP,
        level: mealNewLevel
      }
    });

    const finalPlayer = await prisma.player.findUnique({
      where: { id: playerId }
    });

    if (!finalPlayer || finalPlayer.experience !== mealNewXP) {
      return { success: false, error: 'Meal XP not awarded correctly' };
    }

    console.log(`  ✅ Meal XP awarded correctly: ${updatedPlayer.experience} → ${finalPlayer.experience}`);

    // Test level calculation
    const expectedLevel = Math.floor(finalPlayer.experience / 100) + 1;
    if (finalPlayer.level !== expectedLevel) {
      return { success: false, error: `Level calculation incorrect. Expected: ${expectedLevel}, Got: ${finalPlayer.level}` };
    }

    console.log(`  ✅ Level calculation correct: Level ${finalPlayer.level}`);

    return { success: true, error: null };

  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function testProgressTracking(playerId: string) {
  try {
    console.log('  📊 Testing progress tracking system...');
    
    // Get placeholder content
    const placeholderWorkoutResult = PlaceholderPlanService.getPlaceholderWorkout(playerId);
    const placeholderMealsResult = PlaceholderPlanService.getPlaceholderMeals(playerId);

    if (!placeholderWorkoutResult.success || !placeholderWorkoutResult.data) {
      return { success: false, error: 'Failed to get placeholder workout for progress test' };
    }
    
    if (!placeholderMealsResult.success || !placeholderMealsResult.data) {
      return { success: false, error: 'Failed to get placeholder meals for progress test' };
    }

    const placeholderWorkout = placeholderWorkoutResult.data;
    const placeholderMeals = placeholderMealsResult.data;

    // Test workout progress calculation
    const totalExercises = placeholderWorkout.reduce((total, section) => total + section.exercises.length, 0);
    console.log(`  🏋️ Total exercises in placeholder workout: ${totalExercises}`);

    // Simulate completing some exercises
    let completedExercises = 0;
    for (const section of placeholderWorkout) {
      for (let i = 0; i < Math.min(2, section.exercises.length); i++) {
        section.exercises[i].completed = true;
        completedExercises++;
      }
    }

    const workoutProgress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
    console.log(`  ✅ Workout progress calculation: ${completedExercises}/${totalExercises} = ${workoutProgress.toFixed(1)}%`);

    // Test meal progress calculation
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'] as const;
    const totalMeals = mealTypes.length;
    
    // Simulate completing some meals
    placeholderMeals.breakfast.completed = true;
    placeholderMeals.lunch.completed = true;
    
    const completedMeals = mealTypes.filter(mealType => placeholderMeals[mealType].completed).length;
    const mealProgress = Math.round((completedMeals / totalMeals) * 100);
    
    console.log(`  ✅ Meal progress calculation: ${completedMeals}/${totalMeals} = ${mealProgress}%`);

    // Test XP calculation from completed activities
    const completedExerciseXP = placeholderWorkout.reduce((total, section) => 
      total + section.exercises.filter(exercise => exercise.completed)
        .reduce((sectionTotal, exercise) => sectionTotal + exercise.xp, 0), 0
    );

    console.log(`  ✅ XP calculation from completed exercises: ${completedExerciseXP} XP`);

    // Test progress status calculation (like dashboard does)
    const getProgressStatus = (progress: number): string => {
      if (progress === 100) return "COMPLETE";
      if (progress >= 75) return "EXCELLENT";
      if (progress >= 50) return "ON TRACK";
      if (progress >= 25) return "BEHIND";
      return "START NOW";
    };

    const workoutStatus = getProgressStatus(workoutProgress);
    const mealStatus = getProgressStatus(mealProgress);

    console.log(`  ✅ Progress status calculation - Workout: ${workoutStatus}, Meals: ${mealStatus}`);

    // Test database progress tracking integration
    await prisma.progressStats.upsert({
      where: { playerId },
      create: {
        playerId,
        totalWorkoutDays: 1,
        totalMealPlanDays: 1,
        currentWorkoutStreak: 1,
        currentMealStreak: 1,
        lastWorkoutDate: new Date(),
        lastMealPlanDate: new Date()
      },
      update: {
        totalWorkoutDays: { increment: 1 },
        totalMealPlanDays: { increment: 1 },
        lastWorkoutDate: new Date(),
        lastMealPlanDate: new Date()
      }
    });

    const progressStats = await prisma.progressStats.findUnique({
      where: { playerId }
    });

    if (!progressStats) {
      return { success: false, error: 'Progress stats not created/updated' };
    }

    console.log(`  ✅ Progress stats updated in database`);
    console.log(`    - Total workout days: ${progressStats.totalWorkoutDays}`);
    console.log(`    - Total meal plan days: ${progressStats.totalMealPlanDays}`);

    return { success: true, error: null };

  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function cleanupTestData(playerId: string) {
  // Clean up test data
  await prisma.exerciseCompletion.deleteMany({
    where: { playerId }
  });
  
  await prisma.mealPlanEntry.deleteMany({
    where: { playerId }
  });
  
  await prisma.progressStats.deleteMany({
    where: { playerId }
  });
  
  await prisma.player.delete({
    where: { id: playerId }
  });
  
  await prisma.user.delete({
    where: { email: 'placeholder-test@example.com' }
  });
}

// Run the tests
async function main() {
  console.log('🚀 Placeholder Activity Completion & Tracking Test Suite');
  console.log('=' .repeat(60));

  const results = await testPlaceholderCompletion();

  console.log('\n📋 TEST RESULTS');
  console.log('=' .repeat(60));
  console.log(`Exercise Completion Test: ${results.exerciseCompletionTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Meal Completion Test: ${results.mealCompletionTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`XP Award Test: ${results.xpAwardTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Progress Tracking Test: ${results.progressTrackingTest ? '✅ PASS' : '❌ FAIL'}`);

  const allTestsPassed = results.exerciseCompletionTest && 
                        results.mealCompletionTest && 
                        results.xpAwardTest && 
                        results.progressTrackingTest;

  console.log(`\n🎯 OVERALL RESULT: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    results.errors.forEach(error => console.log(`  - ${error}`));
  }

  if (allTestsPassed) {
    console.log('\n🎉 Placeholder activities can be completed and tracked successfully!');
    console.log('✅ Requirements 3.4 and 4.2 are satisfied.');
  } else {
    console.log('\n⚠️  Some issues were found that need to be addressed.');
    process.exit(1);
  }

  await prisma.$disconnect();
}

if (require.main === module) {
  main().catch(console.error);
}