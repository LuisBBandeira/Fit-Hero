/**
 * Test script to directly test database storage via monthly plan service
 * This bypasses Next.js authentication to test the core functionality
 */

const { monthlyPlanService } = require('../src/lib/monthly-plan-service.ts');

async function testDatabaseStorage() {
  console.log('🧪 Testing Database Storage via Monthly Plan Service');
  console.log('='.repeat(60));
  
  const testParams = {
    month: 1,
    year: 2025,
    fitnessLevel: 'intermediate',
    goals: ['muscle_gain', 'strength'],
    availableTime: 60,
    equipment: ['gym'],
    injuries: [],
    preferences: ['weightlifting']
  };
  
  const testPlayerId = 'test-player-db-storage-123';
  
  try {
    console.log('📊 Generating monthly workout plan...');
    const result = await monthlyPlanService.generateMonthlyWorkoutPlan(
      testPlayerId,
      testParams
    );
    
    console.log('✅ Monthly plan generation completed');
    console.log(`📋 Plan ID: ${result.id}`);
    console.log(`📅 Status: ${result.status}`);
    console.log(`🎯 Month/Year: ${result.month}/${result.year}`);
    
    if (result.errorLog) {
      console.log('⚠️  Error log present:');
      console.log(JSON.stringify(result.errorLog, null, 2));
    }
    
    // Check if we have workout data
    if (result.filteredData && typeof result.filteredData === 'object') {
      const workoutData = result.filteredData;
      if (workoutData.daily_workouts) {
        const workoutCount = Object.keys(workoutData.daily_workouts).length;
        console.log(`💪 Daily workouts stored: ${workoutCount}`);
      }
    }
    
    console.log('\n✅ Database storage test completed successfully!');
    return result;
    
  } catch (error) {
    console.error('❌ Database storage test failed:');
    console.error(error.message);
    if (error.stack) {
      console.error('Stack trace:');
      console.error(error.stack);
    }
    return null;
  }
}

// Run the test
testDatabaseStorage()
  .then((result) => {
    if (result) {
      console.log('\n🎉 Test successful - data was stored in database');
      process.exit(0);
    } else {
      console.log('\n💥 Test failed');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
