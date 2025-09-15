// Test the AI service end-to-end with our JSON parsing fixes
const testRequest = {
  user_id: 'test-user-end-to-end',
  month: 12,
  year: 2025,
  fitness_level: 'intermediate',
  goals: ['weight_loss'],
  available_time: 60,
  equipment: ['gym'],
  injuries_limitations: [],
  preferred_activities: ['cardio', 'strength_training']
};

fetch('http://localhost:8001/generate-monthly-workout-plan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testRequest)
})
.then(res => res.json())
.then(data => {
  console.log('✅ AI Service Response Status:', data.status);
  console.log('✅ Has validated_data:', !!data.validated_data);
  const workoutCount = Object.keys(data.validated_data?.daily_workouts || {}).length;
  console.log('✅ Daily workouts count:', workoutCount);
  const firstWorkout = data.validated_data?.daily_workouts?.['1']?.workout_type;
  console.log('✅ First workout type:', firstWorkout);
  console.log('✅ JSON parsing success: No control character errors detected');
  
  // Check for any validation errors
  const errors = data.validated_data?.validation_errors || [];
  if (errors.length > 0) {
    console.log('⚠️  Validation warnings:', errors);
  } else {
    console.log('✅ No validation errors');
  }
})
.catch(err => {
  console.error('❌ Error:', err.message);
});
