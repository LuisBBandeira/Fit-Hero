'use client';

import { useState } from 'react';

interface MonthlyPlan {
  id?: string;
  month?: number;
  year?: number;
  status?: string;
  filteredData?: any;
  validatedData?: any;
}

interface APIResponse {
  success: boolean;
  monthly_plan?: MonthlyPlan;
  workout_plan?: any; // Backward compatibility
  recommendations?: any; // For meal plans
  error?: string;
}

export default function AITestPage() {
  const [loading, setLoading] = useState(false);
  const [workoutLoading, setWorkoutLoading] = useState(false);
  const [mealLoading, setMealLoading] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateWorkoutPlan = async () => {
    setWorkoutLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/workout-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fitness_level: 'intermediate',
          goals: ['muscle_gain', 'strength'],
          available_time: 45,
          equipment: ['gym'],
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data: APIResponse = await response.json();
      
      // Handle new monthly plan format
      if (data.monthly_plan) {
        setWorkoutPlan(data.monthly_plan.filteredData || data.monthly_plan.validatedData || data.monthly_plan);
      } else if (data.workout_plan) {
        // Backward compatibility
        setWorkoutPlan(data.workout_plan);
      } else {
        throw new Error('No workout plan data received');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred generating workout plan');
    } finally {
      setWorkoutLoading(false);
    }
  };

  const generateMealPlan = async () => {
    setMealLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/meal-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dietary_preferences: ['balanced'],
          calorie_target: 2000,
          allergies: [],
          meal_prep_time: 30,
          budget_range: 'medium',
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data: APIResponse = await response.json();
      
      // Handle new monthly plan format
      if (data.monthly_plan) {
        setMealPlan(data.monthly_plan.filteredData || data.monthly_plan.validatedData || data.monthly_plan);
      } else if (data.recommendations) {
        // Backward compatibility
        setMealPlan(data.recommendations);
      } else {
        throw new Error('No meal plan data received');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred generating meal plan');
    } finally {
      setMealLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🏋️ Fit Hero AI Test Page
          </h1>
          <p className="text-lg text-gray-600">
            Test the AI-powered workout and meal plan generation
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">💪 Workout Plan Generator</h2>
            <div className="text-center">
              <button
                onClick={generateWorkoutPlan}
                disabled={workoutLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-8 rounded-lg text-lg transition duration-200 w-full"
              >
                {workoutLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  '🚀 Generate Workout Plan'
                )}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🍽️ Meal Plan Generator</h2>
            <div className="text-center">
              <button
                onClick={generateMealPlan}
                disabled={mealLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 px-8 rounded-lg text-lg transition duration-200 w-full"
              >
                {mealLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  '🥗 Generate Meal Plan'
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Workout Plan Section */}
          {workoutPlan && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                🎯 Your Personalized Workout Plan
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">📅 Schedule</h3>
                  <p className="text-blue-700 text-sm">{workoutPlan.weekly_schedule || 'N/A'}</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">⏱️ Duration</h3>
                  <p className="text-green-700 text-sm">{workoutPlan.estimated_duration || 'N/A'}</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">🎯 Level</h3>
                  <p className="text-purple-700 text-sm capitalize">{workoutPlan.fitness_level || 'N/A'}</p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">🏋️ Equipment</h3>
                  <p className="text-orange-700 text-sm">
                    {workoutPlan.equipment_used ? 
                      (Array.isArray(workoutPlan.equipment_used) ? 
                        workoutPlan.equipment_used.join(', ') : 
                        workoutPlan.equipment_used) : 
                      'N/A'}
                  </p>
                </div>
              </div>

              {workoutPlan.routines && Array.isArray(workoutPlan.routines) && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">📋 Workout Routines</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {workoutPlan.routines.map((routine: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-lg text-gray-800 mb-2">
                          {routine.day || `Day ${index + 1}`} - {routine.focus || 'Focus not specified'}
                        </h4>
                        {routine.exercises && Array.isArray(routine.exercises) && (
                          <div className="grid gap-2">
                            {routine.exercises.map((exercise: any, exIndex: number) => (
                              <div key={exIndex} className="bg-gray-50 p-3 rounded flex justify-between items-center">
                                <span className="font-medium">{exercise.name || 'Exercise name not specified'}</span>
                                <span className="text-sm text-gray-600">
                                  {exercise.sets ? `${exercise.sets} sets` : ''} 
                                  {exercise.reps ? ` × ${exercise.reps}` : ''} 
                                  {exercise.rest ? ` • Rest: ${exercise.rest}` : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {workoutPlan.progression && (
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">📈 Progression</h3>
                  <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg text-sm">{workoutPlan.progression}</p>
                </div>
              )}

              {workoutPlan.safety_notes && Array.isArray(workoutPlan.safety_notes) && workoutPlan.safety_notes.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">⚠️ Safety Notes</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    {workoutPlan.safety_notes.map((note: any, index: number) => (
                      <li key={index}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-600">View Raw Data</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(workoutPlan, null, 2)}
                </pre>
              </details>
            </div>
          )}

          {/* Meal Plan Section */}
          {mealPlan && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                🍽️ Your Personalized Meal Plan
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">🎯 Calorie Target</h3>
                  <p className="text-green-700 text-sm">{mealPlan.calorie_target || 'N/A'}</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">🥗 Diet Style</h3>
                  <p className="text-blue-700 text-sm">
                    {mealPlan.dietary_preferences ? 
                      (Array.isArray(mealPlan.dietary_preferences) ? 
                        mealPlan.dietary_preferences.join(', ') : 
                        mealPlan.dietary_preferences) : 
                      'N/A'}
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">💰 Budget</h3>
                  <p className="text-purple-700 text-sm capitalize">{mealPlan.budget_range || 'N/A'}</p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">⏱️ Prep Time</h3>
                  <p className="text-orange-700 text-sm">{mealPlan.meal_prep_time ? `${mealPlan.meal_prep_time} min` : 'N/A'}</p>
                </div>
              </div>

              {mealPlan.weekly_meals && Array.isArray(mealPlan.weekly_meals) && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">📅 Weekly Meals</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {mealPlan.weekly_meals.map((day: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-lg text-gray-800 mb-2">
                          {day.day || `Day ${index + 1}`}
                        </h4>
                        {day.meals && Array.isArray(day.meals) && (
                          <div className="grid gap-2">
                            {day.meals.map((meal: any, mealIndex: number) => (
                              <div key={mealIndex} className="bg-gray-50 p-3 rounded flex justify-between items-center">
                                <div>
                                  <span className="font-medium">{meal.name || 'Meal name not specified'}</span>
                                  <span className="text-xs text-gray-600 ml-2">({meal.meal_type || 'Type not specified'})</span>
                                </div>
                                {meal.calories && (
                                  <span className="text-sm text-gray-600">{meal.calories} cal</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mealPlan.nutrition_guidelines && (
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">📊 Nutrition Guidelines</h3>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded-lg text-sm">{mealPlan.nutrition_guidelines}</p>
                </div>
              )}

              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-600">View Raw Data</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(mealPlan, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>

        {!workoutPlan && !mealPlan && !workoutLoading && !mealLoading && (
          <div className="text-center text-gray-500 mt-8 bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-semibold mb-2">🚀 Ready to Test!</h3>
            <p>Generate a workout plan or meal plan to see the AI results here.</p>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            🤖 Powered by Gemini 2.0 Flash (Monthly Plan System with Filter)
          </p>
        </div>
      </div>
    </div>
  );
}
