'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import LogoutButton from '@/components/LogoutButton';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  
  // Player stats (in a real app, this would come from a database/API)
  const [playerData] = useState({
    name: 'FitWarrior_2024',
    level: 12,
    currentXP: 2847,
    xpToNextLevel: 3500,
    character: {
      id: 'warrior',
      name: 'FITNESS WARRIOR',
      imagePath: '/orange_wariar%20/rotations/south.png'
    }
  });

  // Daily workout plan
  const [workoutPlan, setWorkoutPlan] = useState([
    {
      id: 'warmup',
      name: 'WARM-UP',
      exercises: [
        { id: 'jumping-jacks', name: '50 Jumping Jacks', completed: false, xp: 50 },
        { id: 'arm-circles', name: '20 Arm Circles (each direction)', completed: true, xp: 30 },
        { id: 'leg-swings', name: '15 Leg Swings (each leg)', completed: false, xp: 40 }
      ],
      icon: '🔥'
    },
    {
      id: 'strength',
      name: 'STRENGTH TRAINING',
      exercises: [
        { id: 'push-ups', name: '3 sets of 15 Push-ups', completed: false, xp: 100 },
        { id: 'squats', name: '3 sets of 20 Squats', completed: false, xp: 120 },
        { id: 'plank', name: '3 sets of 30s Plank', completed: true, xp: 80 },
        { id: 'lunges', name: '3 sets of 12 Lunges (each leg)', completed: false, xp: 90 }
      ],
      icon: '💪'
    },
    {
      id: 'cardio',
      name: 'CARDIO BLAST',
      exercises: [
        { id: 'burpees', name: '3 sets of 10 Burpees', completed: false, xp: 150 },
        { id: 'mountain-climbers', name: '3 sets of 20 Mountain Climbers', completed: false, xp: 110 },
        { id: 'high-knees', name: '3 sets of 30s High Knees', completed: false, xp: 80 }
      ],
      icon: '❤️'
    },
    {
      id: 'cooldown',
      name: 'COOL DOWN',
      exercises: [
        { id: 'stretching', name: '10 minutes Full Body Stretching', completed: false, xp: 60 },
        { id: 'breathing', name: '5 minutes Deep Breathing', completed: false, xp: 40 }
      ],
      icon: '🧘‍♂️'
    }
  ]);

  // Daily meal plan
  const [mealPlan, setMealPlan] = useState({
    breakfast: {
      name: 'PROTEIN POWER BOWL',
      calories: 450,
      protein: '35g',
      carbs: '25g',
      fat: '18g',
      ingredients: ['Oatmeal', 'Greek Yogurt', 'Berries', 'Almonds', 'Honey'],
      icon: '🥣',
      completed: false
    },
    lunch: {
      name: 'WARRIOR SALAD',
      calories: 520,
      protein: '42g',
      carbs: '30g',
      fat: '22g',
      ingredients: ['Grilled Chicken', 'Mixed Greens', 'Quinoa', 'Avocado', 'Olive Oil'],
      icon: '🥗',
      completed: true
    },
    snack: {
      name: 'ENERGY BOOST',
      calories: 200,
      protein: '15g',
      carbs: '18g',
      fat: '8g',
      ingredients: ['Apple', 'Almond Butter', 'Protein Powder'],
      icon: '🍎',
      completed: false
    },
    dinner: {
      name: 'HERO FEAST',
      calories: 680,
      protein: '48g',
      carbs: '55g',
      fat: '25g',
      ingredients: ['Salmon', 'Sweet Potato', 'Broccoli', 'Brown Rice', 'Herbs'],
      icon: '🍽️',
      completed: false
    }
  });

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
    }
    
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    
    return () => clearInterval(timeInterval);
  }, [status, router]);

  const handleExerciseToggle = (sectionId: string, exerciseId: string) => {
    setWorkoutPlan(prevPlan => 
      prevPlan.map(section => 
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
      )
    );
  };

  const handleMealToggle = (mealType: string) => {
    setMealPlan(prevMeal => ({
      ...prevMeal,
      [mealType]: {
        ...prevMeal[mealType as keyof typeof prevMeal],
        completed: !prevMeal[mealType as keyof typeof prevMeal].completed
      }
    }));
  };

  const getWorkoutProgress = () => {
    const totalExercises = workoutPlan.reduce((total, section) => total + section.exercises.length, 0);
    const completedExercises = workoutPlan.reduce((total, section) => 
      total + section.exercises.filter(exercise => exercise.completed).length, 0
    );
    return totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
  };

  const getTotalXPEarned = () => {
    return workoutPlan.reduce((total, section) => 
      total + section.exercises.filter(exercise => exercise.completed)
        .reduce((sectionTotal, exercise) => sectionTotal + exercise.xp, 0), 0
    );
  };

  const getTotalPossibleXP = () => {
    return workoutPlan.reduce((total, section) => 
      total + section.exercises.reduce((sectionTotal, exercise) => sectionTotal + exercise.xp, 0), 0
    );
  };

  const getXPPercentage = () => {
    return (playerData.currentXP / playerData.xpToNextLevel) * 100;
  };

  const getTotalDailyCalories = () => {
    return Object.values(mealPlan).reduce((total, meal) => total + meal.calories, 0);
  };

  const getMealProgress = () => {
    const totalMeals = Object.keys(mealPlan).length;
    const completedMeals = Object.values(mealPlan).filter(meal => meal.completed).length;
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
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⚡</div>
          <div className="text-xl">Loading Dashboard...</div>
          <div className="text-sm text-gray-400 mt-2">Authenticating user...</div>
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
                  src={playerData.character.imagePath}
                  alt={playerData.character.name}
                  width={64}
                  height={64}
                  className="pixel-character-image filter-orange"
                />
                <div>
                  <div className="text-cyan-400 text-xl font-bold">{playerData.name}</div>
                  <div className="text-green-400 text-sm">{playerData.character.name}</div>
                  <div className="text-gray-400 text-xs">FITNESS WARRIOR</div>
                </div>
              </div>
            </div>

            {/* Level & XP */}
            <div className="border border-green-800 rounded-lg bg-gray-900 p-6">
              <div className="text-center">
                <div className="text-green-400 text-sm mb-2">LEVEL</div>
                <div className="text-cyan-400 text-3xl font-bold mb-2">{playerData.level}</div>
                <div className="text-gray-400 text-xs">
                  {playerData.currentXP} / {playerData.xpToNextLevel} XP
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
                {Math.round(getXPPercentage())}% to Level {playerData.level + 1}
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
                {workoutPlan.map((section) => (
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
                    {workoutPlan.reduce((total, section) => 
                      total + section.exercises.filter(ex => ex.completed).length, 0
                    )} / {workoutPlan.reduce((total, section) => total + section.exercises.length, 0)} EXERCISES
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
                {Object.entries(mealPlan).map(([mealType, meal]) => (
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
