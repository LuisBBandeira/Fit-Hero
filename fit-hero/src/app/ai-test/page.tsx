'use client';

import { useState } from 'react';

interface MonthlyPlan {
  id?: string;
  month?: number;
  year?: number;
  status?: string;
  filteredData?: any;
  validatedData?: any;
  rawAiResponse?: any;
  errorLog?: any;
}

interface APIResponse {
  success: boolean;
  monthly_plan?: MonthlyPlan;
  workout_plan?: any;
  recommendations?: any;
  error?: string;
}

interface TestParams {
  month: number;
  year: number;
  fitness_level: string;
  goals: string[];
  available_time: number;
  equipment: string[];
}

export default function AITestPage() {
  const [loading, setLoading] = useState(false);
  const [workoutLoading, setWorkoutLoading] = useState(false);
  const [mealLoading, setMealLoading] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [testParams, setTestParams] = useState<TestParams>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    fitness_level: 'intermediate',
    goals: ['muscle_gain', 'strength'],
    available_time: 60,
    equipment: ['gym']
  });
  const [directAIResponse, setDirectAIResponse] = useState<any>(null);
  const [showRawData, setShowRawData] = useState(false);

  // Test direct AI service call (bypassing database)
  const testDirectAI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8001/generate-monthly-workout-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: `test-user-${Date.now()}`,
          month: testParams.month,
          year: testParams.year,
          fitness_level: testParams.fitness_level,
          goals: testParams.goals,
          available_time: testParams.available_time,
          equipment: testParams.equipment,
          injuries_limitations: [],
          preferred_activities: []
        }),
      });

      if (!response.ok) {
        throw new Error(`AI Service Error: ${response.status}`);
      }

      const data = await response.json();
      setDirectAIResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred testing direct AI service');
    } finally {
      setLoading(false);
    }
  };

  const generateWorkoutPlan = async () => {
    setWorkoutLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/test-workout-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testParams),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data: APIResponse = await response.json();
      
      if (data.monthly_plan) {
        setWorkoutPlan(data.monthly_plan);
      } else if (data.workout_plan) {
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
      const response = await fetch('/api/ai/test-meal-recommendations', {
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
          month: testParams.month,
          year: testParams.year
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data: APIResponse = await response.json();
      
      if (data.monthly_plan) {
        setMealPlan(data.monthly_plan);
      } else if (data.recommendations) {
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

  const updateTestParams = (key: keyof TestParams, value: any) => {
    setTestParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            <img src="/test-tube.png" alt="Testing" className="w-6 h-6 inline mr-2" />
            AI Service Testing Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Test the complete AI pipeline: Direct AI Service → Filter → Database Storage
          </p>
        </div>

        {/* Test Parameters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <img src="/gear.png" alt="Parameters" className="w-6 h-6 mr-2" />
            Test Parameters
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select 
                value={testParams.month} 
                onChange={(e) => updateTestParams('month', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {Array.from({length: 12}, (_, i) => (
                  <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select 
                value={testParams.year} 
                onChange={(e) => updateTestParams('year', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fitness Level</label>
              <select 
                value={testParams.fitness_level} 
                onChange={(e) => updateTestParams('fitness_level', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available Time (min)</label>
              <input 
                type="number" 
                value={testParams.available_time} 
                onChange={(e) => updateTestParams('available_time', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                min="15" max="120" step="15"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goals</label>
              <select 
                multiple 
                value={testParams.goals} 
                onChange={(e) => updateTestParams('goals', Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="strength">Strength</option>
                <option value="endurance">Endurance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
              <select 
                multiple 
                value={testParams.equipment} 
                onChange={(e) => updateTestParams('equipment', Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="gym">Gym</option>
                <option value="bodyweight">Bodyweight</option>
                <option value="dumbbells">Dumbbells</option>
                <option value="resistance_bands">Resistance Bands</option>
              </select>
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <img src="/gear.png" alt="Service Test" className="w-6 h-6 mr-2" />
              Direct AI Service Test
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Tests the AI service directly (bypasses authentication and database)
            </p>
            <button
              onClick={testDirectAI}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-semibold py-3 px-8 rounded-lg text-lg transition duration-200 w-full"
            >
              {loading ? 'Testing...' : (
                <>
                  <img src="/gear.png" alt="Test" className="w-5 h-5 inline mr-2" />
                  Test AI Service
                </>
              )}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <img src="/gym.png" alt="Workout" className="w-6 h-6 mr-2" />
              Full Workout Pipeline
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Tests the complete workflow: AI → Filter → Database → Validation
            </p>
            <button
              onClick={generateWorkoutPlan}
              disabled={workoutLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-8 rounded-lg text-lg transition duration-200 w-full"
            >
              {workoutLoading ? 'Generating...' : (
                <>
                  <img src="/gym.png" alt="Workout" className="w-5 h-5 inline mr-2" />
                  Generate Workout Plan
                </>
              )}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <img src="/salad.png" alt="Meal Plan" className="w-6 h-6 mr-2" />
              Meal Plan Generator
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Tests meal plan generation and database storage
            </p>
            <button
              onClick={generateMealPlan}
              disabled={mealLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 px-8 rounded-lg text-lg transition duration-200 w-full"
            >
              {mealLoading ? 'Generating...' : (
                <>
                  <img src="/salad.png" alt="Meal Plan" className="w-5 h-5 inline mr-2" />
                  Generate Meal Plan
                </>
              )}
            </button>
          </div>
        </div>

        {/* Toggle for Raw Data */}
        <div className="mb-6 text-center">
          <button
            onClick={() => setShowRawData(!showRawData)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            {showRawData ? 'Hide' : 'Show'} Raw Data & Debug Info
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Direct AI Response */}
        {directAIResponse && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              <img src="/gear.png" alt="Service" className="w-5 h-5 inline mr-2" />
              Direct AI Service Response
            </h2>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Status</h3>
                <p className="text-blue-700 text-sm">{directAIResponse.status || 'Unknown'}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">AI Success</h3>
                <p className="text-green-700 text-sm">
                  {directAIResponse.raw_response?.success ? '✅ Success' : '❌ Failed'}
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">Daily Workouts</h3>
                <p className="text-purple-700 text-sm">
                  {directAIResponse.filtered_data?.daily_workouts ? 
                    Object.keys(directAIResponse.filtered_data.daily_workouts).length + ' days' : 
                    'N/A'
                  }
                </p>
              </div>
            </div>

            {showRawData && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Validation Errors:</h4>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(directAIResponse.validated_data?.validation_errors || [], null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Sample Daily Workout:</h4>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-48">
                    {JSON.stringify(directAIResponse.filtered_data?.daily_workouts?.['1'] || {}, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Workout Plan Section */}
          {workoutPlan && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                <img src="/target.png" alt="Target" className="w-5 h-5 inline mr-2" />
                Database Stored Workout Plan
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <img src="/floppy-disk.png" alt="Plan Info" className="w-5 h-5 mr-2" />
                    Plan Info
                  </h3>
                  <p className="text-blue-700 text-sm">
                    Month: {workoutPlan.month}/{workoutPlan.year}<br/>
                    Status: {workoutPlan.status}
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                    <img src="/hourglass.png" alt="Details" className="w-5 h-5 mr-2" />
                    Details
                  </h3>
                  <p className="text-green-700 text-sm">
                    Fitness Level: {workoutPlan.fitnessLevel}<br/>
                    Time: {workoutPlan.availableTime}min
                  </p>
                </div>
              </div>

              {showRawData && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Database Record:</h4>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-32">
                      {JSON.stringify({
                        id: workoutPlan.id,
                        status: workoutPlan.status,
                        month: workoutPlan.month,
                        year: workoutPlan.year,
                        goals: workoutPlan.goals,
                        equipment: workoutPlan.equipment
                      }, null, 2)}
                    </pre>
                  </div>
                  
                  {workoutPlan.errorLog && (
                    <div>
                      <h4 className="font-semibold mb-2 text-red-600">Error Log:</h4>
                      <pre className="bg-red-50 p-3 rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(workoutPlan.errorLog, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {(workoutPlan.filteredData || workoutPlan.validatedData) && (
                    <div>
                      <h4 className="font-semibold mb-2">Sample Workout Data:</h4>
                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-48">
                        {JSON.stringify(
                          (workoutPlan.validatedData?.daily_workouts || workoutPlan.filteredData?.daily_workouts)?.['1'] || {}, 
                          null, 2
                        )}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Update Button */}
              <div className="mt-6">
                <button
                  onClick={generateWorkoutPlan}
                  disabled={workoutLoading}
                  className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
                >
                  {workoutLoading ? 'Updating...' : (
                    <>
                      <img src="/gear.png" alt="Update" className="w-4 h-4 inline mr-1" />
                      Update Plan
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Meal Plan Section */}
          {mealPlan && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                <img src="/salad.png" alt="Meal Plan" className="w-5 h-5 inline mr-2" />
                Database Stored Meal Plan
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                    <img src="/floppy-disk.png" alt="Plan Info" className="w-5 h-5 mr-2" />
                    Plan Info
                  </h3>
                  <p className="text-green-700 text-sm">
                    Month: {mealPlan.month}/{mealPlan.year}<br/>
                    Status: {mealPlan.status}
                  </p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
                    <img src="/target.png" alt="Target" className="w-5 h-5 mr-2" />
                    Target
                  </h3>
                  <p className="text-yellow-700 text-sm">
                    Calories: {mealPlan.calorieTarget}<br/>
                    Budget: {mealPlan.budgetRange}
                  </p>
                </div>
              </div>

              {showRawData && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Database Record:</h4>
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-32">
                      {JSON.stringify({
                        id: mealPlan.id,
                        status: mealPlan.status,
                        month: mealPlan.month,
                        year: mealPlan.year,
                        calorieTarget: mealPlan.calorieTarget,
                        budgetRange: mealPlan.budgetRange
                      }, null, 2)}
                    </pre>
                  </div>
                  
                  {(mealPlan.filteredData || mealPlan.validatedData) && (
                    <div>
                      <h4 className="font-semibold mb-2">Sample Meal Data:</h4>
                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-48">
                        {JSON.stringify(
                          (mealPlan.validatedData?.daily_meals || mealPlan.filteredData?.daily_meals)?.['1'] || {}, 
                          null, 2
                        )}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Update Button */}
              <div className="mt-6">
                <button
                  onClick={generateMealPlan}
                  disabled={mealLoading}
                  className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
                >
                  {mealLoading ? 'Updating...' : (
                    <>
                      <img src="/gear.png" alt="Update" className="w-4 h-4 inline mr-1" />
                      Update Plan
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <img src="/test-tube.png" alt="Instructions" className="w-6 h-6 mr-2" />
            Testing Instructions
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>1. Direct AI Test:</strong> Tests the AI service directly to verify JSON parsing fixes</p>
            <p><strong>2. Full Pipeline Test:</strong> Tests the complete workflow including database storage</p>
            <p><strong>3. Update Plans:</strong> Use the update buttons to regenerate plans with the same parameters</p>
            <p><strong>4. Raw Data:</strong> Toggle to see detailed response data, validation errors, and debug info</p>
            <p><strong>5. Parameters:</strong> Modify test parameters to test different scenarios</p>
          </div>
        </div>
      </div>
    </div>
  );
}
