'use client';

import { useState } from 'react';

interface WorkoutPlan {
  weekly_schedule: string;
  fitness_level: string;
  goals: string[];
  routines: Array<{
    day: string;
    focus: string;
    exercises: Array<{
      name: string;
      sets: number;
      reps: string;
      rest: string;
    }>;
  }>;
  progression: string;
  safety_notes: string[];
  estimated_duration: string;
  equipment_used: string[];
}

export default function AITestPage() {
  const [loading, setLoading] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateWorkoutPlan = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/workout-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fitness_level: 'beginner',
          goals: ['weight_loss', 'muscle_building'],
          available_time: 30,
          equipment: ['bodyweight'],
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setWorkoutPlan(data.workout_plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🏋️ Fit Hero AI Test Page
          </h1>
          <p className="text-lg text-gray-600">
            Test the AI-powered workout plan generation
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="text-center">
            <button
              onClick={generateWorkoutPlan}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-8 rounded-lg text-lg transition duration-200"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                '🚀 Generate AI Workout Plan'
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {workoutPlan && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🎯 Your Personalized Workout Plan
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">📅 Schedule</h3>
                <p className="text-blue-700">{workoutPlan.weekly_schedule}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">⏱️ Duration</h3>
                <p className="text-green-700">{workoutPlan.estimated_duration}</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">🎯 Level</h3>
                <p className="text-purple-700 capitalize">{workoutPlan.fitness_level}</p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-800 mb-2">🏋️ Equipment</h3>
                <p className="text-orange-700">{workoutPlan.equipment_used.join(', ')}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">📋 Workout Routines</h3>
              <div className="space-y-4">
                {workoutPlan.routines.map((routine, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-lg text-gray-800 mb-2">
                      {routine.day} - {routine.focus}
                    </h4>
                    <div className="grid gap-2">
                      {routine.exercises.map((exercise, exIndex) => (
                        <div key={exIndex} className="bg-gray-50 p-3 rounded flex justify-between items-center">
                          <span className="font-medium">{exercise.name}</span>
                          <span className="text-sm text-gray-600">
                            {exercise.sets} sets × {exercise.reps} reps • Rest: {exercise.rest}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">📈 Progression</h3>
              <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">{workoutPlan.progression}</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">⚠️ Safety Notes</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {workoutPlan.safety_notes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            🤖 Powered by Gemini 2.0 Flash (fallback to mock data when AI service is unavailable)
          </p>
        </div>
      </div>
    </div>
  );
}
