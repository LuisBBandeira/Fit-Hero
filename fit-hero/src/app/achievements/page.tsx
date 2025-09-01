'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  unlockedDate?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
  progress?: number;
  maxProgress?: number;
}

export default function AchievementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication status first
    if (status === 'loading') return; // Still loading
    
    if (status === 'unauthenticated') {
      console.log('🚫 Achievements: User not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      console.log('✅ Achievements: User authenticated, loading achievements');
      fetchAchievements();
    }
  }, [status, router]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/achievements');
      
      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }
      
      const data = await response.json();
      setAchievements(data.achievements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'ALL ACHIEVEMENTS', icon: '🏆' },
    { id: 'workout', name: 'WORKOUT', icon: '💪' },
    { id: 'weight', name: 'WEIGHT LOSS', icon: '📊' },
    { id: 'nutrition', name: 'NUTRITION', icon: '🥗' },
    { id: 'special', name: 'SPECIAL', icon: '✨' }
  ];

  const rarityColors = {
    common: 'text-gray-400 border-gray-600',
    uncommon: 'text-green-400 border-green-600',
    rare: 'text-blue-400 border-blue-600',
    epic: 'text-purple-400 border-purple-600',
    legendary: 'text-yellow-400 border-yellow-600'
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(achievement => achievement.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);

  useEffect(() => {
    setIsVisible(true);
    
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const getProgressPercentage = (achievement: Achievement) => {
    if (achievement.unlocked) return 100;
    if (!achievement.progress || !achievement.maxProgress) return 0;
    return (achievement.progress / achievement.maxProgress) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🏆</div>
          <div className="text-xl">Loading achievements...</div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-black text-yellow-400 font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <div className="text-xl mb-4">Please log in to view achievements</div>
          <Link href="/login" className="px-4 py-2 border border-yellow-600 rounded hover:bg-yellow-900/20 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-red-400 font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <div className="text-xl mb-4">Error loading achievements</div>
          <div className="text-sm mb-4">{error}</div>
          <div className="space-x-4">
            <button 
              onClick={fetchAchievements}
              className="px-4 py-2 border border-red-600 rounded hover:bg-red-900/20 transition-colors"
            >
              Retry
            </button>
            <Link href="/character-creation" className="px-4 py-2 border border-blue-600 rounded hover:bg-blue-900/20 transition-colors">
              Create Character
            </Link>
          </div>
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
          <div className="text-green-400 text-sm font-mono">
            [ACHIEVEMENTS] - {currentTime}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className={`bg-gray-800 p-3 border-b border-green-800 transition-all duration-1000 delay-300 ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 hover-glow text-xs sm:text-sm md:text-base">
            ← BACK_TO_DASHBOARD
          </Link>
          <div className="text-cyan-400 text-xs sm:text-sm font-mono bg-black px-2 sm:px-3 py-1 rounded border border-cyan-600 whitespace-nowrap overflow-hidden">
            <span className="hidden md:inline">$ view_achievements --all</span>
            <span className="md:hidden">$ achievements</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
        {/* Header Section */}
        <div className={`text-center mb-6 md:mb-8 transition-all duration-1000 delay-500 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="text-green-400 text-2xl md:text-4xl font-bold mb-2 md:mb-4 animate-pulse">
            🏆 ACHIEVEMENTS VAULT
          </div>
          <div className="text-gray-300 text-sm md:text-lg mb-4 md:mb-6">
            Track your fitness journey milestones and unlock new challenges
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-6 mb-6 md:mb-8">
            <div className="border border-green-800 rounded-lg bg-gray-900 p-2 md:p-4">
              <div className="text-green-400 text-lg md:text-2xl font-bold" style={{ textShadow: '0 0 10px currentColor' }}>
                {unlockedCount}/{achievements.length}
              </div>
              <div className="text-gray-300 text-xs md:text-sm">UNLOCKED</div>
            </div>
            <div className="border border-cyan-800 rounded-lg bg-gray-900 p-2 md:p-4">
              <div className="text-cyan-400 text-lg md:text-2xl font-bold" style={{ textShadow: '0 0 10px currentColor' }}>
                {totalPoints}
              </div>
              <div className="text-gray-300 text-xs md:text-sm">TOTAL POINTS</div>
            </div>
            <div className="border border-yellow-800 rounded-lg bg-gray-900 p-2 md:p-4">
              <div className="text-yellow-400 text-lg md:text-2xl font-bold" style={{ textShadow: '0 0 10px currentColor' }}>
                {Math.round((unlockedCount / achievements.length) * 100)}%
              </div>
              <div className="text-gray-300 text-xs md:text-sm">COMPLETION</div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className={`mb-6 md:mb-8 transition-all duration-1000 delay-700 ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
          <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-2 md:px-4 py-1 md:py-2 rounded border transition-all duration-300 font-mono text-xs md:text-sm hover-lift ${
                  selectedCategory === category.id
                    ? 'border-cyan-400 bg-cyan-900/20 text-cyan-400'
                    : 'border-green-800 bg-gray-900 text-green-400 hover:border-green-400'
                }`}
              >
                <span className="hidden md:inline">{category.icon} {category.name}</span>
                <span className="md:hidden flex items-center gap-1">
                  <span>{category.icon}</span>
                  <span className="text-xs">
                    {category.id === 'all' ? 'ALL' : 
                     category.id === 'workout' ? 'WORKOUT' :
                     category.id === 'weight' ? 'WEIGHT' :
                     category.id === 'nutrition' ? 'FOOD' :
                     'SPECIAL'}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Achievements Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 transition-all duration-1000 delay-900 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`border-2 rounded-lg p-3 md:p-6 transition-all duration-300 hover-lift ${
                achievement.unlocked
                  ? `${rarityColors[achievement.rarity as keyof typeof rarityColors]} bg-gray-800 hover:shadow-lg`
                  : 'border-gray-700 bg-gray-900 opacity-75 hover:opacity-90'
              }`}
            >
              <div className="text-center">
                {/* Achievement Icon */}
                <div className="text-4xl md:text-6xl mb-2 md:mb-4 animate-bounce-slow">
                  {achievement.unlocked ? achievement.icon : '🔒'}
                </div>
                
                {/* Achievement Info */}
                <div className={`font-bold text-sm md:text-lg mb-1 md:mb-2 ${
                  achievement.unlocked 
                    ? rarityColors[achievement.rarity as keyof typeof rarityColors].split(' ')[0]
                    : 'text-gray-500'
                }`}>
                  {achievement.name}
                </div>
                
                <div className="text-gray-300 text-xs md:text-sm mb-2 md:mb-4">
                  {achievement.description}
                </div>

                {/* Rarity Badge */}
                <div className={`inline-block px-2 py-1 rounded text-xs font-mono mb-2 md:mb-4 border ${
                  achievement.unlocked 
                    ? rarityColors[achievement.rarity as keyof typeof rarityColors]
                    : 'text-gray-500 border-gray-600'
                }`}>
                  {achievement.rarity.toUpperCase()}
                </div>

                {/* Progress or Unlock Date */}
                {achievement.unlocked ? (
                  <div className="space-y-1 md:space-y-2">
                    <div className="text-green-400 text-xs md:text-sm font-mono">
                      ✅ UNLOCKED: <span className="hidden sm:inline">{achievement.unlockedDate}</span>
                    </div>
                    <div className="text-cyan-400 text-xs md:text-sm font-mono">
                      +{achievement.points} POINTS
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 md:space-y-2">
                    {achievement.progress !== undefined && achievement.maxProgress && (
                      <>
                        <div className="text-gray-400 text-xs md:text-sm font-mono">
                          PROGRESS: {achievement.progress}/{achievement.maxProgress}
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${getProgressPercentage(achievement)}%` }}
                          ></div>
                        </div>
                      </>
                    )}
                    <div className="text-gray-500 text-xs md:text-sm font-mono">
                      REWARD: {achievement.points} POINTS
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <div className="text-gray-400 text-xl mb-2">No achievements in this category yet</div>
            <div className="text-gray-500 text-sm">Keep training to unlock new achievements!</div>
          </div>
        )}

        {/* Achievement Tips */}
        <div className={`mt-8 md:mt-12 border border-cyan-800 rounded-lg bg-gray-900 p-3 md:p-6 transition-all duration-1000 delay-1100 ${isVisible ? 'animate-slide-in-bottom' : 'opacity-0'}`}>
          <div className="text-cyan-400 text-lg md:text-xl font-bold mb-2 md:mb-4">💡 ACHIEVEMENT TIPS</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm text-gray-300">
            <div>
              <span className="text-green-400">• CONSISTENCY</span> - <span className="hidden sm:inline">Complete daily workouts to unlock streak achievements</span><span className="sm:hidden">Daily workouts unlock streaks</span>
            </div>
            <div>
              <span className="text-blue-400">• NUTRITION</span> - <span className="hidden sm:inline">Follow meal plans to earn nutrition-based rewards</span><span className="sm:hidden">Follow meal plans for rewards</span>
            </div>
            <div>
              <span className="text-purple-400">• CHALLENGES</span> - <span className="hidden sm:inline">Push your limits to unlock epic achievements</span><span className="sm:hidden">Push limits for epic rewards</span>
            </div>
            <div>
              <span className="text-yellow-400">• PATIENCE</span> - <span className="hidden sm:inline">Legendary achievements require long-term commitment</span><span className="sm:hidden">Legendary needs commitment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
