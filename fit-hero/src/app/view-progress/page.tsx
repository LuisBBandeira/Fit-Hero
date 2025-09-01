'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function ViewProgressPage() {
  const { data: session, status } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [weeklyWeight, setWeeklyWeight] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // User progress data from database
  const [progressData, setProgressData] = useState({
    workoutStreak: 0,
    mealPlanStreak: 0,
    totalWorkoutDays: 0,
    totalMealPlanDays: 0,
    currentWeight: 0,
    startingWeight: 0,
    weightLoss: 0,
    weightLossLastMonth: 0,
    weightLossLastSixMonths: 0,
    weightLossLastYear: 0,
    averageWeightLossPerMonth: 0,
    lastWorkoutDate: null,
    lastMealPlanDate: null,
    lastWeightUpdate: null
  });

  useEffect(() => {
    setIsVisible(true);
    
    // Update time every second
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch progress data when session is available
  useEffect(() => {
    const fetchProgressData = async () => {
      if (status === 'loading') return;
      
      if (!session?.user) {
        setError('Please log in to view your progress');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/progress');
        
        if (!response.ok) {
          throw new Error('Failed to fetch progress data');
        }

        const data = await response.json();
        setProgressData(data.progress);
      } catch (err) {
        console.error('Error fetching progress:', err);
        setError('Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [session, status]);

  const handleWeightSubmit = async () => {
    if (weeklyWeight && !isNaN(parseFloat(weeklyWeight))) {
      const newWeight = parseFloat(weeklyWeight);
      
      try {
        const response = await fetch('/api/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'weight',
            data: {
              weight: newWeight,
              date: new Date().toISOString()
            }
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update weight');
        }

        // Update local state
        setProgressData(prev => ({
          ...prev,
          currentWeight: newWeight,
          weightLoss: prev.startingWeight - newWeight
        }));
        
        // Clear input
        setWeeklyWeight('');
        
        // Show success message
        alert(`Weight updated to ${newWeight}kg successfully!`);

        // Refresh progress data
        const progressResponse = await fetch('/api/progress');
        if (progressResponse.ok) {
          const data = await progressResponse.json();
          setProgressData(data.progress);
        }
      } catch (err) {
        console.error('Error updating weight:', err);
        alert('Failed to update weight. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono relative overflow-hidden">
      {/* Matrix Background */}
      <div className="matrix-bg"></div>
      <div className="scanlines"></div>
      
      {/* Terminal Header */}
      <div className={`bg-gray-900 border-b border-green-500 p-4 transition-all duration-1000 ${isVisible ? 'animate-slide-in-bottom' : 'opacity-0'}`}>
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse delay-100"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-200"></div>
            <span className="text-green-400 text-lg font-bold ml-4">FIT_HERO.exe</span>
          </div>
          <div className="text-green-400 text-sm font-mono ml-8">
            [PROGRESS_ANALYTICS] - {currentTime}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className={`bg-gray-800 p-3 border-b border-green-800 transition-all duration-1000 delay-300 ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 hover-glow text-xs sm:text-sm md:text-base">
            ← BACK_TO_DASHBOARD
          </Link>
          <div className="text-cyan-400 text-xs sm:text-sm font-mono bg-black px-2 sm:px-3 py-1 rounded border border-cyan-600 whitespace-nowrap overflow-hidden">
            <span className="hidden md:inline">$ view_progress --analytics --stats</span>
            <span className="md:hidden">$ view_progress</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6">
        {/* Page Title */}
        <div className={`text-center mb-4 md:mb-8 transition-all duration-1000 delay-500 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="text-green-400 text-2xl md:text-3xl font-bold mb-2 md:mb-4 animate-pulse">
            📊 PROGRESS ANALYTICS
          </div>
          <div className="text-gray-300 text-sm md:text-lg mb-2 md:mb-4">
            Track your fitness journey and achievements
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-cyan-400 text-xl mb-4 animate-pulse">
              🔄 LOADING PROGRESS DATA...
            </div>
            <div className="text-gray-400">
              Analyzing your fitness journey...
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-400 text-xl mb-4">
              ❌ ERROR
            </div>
            <div className="text-gray-400 mb-4">
              {error}
            </div>
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 underline">
              Login to continue
            </Link>
          </div>
        )}

        {/* Progress Content - Only show when not loading and no error */}
        {!loading && !error && (
          <>
            {/* Streak Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-8 mb-4 md:mb-10 transition-all duration-1000 delay-700 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {/* Workout Streak */}
          <div className="border-2 border-green-800 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-3 md:p-8 hover-lift shadow-xl hover:shadow-green-400/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-3 md:mb-6">
              <div className="text-green-400 text-sm md:text-2xl font-bold">WORKOUT STREAK</div>
              <div className="text-2xl md:text-5xl animate-bounce-slow">🔥</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl md:text-7xl font-bold text-cyan-400 mb-1 md:mb-3 drop-shadow-lg" style={{textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff'}}>
                {progressData.workoutStreak}
              </div>
              <div className="text-gray-300 text-sm md:text-xl mb-3 md:mb-6 font-semibold">DAYS IN A ROW</div>
              
              <div className="bg-black p-2 md:p-4 rounded-lg border-2 border-green-600 shadow-inner">
                <div className="text-green-400 text-xs md:text-base font-mono">
                  TOTAL WORKOUT DAYS: <span className="text-cyan-400 font-bold">{progressData.totalWorkoutDays}</span>
                </div>
                <div className="text-gray-400 text-xs md:text-sm mt-1 md:mt-2">
                  Keep going! You&apos;re on fire! 🚀
                </div>
              </div>
            </div>
          </div>

          {/* Meal Plan Streak */}
          <div className="border-2 border-green-800 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-3 md:p-8 hover-lift shadow-xl hover:shadow-yellow-400/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-3 md:mb-6">
              <div className="text-green-400 text-sm md:text-2xl font-bold">MEAL PLAN STREAK</div>
              <div className="text-2xl md:text-5xl animate-bounce-slow">🥗</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl md:text-7xl font-bold text-yellow-400 mb-1 md:mb-3 drop-shadow-lg" style={{textShadow: '0 0 10px #fbbf24, 0 0 20px #fbbf24, 0 0 30px #fbbf24'}}>
                {progressData.mealPlanStreak}
              </div>
              <div className="text-gray-300 text-sm md:text-xl mb-3 md:mb-6 font-semibold">DAYS COMPLETED</div>
              
              <div className="bg-black p-2 md:p-4 rounded-lg border-2 border-green-600 shadow-inner">
                <div className="text-green-400 text-xs md:text-base font-mono">
                  TOTAL MEAL DAYS: <span className="text-yellow-400 font-bold">{progressData.totalMealPlanDays}</span>
                </div>
                <div className="text-gray-400 text-xs md:text-sm mt-1 md:mt-2">
                  Nutrition is 80% of success! 💪
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weight Progress Section */}
        <div className={`border-2 border-green-800 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-3 md:p-8 mb-4 md:mb-10 transition-all duration-1000 delay-900 shadow-xl ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="flex items-center justify-between mb-3 md:mb-8">
            <div className="text-green-400 text-sm md:text-3xl font-bold">WEIGHT TRACKING</div>
            <div className="text-2xl md:text-5xl animate-bounce-slow">⚖️</div>
          </div>

          {/* Weight Stats */}
          <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-8 mb-3 md:mb-8">
            <div className="text-center p-2 md:p-6 bg-black rounded-lg border-2 border-green-600 shadow-lg hover:shadow-green-400/20 transition-all duration-300">
              <div className="text-cyan-400 text-xs md:text-base mb-1 md:mb-2 font-bold">CURRENT</div>
              <div className="text-lg md:text-4xl font-bold text-green-400" style={{textShadow: '0 0 10px #10b981, 0 0 20px #10b981'}}>{progressData.currentWeight}kg</div>
            </div>
            
            <div className="text-center p-2 md:p-6 bg-black rounded-lg border-2 border-green-600 shadow-lg hover:shadow-gray-400/20 transition-all duration-300">
              <div className="text-cyan-400 text-xs md:text-base mb-1 md:mb-2 font-bold">STARTING</div>
              <div className="text-lg md:text-4xl font-bold text-gray-400">{progressData.startingWeight}kg</div>
            </div>
            
            <div className="text-center p-2 md:p-6 bg-black rounded-lg border-2 border-green-600 shadow-lg hover:shadow-yellow-400/20 transition-all duration-300">
              <div className="text-cyan-400 text-xs md:text-base mb-1 md:mb-2 font-bold">LOSS</div>
              <div className="text-lg md:text-4xl font-bold text-yellow-400" style={{textShadow: '0 0 10px #fbbf24, 0 0 20px #fbbf24'}}>-{progressData.weightLoss}kg</div>
            </div>
          </div>

          {/* Weight Loss Summary - Mobile Optimized */}
          <div className="mb-3 md:mb-6">
            <div className="text-center mb-2 md:mb-4">
              <div className="text-green-400 text-sm md:text-lg font-bold">
                WEIGHT LOSS SUMMARY
              </div>
              <div className="text-gray-400 text-xs md:text-sm">
                Total weight lost over different time periods
              </div>
            </div>
            
            {/* Mobile: Single column, Desktop: 3 columns */}
            <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
              {/* Last Month */}
              <div className="text-center p-3 md:p-6 bg-black rounded-lg border-2 border-green-600 shadow-lg hover:shadow-green-400/20 transition-all duration-300">
                <div className="flex justify-between items-center md:block">
                  <div className="text-cyan-400 text-xs md:text-base font-bold">LAST MONTH</div>
                  <div className="text-lg md:text-4xl font-bold text-yellow-400" style={{textShadow: '0 0 10px #fbbf24, 0 0 20px #fbbf24'}}>-{progressData.weightLossLastMonth.toFixed(1)}kg</div>
                </div>
                <div className="text-gray-400 text-xs md:text-sm mt-0 md:mt-2 hidden md:block">Past 30 days</div>
              </div>
              
              {/* Last 6 Months */}
              <div className="text-center p-3 md:p-6 bg-black rounded-lg border-2 border-green-600 shadow-lg hover:shadow-green-400/20 transition-all duration-300">
                <div className="flex justify-between items-center md:block">
                  <div className="text-cyan-400 text-xs md:text-base font-bold">LAST 6 MONTHS</div>
                  <div className="text-lg md:text-4xl font-bold text-green-400" style={{textShadow: '0 0 10px #10b981, 0 0 20px #10b981'}}>-{progressData.weightLossLastSixMonths.toFixed(1)}kg</div>
                </div>
                <div className="text-gray-400 text-xs md:text-sm mt-0 md:mt-2 hidden md:block">Past 180 days</div>
              </div>
              
              {/* Last Year */}
              <div className="text-center p-3 md:p-6 bg-black rounded-lg border-2 border-green-600 shadow-lg hover:shadow-cyan-400/20 transition-all duration-300">
                <div className="flex justify-between items-center md:block">
                  <div className="text-cyan-400 text-xs md:text-base font-bold">LAST YEAR</div>
                  <div className="text-lg md:text-4xl font-bold text-cyan-400" style={{textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff'}}>-{progressData.weightLossLastYear.toFixed(1)}kg</div>
                </div>
                <div className="text-gray-400 text-xs md:text-sm mt-0 md:mt-2 hidden md:block">Past 365 days</div>
              </div>
            </div>

            {/* Additional Progress Info */}
            <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg border border-green-600">
              <div className="text-center">
                <div className="text-green-400 text-xs md:text-base font-bold mb-1 md:mb-2">AVERAGE WEIGHT LOSS PER MONTH</div>
                <div className="text-xl md:text-3xl font-bold text-yellow-400" style={{textShadow: '0 0 10px #fbbf24, 0 0 20px #fbbf24'}}>-{progressData.averageWeightLossPerMonth.toFixed(1)}kg</div>
                <div className="text-gray-400 text-xs md:text-sm mt-1 md:mt-2">You&apos;re on track to reach your goal! 🎯</div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Weight Input */}
        <div className={`border border-green-800 rounded-lg bg-gray-900 p-3 md:p-6 transition-all duration-1000 delay-1100 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="flex items-center justify-between mb-3 md:mb-6">
            <div className="text-green-400 text-sm md:text-xl font-bold">UPDATE WEEKLY WEIGHT</div>
            <div className="text-xl md:text-3xl animate-bounce-slow">📝</div>
          </div>

          <div className="max-w-md mx-auto">
            <div className="text-center mb-3 md:mb-4">
              <div className="text-gray-300 mb-2 text-xs md:text-base">
                Enter your current weight (updated weekly)
              </div>
              <div className="text-xs md:text-sm text-cyan-400 bg-black px-2 md:px-3 py-1 rounded border border-cyan-600 inline-block">
                Last updated: {progressData.lastWeightUpdate ? new Date(progressData.lastWeightUpdate).toLocaleDateString() : 'Never'}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2 md:gap-4">
              <input
                type="number"
                value={weeklyWeight}
                onChange={(e) => setWeeklyWeight(e.target.value)}
                placeholder="Enter weight in kg"
                step="0.1"
                min="30"
                max="300"
                className="flex-1 bg-black border border-green-600 rounded px-3 md:px-4 py-2 md:py-3 text-green-400 focus:border-cyan-400 focus:outline-none transition-colors duration-300 font-mono text-center text-sm md:text-base"
              />
              
              <button
                onClick={handleWeightSubmit}
                disabled={!weeklyWeight || isNaN(parseFloat(weeklyWeight))}
                className="btn btn-primary px-4 md:px-6 py-2 md:py-3 disabled:opacity-50 disabled:cursor-not-allowed hover-lift text-sm md:text-base"
              >
                UPDATE
              </button>
            </div>

            <div className="mt-2 md:mt-4 text-center">
              <div className="text-xs text-gray-500">
                💡 Tip: Weigh yourself at the same time each week for consistent tracking
              </div>
            </div>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
