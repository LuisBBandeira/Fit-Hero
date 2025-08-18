"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [currentLevel, setCurrentLevel] = useState(42);
  const [xp, setXp] = useState(8547);
  const [maxXp, setMaxXp] = useState(10000);
  const [activeUsers, setActiveUsers] = useState(500);
  const [isTyping, setIsTyping] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [progressStarted, setProgressStarted] = useState(false);

  // Terminal typing effect
  const [terminalText, setTerminalText] = useState("");
  const fullText = "INITIALIZING FITNESS PROTOCOL...";
  
  useEffect(() => {
    setIsVisible(true);
    
    let index = 0;
    setIsTyping(true);
    const typeInterval = setInterval(() => {
      if (index < fullText.length) {
        setTerminalText(fullText.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 100);

    // Start progress animation after a delay
    const progressTimer = setTimeout(() => {
      setProgressStarted(true);
    }, 1500);

    return () => {
      clearInterval(typeInterval);
      clearTimeout(progressTimer);
    };
  }, []);

  // Simulate real-time updates with animation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 3));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono matrix-bg scanlines">
      {/* Animated Terminal Header */}
      <div className={`bg-gray-900 border-b border-green-500 p-2 sm:p-4 transition-all duration-1000 ${isVisible ? 'animate-slide-in-bottom' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex gap-1 sm:gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse delay-200"></div>
            </div>
            <span className="text-green-400 font-bold text-sm sm:text-xl hover-glow cursor-pointer">FIT_HERO.exe</span>
            <span className="text-gray-400 text-xs sm:text-sm animate-bounce-slow hidden sm:inline">v2.9.1</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="btn btn-success text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 hover-lift">LOGIN</button>
            <button className="btn btn-primary text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 hover-lift animate-glow">START</button>
          </div>
        </div>
      </div>

      {/* Animated Terminal Status */}
      <div className={`bg-gray-800 p-2 sm:p-3 border-b border-green-800 transition-all duration-1000 delay-300 ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-xs sm:text-sm text-green-400 truncate">
            _user@fitness:~$ <span className="hidden sm:inline">{terminalText}</span><span className="sm:hidden">INIT...</span>
            {isTyping && <span className="terminal-cursor">_</span>}
          </div>
          <div className="text-xs sm:text-sm text-gray-400 hover-glow whitespace-nowrap">
            LVL {currentLevel} • <span className="hidden sm:inline">{xp.toLocaleString()} XP</span><span className="sm:hidden">{Math.round(xp/1000)}K XP</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-8">
        {/* Animated Hero Section */}
        <div className={`text-center mb-8 sm:mb-16 transition-all duration-1000 delay-500 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="text-4xl sm:text-7xl font-bold mb-4 sm:mb-8 leading-tight">
            <div className="text-yellow-400 hover-shake cursor-pointer transition-all duration-300">LEVEL_UP(</div>
            <div className="text-green-400 my-1 sm:my-2 hover:scale-110 transition-transform duration-300 cursor-pointer">YOUR_LIFE</div>
            <div className="text-cyan-400 hover-shake cursor-pointer transition-all duration-300">);</div>
          </div>
          
          <div className="text-gray-300 text-sm sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto opacity-80 hover:opacity-100 transition-opacity duration-300 px-4">
            Transform boring exercise into epic quests with gamified workouts and AI-powered meal planning.
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
            <button className="btn btn-primary text-sm sm:text-lg px-4 sm:px-8 py-3 sm:py-4 hover-lift animate-glow">
              <span className="animate-rotate-slow inline-block">⚡</span>
              <span className="hidden sm:inline">$ git clone fitness</span>
              <span className="sm:hidden">Get Started</span>
            </button>
            <button className="btn btn-success text-sm sm:text-lg px-4 sm:px-8 py-3 sm:py-4 hover-lift">
              <span className="animate-bounce-slow inline-block">🚀</span>
              <span className="hidden sm:inline">$ ./start_journey.sh</span>
              <span className="sm:hidden">Start Journey</span>
            </button>
          </div>

          {/* Animated XP Progress Bar */}
          <div className="max-w-md mx-auto px-4">
            <div className="flex justify-between text-xs sm:text-sm mb-2">
              <span className="text-cyan-400 animate-pulse">LEVEL {currentLevel}</span>
              <span className="text-yellow-400 animate-pulse delay-200">
                <span className="hidden sm:inline">{xp.toLocaleString()} / {maxXp.toLocaleString()} XP</span>
                <span className="sm:hidden">{Math.round(xp/1000)}K / {Math.round(maxXp/1000)}K XP</span>
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 sm:h-4 overflow-hidden border border-green-800 hover-glow">
              <div 
                className={`h-full bg-gradient-to-r from-green-500 to-cyan-500 transition-all duration-2000 ease-out ${progressStarted ? 'animate-progress-fill' : 'w-0'}`}
                style={{ '--progress-width': `${(xp / maxXp) * 100}%` } as any}
              ></div>
            </div>
          </div>
        </div>

        {/* Animated 3-Step Process */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-16">
          {/* Step 1 */}
          <div className={`border border-green-800 rounded-lg bg-gray-900 p-4 sm:p-6 text-center card-hover hover-lift transition-all duration-700 delay-700 ${isVisible ? 'animate-slide-in-bottom' : 'opacity-0'}`}>
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 animate-bounce-slow">🎮</div>
            <div className="text-green-400 text-lg sm:text-xl font-bold mb-2">01. CREATE CHARACTER</div>
            <div className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base">
              Set your fitness goals and choose your difficulty level. Customize your avatar and starting stats.
            </div>
            <div className="text-cyan-400 text-xs sm:text-sm font-mono bg-black px-2 sm:px-3 py-1 rounded border border-cyan-600 hover-glow">
              init_character()
            </div>
          </div>

          {/* Step 2 */}
          <div className={`border border-yellow-800 rounded-lg bg-gray-900 p-4 sm:p-6 text-center card-hover hover-lift transition-all duration-700 delay-800 ${isVisible ? 'animate-slide-in-bottom' : 'opacity-0'}`}>
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 animate-rotate-slow">⚔️</div>
            <div className="text-yellow-400 text-lg sm:text-xl font-bold mb-2">02. COMPLETE QUESTS</div>
            <div className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base">
              Turn workouts into epic adventures. Gain XP, unlock achievements, and level up your real-life stats.
            </div>
            <div className="text-cyan-400 text-xs sm:text-sm font-mono bg-black px-2 sm:px-3 py-1 rounded border border-cyan-600 hover-glow">
              execute_quests()
            </div>
          </div>

          {/* Step 3 */}
          <div className={`border border-red-800 rounded-lg bg-gray-900 p-4 sm:p-6 text-center card-hover hover-lift transition-all duration-700 delay-900 sm:col-span-2 lg:col-span-1 ${isVisible ? 'animate-slide-in-bottom' : 'opacity-0'}`}>
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 animate-pulse">🧪</div>
            <div className="text-red-400 text-lg sm:text-xl font-bold mb-2">03. OPTIMIZE STATS</div>
            <div className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base">
              AI-powered nutrition planning helps you maximize your character's performance and recovery.
            </div>
            <div className="text-cyan-400 text-xs sm:text-sm font-mono bg-black px-2 sm:px-3 py-1 rounded border border-cyan-600 hover-glow">
              optimize_nutrition()
            </div>
          </div>
        </div>

        {/* Animated Performance Stats */}
        <div className={`border border-green-800 rounded-lg bg-gray-900 p-4 sm:p-8 mb-8 sm:mb-16 hover-lift transition-all duration-1000 delay-1000 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="text-center mb-6 sm:mb-8">
            <div className="text-xl sm:text-3xl font-bold mb-2 sm:mb-4 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <span className="text-magenta-400">while</span>
              <span className="text-gray-300"> (other_apps.crash)</span>
              <br />
              <span className="text-green-400">fit_hero.run()</span>
            </div>
            <div className="text-gray-400 text-sm sm:text-base animate-typing">Performance stats that matter</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 text-center">
            <div className="hover-glow p-3 sm:p-4 rounded">
              <div className="text-3xl sm:text-4xl font-bold text-green-500 mb-1 sm:mb-2 animate-pulse">99%</div>
              <div className="text-green-400 text-sm sm:text-lg">User Retention</div>
              <div className="text-gray-400 text-xs sm:text-sm">6+ month active sessions</div>
            </div>
            <div className="hover-glow p-3 sm:p-4 rounded">
              <div className="text-3xl sm:text-4xl font-bold text-cyan-500 mb-1 sm:mb-2 transition-all duration-500">
                {activeUsers.toLocaleString()}K+
              </div>
              <div className="text-cyan-400 text-sm sm:text-lg">Active Heroes</div>
              <div className="text-gray-400 text-xs sm:text-sm">Currently leveling up</div>
            </div>
            <div className="hover-glow p-3 sm:p-4 rounded sm:col-span-1 col-span-1">
              <div className="text-3xl sm:text-4xl font-bold text-yellow-500 mb-1 sm:mb-2 animate-bounce-slow">4.9★</div>
              <div className="text-yellow-400 text-sm sm:text-lg">Hero Rating</div>
              <div className="text-gray-400 text-xs sm:text-sm">App store reviews</div>
            </div>
          </div>
        </div>

        {/* Animated Call to Action */}
        <div className={`text-center border border-green-800 rounded-lg bg-gray-900 p-4 sm:p-8 hover-lift transition-all duration-1000 delay-1200 ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
          <div className="text-green-400 text-xl sm:text-2xl font-bold mb-3 sm:mb-4 animate-pulse">Ready to start your fitness journey?</div>
          <div className="text-gray-300 mb-4 sm:mb-6 hover:text-green-300 transition-colors duration-300 text-sm sm:text-base px-4">
            Join thousands of developers who've gamified their way to better health.
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button className="btn btn-success text-sm sm:text-lg px-6 sm:px-8 py-3 sm:py-4 hover-lift animate-glow">
              <span className="animate-rotate-slow inline-block">🎯</span>
              INIT SESSION
            </button>
            <button className="btn btn-primary text-sm sm:text-lg px-6 sm:px-8 py-3 sm:py-4 hover-lift">
              <span className="animate-bounce-slow inline-block">📚</span>
              VIEW DOCS
            </button>
          </div>
        </div>
      </div>

      {/* Animated Footer */}
      <footer className={`bg-gray-900 border-t border-green-800 p-4 sm:p-6 mt-8 sm:mt-16 transition-all duration-1000 delay-1400 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="text-green-400 font-bold hover-glow cursor-pointer">FIT_HERO</span>
            <span className="text-green-600 text-sm animate-pulse">v2.0.1</span>
            <span className="text-gray-400 text-sm">| MIT Licensed</span>
          </div>
          <div className="text-gray-400 text-xs sm:text-sm hover:text-green-400 transition-colors duration-300 text-center">
            © 2025 • Built by developers, for developers
          </div>
        </div>
      </footer>
    </div>
  );
}
