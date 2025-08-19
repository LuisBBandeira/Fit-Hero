'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Achievement {
  id: number;
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
  const [isVisible, setIsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock achievements data
  const achievements: Achievement[] = [
    // Workout Achievements
    {
      id: 1,
      name: 'FIRST STEPS',
      description: 'Complete your first workout session',
      icon: '👟',
      category: 'workout',
      unlocked: true,
      unlockedDate: '2024-12-15',
      rarity: 'common',
      points: 10
    },
    {
      id: 2,
      name: 'WEEK WARRIOR',
      description: 'Complete 7 consecutive days of workouts',
      icon: '🗓️',
      category: 'workout',
      unlocked: true,
      unlockedDate: '2024-12-22',
      rarity: 'uncommon',
      points: 25
    },
    {
      id: 3,
      name: 'CENTURY CLUB',
      description: 'Complete 100 total workout sessions',
      icon: '💯',
      category: 'workout',
      unlocked: false,
      progress: 67,
      maxProgress: 100,
      rarity: 'rare',
      points: 100
    },
    {
      id: 4,
      name: 'IRON WILL',
      description: 'Complete 30 consecutive days of workouts',
      icon: '⚡',
      category: 'workout',
      unlocked: false,
      progress: 15,
      maxProgress: 30,
      rarity: 'epic',
      points: 150
    },

    // Weight Loss Achievements
    {
      id: 5,
      name: 'FIRST POUND',
      description: 'Lose your first kilogram',
      icon: '📉',
      category: 'weight',
      unlocked: true,
      unlockedDate: '2024-12-18',
      rarity: 'common',
      points: 15
    },
    {
      id: 6,
      name: 'TRANSFORMATION',
      description: 'Lose 10 kilograms',
      icon: '🦋',
      category: 'weight',
      unlocked: false,
      progress: 3.5,
      maxProgress: 10,
      rarity: 'rare',
      points: 200
    },

    // Nutrition Achievements
    {
      id: 7,
      name: 'MEAL MASTER',
      description: 'Complete 50 meal plans',
      icon: '🍽️',
      category: 'nutrition',
      unlocked: true,
      unlockedDate: '2025-01-05',
      rarity: 'uncommon',
      points: 30
    },
    {
      id: 8,
      name: 'HYDRATION HERO',
      description: 'Drink 8 glasses of water for 7 consecutive days',
      icon: '💧',
      category: 'nutrition',
      unlocked: false,
      progress: 4,
      maxProgress: 7,
      rarity: 'common',
      points: 20
    },

    // Special Achievements
    {
      id: 9,
      name: 'PERFECTIONIST',
      description: 'Complete every daily quest for a full week',
      icon: '⭐',
      category: 'special',
      unlocked: false,
      progress: 3,
      maxProgress: 7,
      rarity: 'legendary',
      points: 500
    },
    {
      id: 10,
      name: 'EARLY BIRD',
      description: 'Complete workouts before 8 AM for 10 days',
      icon: '🌅',
      category: 'special',
      unlocked: false,
      progress: 2,
      maxProgress: 10,
      rarity: 'epic',
      points: 100
    }
  ];

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
          <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 hover-glow">
            ← BACK_TO_DASHBOARD
          </Link>
          <div className="text-cyan-400 text-sm font-mono bg-black px-3 py-1 rounded border border-cyan-600">
            $ view_achievements --all
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header Section */}
        <div className={`text-center mb-8 transition-all duration-1000 delay-500 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="text-green-400 text-4xl font-bold mb-4 animate-pulse">
            🏆 ACHIEVEMENTS VAULT
          </div>
          <div className="text-gray-300 text-lg mb-6">
            Track your fitness journey milestones and unlock new challenges
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border border-green-800 rounded-lg bg-gray-900 p-4">
              <div className="text-green-400 text-2xl font-bold" style={{ textShadow: '0 0 10px currentColor' }}>
                {unlockedCount}/{achievements.length}
              </div>
              <div className="text-gray-300 text-sm">UNLOCKED</div>
            </div>
            <div className="border border-cyan-800 rounded-lg bg-gray-900 p-4">
              <div className="text-cyan-400 text-2xl font-bold" style={{ textShadow: '0 0 10px currentColor' }}>
                {totalPoints}
              </div>
              <div className="text-gray-300 text-sm">TOTAL POINTS</div>
            </div>
            <div className="border border-yellow-800 rounded-lg bg-gray-900 p-4">
              <div className="text-yellow-400 text-2xl font-bold" style={{ textShadow: '0 0 10px currentColor' }}>
                {Math.round((unlockedCount / achievements.length) * 100)}%
              </div>
              <div className="text-gray-300 text-sm">COMPLETION</div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className={`mb-8 transition-all duration-1000 delay-700 ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded border transition-all duration-300 font-mono text-sm hover-lift ${
                  selectedCategory === category.id
                    ? 'border-cyan-400 bg-cyan-900/20 text-cyan-400'
                    : 'border-green-800 bg-gray-900 text-green-400 hover:border-green-400'
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Achievements Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-1000 delay-900 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`border-2 rounded-lg p-6 transition-all duration-300 hover-lift ${
                achievement.unlocked
                  ? `${rarityColors[achievement.rarity as keyof typeof rarityColors]} bg-gray-800 hover:shadow-lg`
                  : 'border-gray-700 bg-gray-900 opacity-75 hover:opacity-90'
              }`}
            >
              <div className="text-center">
                {/* Achievement Icon */}
                <div className="text-6xl mb-4 animate-bounce-slow">
                  {achievement.unlocked ? achievement.icon : '🔒'}
                </div>
                
                {/* Achievement Info */}
                <div className={`font-bold text-lg mb-2 ${
                  achievement.unlocked 
                    ? rarityColors[achievement.rarity as keyof typeof rarityColors].split(' ')[0]
                    : 'text-gray-500'
                }`}>
                  {achievement.name}
                </div>
                
                <div className="text-gray-300 text-sm mb-4">
                  {achievement.description}
                </div>

                {/* Rarity Badge */}
                <div className={`inline-block px-2 py-1 rounded text-xs font-mono mb-4 border ${
                  achievement.unlocked 
                    ? rarityColors[achievement.rarity as keyof typeof rarityColors]
                    : 'text-gray-500 border-gray-600'
                }`}>
                  {achievement.rarity.toUpperCase()}
                </div>

                {/* Progress or Unlock Date */}
                {achievement.unlocked ? (
                  <div className="space-y-2">
                    <div className="text-green-400 text-sm font-mono">
                      ✅ UNLOCKED: {achievement.unlockedDate}
                    </div>
                    <div className="text-cyan-400 text-sm font-mono">
                      +{achievement.points} POINTS
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {achievement.progress !== undefined && achievement.maxProgress && (
                      <>
                        <div className="text-gray-400 text-sm font-mono">
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
                    <div className="text-gray-500 text-sm font-mono">
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
        <div className={`mt-12 border border-cyan-800 rounded-lg bg-gray-900 p-6 transition-all duration-1000 delay-1100 ${isVisible ? 'animate-slide-in-bottom' : 'opacity-0'}`}>
          <div className="text-cyan-400 text-xl font-bold mb-4">💡 ACHIEVEMENT TIPS</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <span className="text-green-400">• CONSISTENCY</span> - Complete daily workouts to unlock streak achievements
            </div>
            <div>
              <span className="text-blue-400">• NUTRITION</span> - Follow meal plans to earn nutrition-based rewards
            </div>
            <div>
              <span className="text-purple-400">• CHALLENGES</span> - Push your limits to unlock epic achievements
            </div>
            <div>
              <span className="text-yellow-400">• PATIENCE</span> - Legendary achievements require long-term commitment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
