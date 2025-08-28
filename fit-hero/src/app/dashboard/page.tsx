'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import LogoutButton from '@/components/LogoutButton';

interface DashboardData {
  player: {
    name: string;
    level: number;
    currentXP: number;
    xpToNextLevel: number;
    xpPercentage: number;
    character: {
      id: string;
      name: string;
      imagePath: string;
    };
  };
  workoutPlan: Array<{
    id: string;
    name: string;
    exercises: Array<{
      id: string;
      name: string;
      completed: boolean;
      xp: number;
    }>;
    icon: string;
  }>;
  mealPlan: {
    [key: string]: {
      name: string;
      calories: number;
      protein: string;
      carbs: string;
      fat: string;
      ingredients: string[];
      icon: string;
      completed: boolean;
    };
  };
  stats: {
    currentWeight?: number;
    workoutStreak: number;
    mealStreak: number;
    totalWorkoutDays: number;
    totalMealPlanDays: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const result = await response.json();
        setDashboardData(result.data);
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check authentication status
    if (status === 'loading') return; // Still loading
    
    if (status === 'unauthenticated') {
      console.log('🚫 Dashboard: User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      console.log('✅ Dashboard: User authenticated, loading dashboard');
      setIsVisible(true);
      fetchDashboardData();
    }
    
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    
    return () => clearInterval(timeInterval);
  }, [status, router]);

  const handleExerciseToggle = async (sectionId: string, exerciseId: string) => {
    if (!dashboardData) return;

    // Find the exercise being toggled to get its XP value
    const section = dashboardData.workoutPlan.find(s => s.id === sectionId);
    const exercise = section?.exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    const wasCompleted = exercise.completed;
    const exerciseXP = exercise.xp;

    // Update local state immediately for better UX
    const updatedWorkoutPlan = dashboardData.workoutPlan.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            exercises: section.exercises.map(exercise =>
              exercise.id === exerciseId 
                ? { ...exercise, completed: !exercise.completed }
                : exercise
            )
          }
        : section
    );

    // Calculate XP change based on checking/unchecking
    let xpChange = 0;
    if (!wasCompleted) {
      // Checking the exercise - add XP
      xpChange = exerciseXP;
    } else {
      // Unchecking the exercise - subtract XP
      xpChange = -exerciseXP;
    }

    // Update XP and level
    const newTotalXP = Math.max(0, dashboardData.player.currentXP + xpChange);
    const newLevel = Math.floor(newTotalXP / 100) + 1;

    setDashboardData({
      ...dashboardData,
      workoutPlan: updatedWorkoutPlan,
      player: {
        ...dashboardData.player,
        currentXP: newTotalXP,
        level: newLevel,
        xpPercentage: (newTotalXP % 100)
      }
    });

    // Make API call to persist the individual exercise completion and XP change
    try {
      await fetch('/api/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'toggle_exercise',
          data: {
            exerciseId,
            completed: !wasCompleted,
            xpChange
          }
        }),
      });
    } catch (error) {
      console.error('Error toggling exercise:', error);
    }
  };

  const handleMealToggle = async (mealType: string) => {
    if (!dashboardData) return;

    const wasCompleted = dashboardData.mealPlan[mealType].completed;
    const mealXP = 25; // XP for each meal

    // Calculate XP change based on checking/unchecking
    let xpChange = 0;
    if (!wasCompleted) {
      // Checking the meal - add XP
      xpChange = mealXP;
    } else {
      // Unchecking the meal - subtract XP
      xpChange = -mealXP;
    }

    // Update XP and level
    const newTotalXP = Math.max(0, dashboardData.player.currentXP + xpChange);
    const newLevel = Math.floor(newTotalXP / 100) + 1;

    // Update local state immediately for better UX
    setDashboardData({
      ...dashboardData,
      mealPlan: {
        ...dashboardData.mealPlan,
        [mealType]: {
          ...dashboardData.mealPlan[mealType],
          completed: !wasCompleted
        }
      },
      player: {
        ...dashboardData.player,
        currentXP: newTotalXP,
        level: newLevel,
        xpPercentage: (newTotalXP % 100)
      }
    });

    // Make API call to persist the meal completion and XP change
    try {
      await fetch('/api/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'toggle_meal',
          data: {
            mealType,
            mealCompleted: !wasCompleted,
            mealXpChange: xpChange,
            calories: dashboardData.mealPlan[mealType].calories
          }
        }),
      });
    } catch (error) {
      console.error('Error toggling meal:', error);
    }
  };

  const getWorkoutProgress = () => {
    if (!dashboardData) return 0;
    const totalExercises = dashboardData.workoutPlan.reduce((total, section) => total + section.exercises.length, 0);
    const completedExercises = dashboardData.workoutPlan.reduce((total, section) => 
      total + section.exercises.filter(exercise => exercise.completed).length, 0
    );
    return totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
  };

  const getTotalXPEarned = () => {
    if (!dashboardData) return 0;
    return dashboardData.workoutPlan.reduce((total, section) => 
      total + section.exercises.filter(exercise => exercise.completed)
        .reduce((sectionTotal, exercise) => sectionTotal + exercise.xp, 0), 0
    );
  };

  const getTotalPossibleXP = () => {
    if (!dashboardData) return 0;
    return dashboardData.workoutPlan.reduce((total, section) => 
      total + section.exercises.reduce((sectionTotal, exercise) => sectionTotal + exercise.xp, 0), 0
    );
  };

  const getXPPercentage = () => {
    if (!dashboardData) return 0;
    return dashboardData.player.xpPercentage;
  };

  const getTotalDailyCalories = () => {
    if (!dashboardData) return 0;
    return Object.values(dashboardData.mealPlan).reduce((total, meal) => total + meal.calories, 0);
  };

  const getMealProgress = () => {
    if (!dashboardData) return 0;
    const totalMeals = Object.keys(dashboardData.mealPlan).length;
    const completedMeals = Object.values(dashboardData.mealPlan).filter(meal => meal.completed).length;
    return Math.round((completedMeals / totalMeals) * 100);
  };

  const getMealStatus = () => {
    const progress = getMealProgress();
    if (progress === 100) return "COMPLETE";
    if (progress >= 75) return "EXCELLENT";
    if (progress >= 50) return "ON TRACK";
    if (progress >= 25) return "BEHIND";
    return "START NOW";
  };

  // Show loading state while checking authentication
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⚡</div>
          <div className="text-xl">Loading Dashboard...</div>
          <div className="text-sm text-gray-400 mt-2">
            {status === 'loading' ? 'Authenticating user...' : 'Fetching player data...'}
          </div>
        </div>
      </div>
    );
  }

  // Show unauthorized state (shouldn't happen due to middleware, but good fallback)
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-black text-red-400 font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <div className="text-xl mb-4">Access Denied</div>
          <div className="text-sm text-gray-400 mb-4">Please log in to access the dashboard</div>
          <button 
            onClick={() => router.push('/login')}
            className="px-4 py-2 border border-red-600 rounded hover:bg-red-900/20 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show loading state if dashboard data is not available
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🏃‍♂️</div>
          <div className="text-xl">No player data found</div>
          <div className="text-sm text-gray-400 mt-2">
            Please complete your character creation first
          </div>
          <button 
            onClick={() => router.push('/character-creation')}
            className="mt-4 px-4 py-2 border border-green-600 rounded hover:bg-green-900/20 transition-colors"
          >
            Create Character
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono relative overflow-hidden">
      {/* Matrix Background */}
      <div className="matrix-bg"></div>
      <div className="scanlines"></div>
      
      {/* Terminal Header */}
      <div className={`bg-gray-900 border-b border-green-500 p-4 transition-all duration-1000 ${isVisible ? 'animate-slide-in-bottom' : 'opacity-0'}`}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse delay-100"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-200"></div>
            <span className="text-green-400 text-lg font-bold ml-4">FIT_HERO.exe</span>
          </div>
          <div className="text-green-400 text-sm font-mono ml-8">
            [DASHBOARD] - v3.0.1
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className={`bg-gray-800 p-3 border-b border-green-800 transition-all duration-1000 delay-300 ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <LogoutButton 
              redirectTo="/"
              variant="default"
              className="font-mono"
            />
          </div>
          <div className="text-cyan-400 text-sm font-mono">
            ONLINE: {currentTime}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Player Stats Header */}
        <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'} mb-8`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Player Info */}
            <div className="border border-green-800 rounded-lg bg-gray-900 p-6">
              <div className="flex items-center space-x-4">
                <Image 
                  src={dashboardData.player.character.imagePath}
                  alt={dashboardData.player.character.name}
                  width={64}
                  height={64}
                  className="pixel-character-image filter-orange"
                />
                <div>
                  <div className="text-cyan-400 text-xl font-bold">{dashboardData.player.name}</div>
                  <div className="text-green-400 text-sm">{dashboardData.player.character.name}</div>
                  <div className="text-gray-400 text-xs">FITNESS WARRIOR</div>
                </div>
              </div>
            </div>

            {/* Level & XP */}
            <div className="border border-green-800 rounded-lg bg-gray-900 p-6">
              <div className="text-center">
                <div className="text-green-400 text-sm mb-2">LEVEL</div>
                <div className="text-cyan-400 text-3xl font-bold mb-2">{dashboardData.player.level}</div>
                <div className="text-gray-400 text-xs">
                  {dashboardData.player.currentXP} / {dashboardData.player.xpToNextLevel} XP
                </div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="border border-green-800 rounded-lg bg-gray-900 p-6">
              <div className="text-green-400 text-sm mb-2">XP PROGRESS</div>
              <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-cyan-400 h-4 rounded-full transition-all duration-1000 animate-glow"
                  style={{ width: `${getXPPercentage()}%` }}
                ></div>
              </div>
              <div className="text-cyan-400 text-xs text-center">
                {Math.round(getXPPercentage())}% to Level {dashboardData.player.level + 1}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Daily Workout Plan */}
          <div className={`transition-all duration-1000 delay-700 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="border border-green-800 rounded-lg bg-gray-900 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="text-green-400 text-xl font-bold">💪 TODAY&apos;S WORKOUT</div>
                <div className="text-cyan-400 text-sm font-mono bg-black px-3 py-1 rounded border border-cyan-600">
                  {Math.round(getWorkoutProgress())}% COMPLETE
                </div>
              </div>

              <div className="space-y-6">
                {dashboardData.workoutPlan.map((section) => (
                  <div 
                    key={section.id}
                    className="border border-green-700 rounded-lg p-4 bg-gray-800"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-2xl">{section.icon}</span>
                      <div className="text-green-400 font-bold text-lg">{section.name}</div>
                    </div>

                    <div className="space-y-3">
                      {section.exercises.map((exercise) => (
                        <div 
                          key={exercise.id}
                          className="flex items-center justify-between p-2 rounded hover:bg-gray-700 transition-colors duration-200"
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <input
                              type="checkbox"
                              id={exercise.id}
                              checked={exercise.completed}
                              onChange={() => handleExerciseToggle(section.id, exercise.id)}
                              className="w-5 h-5 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                            />
                            <label 
                              htmlFor={exercise.id}
                              className={`flex-1 cursor-pointer transition-colors duration-200 ${
                                exercise.completed 
                                  ? 'text-cyan-400 line-through' 
                                  : 'text-gray-300 hover:text-green-400'
                              }`}
                            >
                              {exercise.name}
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-bold ${
                              exercise.completed ? 'text-cyan-400' : 'text-yellow-400'
                            }`}>
                              +{exercise.xp} XP
                            </span>
                            {exercise.completed && (
                              <span className="text-cyan-400 text-sm">✓</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Workout Progress */}
              <div className="mt-6 p-4 bg-black rounded border border-cyan-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-cyan-400 text-sm font-bold">WORKOUT PROGRESS</div>
                  <div className="text-yellow-400 text-sm font-bold">
                    {dashboardData.workoutPlan.reduce((total, section) => 
                      total + section.exercises.filter(ex => ex.completed).length, 0
                    )} / {dashboardData.workoutPlan.reduce((total, section) => total + section.exercises.length, 0)} EXERCISES
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 mb-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-cyan-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getWorkoutProgress()}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="text-gray-400">
                    XP EARNED: <span className="text-cyan-400 font-bold">{getTotalXPEarned()}</span> / <span className="text-yellow-400">{getTotalPossibleXP()}</span>
                  </div>
                  <div className="text-gray-400">
                    COMPLETION: <span className="text-green-400 font-bold">{Math.round(getWorkoutProgress())}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Meal Plan */}
          <div className={`transition-all duration-1000 delay-900 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="border border-green-800 rounded-lg bg-gray-900 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="text-green-400 text-xl font-bold">🍽️ DAILY MEAL PLAN</div>
                <div className="text-cyan-400 text-sm font-mono bg-black px-3 py-1 rounded border border-cyan-600">
                  {getTotalDailyCalories()} KCAL
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(dashboardData.mealPlan).map(([mealType, meal]) => (
                  <div 
                    key={mealType}
                    className={`border rounded-lg p-4 bg-gray-800 hover:border-green-500 transition-all duration-300 ${
                      meal.completed ? 'border-green-500 bg-green-900/20' : 'border-green-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleMealToggle(mealType)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                            meal.completed 
                              ? 'bg-green-600 border-green-400 text-white' 
                              : 'border-green-600 hover:border-green-400'
                          }`}
                        >
                          {meal.completed && (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                        <span className="text-2xl">{meal.icon}</span>
                        <div>
                          <div className="text-green-400 font-bold text-sm uppercase">
                            {mealType}
                          </div>
                          <div className={`font-bold ${meal.completed ? 'text-green-400 line-through' : 'text-cyan-400'}`}>
                            {meal.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${meal.completed ? 'text-green-400' : 'text-yellow-400'}`}>
                          {meal.calories} kcal
                        </div>
                        {meal.completed && (
                          <div className="text-green-400 text-xs font-bold">✓ COMPLETED</div>
                        )}
                      </div>
                    </div>

                    {/* Macros */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center">
                        <div className="text-red-400 text-xs">PROTEIN</div>
                        <div className="text-white text-sm font-bold">{meal.protein}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-blue-400 text-xs">CARBS</div>
                        <div className="text-white text-sm font-bold">{meal.carbs}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-400 text-xs">FAT</div>
                        <div className="text-white text-sm font-bold">{meal.fat}</div>
                      </div>
                    </div>

                    {/* Ingredients */}
                    <div className="text-gray-400 text-xs">
                      <span className="text-cyan-400">INGREDIENTS:</span> {meal.ingredients.join(', ')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Daily Summary */}
              <div className="mt-6 p-4 bg-black rounded border border-cyan-600">
                <div className="text-cyan-400 text-sm font-bold mb-2">DAILY NUTRITION SUMMARY</div>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400">Total Calories:</span>
                    <span className="text-yellow-400 ml-2 font-bold">{getTotalDailyCalories()}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Meal Progress:</span>
                    <span className="text-green-400 ml-2 font-bold">{getMealProgress()}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className={`ml-2 font-bold ${
                      getMealStatus() === "COMPLETE" ? "text-green-400" :
                      getMealStatus() === "EXCELLENT" ? "text-cyan-400" :
                      getMealStatus() === "ON TRACK" ? "text-yellow-400" :
                      getMealStatus() === "BEHIND" ? "text-orange-400" :
                      "text-red-400"
                    }`}>{getMealStatus()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`transition-all duration-1000 delay-1100 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'} mt-8`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              onClick={() => router.push('/view-progress')}
              className="border border-green-800 bg-gray-900 hover:bg-gray-800 hover:border-green-500 transition-all duration-300 p-6 rounded-lg hover-lift"
            >
              <div className="text-center">
                <span className="text-3xl mb-3 block animate-pulse">📊</span>
                <div className="text-green-400 font-bold text-lg mb-2">VIEW_PROGRESS</div>
                <div className="text-gray-400 text-xs font-mono">$ analyze --stats --charts</div>
              </div>
            </button>
            <button 
              onClick={() => router.push('/achievements')}
              className="border border-purple-800 bg-gray-900 hover:bg-gray-800 hover:border-purple-500 transition-all duration-300 p-6 rounded-lg hover-lift"
            >
              <div className="text-center">
                <span className="text-3xl mb-3 block animate-bounce-slow">🏆</span>
                <div className="text-purple-400 font-bold text-lg mb-2">ACHIEVEMENTS</div>
                <div className="text-gray-400 text-xs font-mono">$ unlock --trophies --badges</div>
              </div>
            </button>
            <button 
              onClick={() => router.push('/settings')}
              className="border border-cyan-800 bg-gray-900 hover:bg-gray-800 hover:border-cyan-500 transition-all duration-300 p-6 rounded-lg hover-lift"
            >
              <div className="text-center">
                <span className="text-3xl mb-3 block animate-rotate-slow">⚙️</span>
                <div className="text-cyan-400 font-bold text-lg mb-2">SETTINGS</div>
                <div className="text-gray-400 text-xs font-mono">$ configure --profile --prefs</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
