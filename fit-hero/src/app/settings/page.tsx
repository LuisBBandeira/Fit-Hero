'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SettingsPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [currentRotations, setCurrentRotations] = useState<{[key: string]: number}>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const rotationDirections = ['south', 'south-west', 'west', 'north-west', 'north', 'north-east', 'east', 'south-east'];

  const [settingsData, setSettingsData] = useState({
    selectedCharacter: 'warrior',
    fitnessGoal: 'muscle',
    forbiddenFoods: '',
    trainingLocation: 'gym',
    dietaryRestrictions: [] as string[]
  });

  const characters = [
    {
      id: 'warrior',
      name: 'FITNESS WARRIOR',
      imagePaths: {
        south: '/orange_wariar%20/rotations/south.png',
        west: '/orange_wariar%20/rotations/west.png',
        north: '/orange_wariar%20/rotations/north.png',
        east: '/orange_wariar%20/rotations/east.png',
        'south-west': '/orange_wariar%20/rotations/south-west.png',
        'north-west': '/orange_wariar%20/rotations/north-west.png',
        'north-east': '/orange_wariar%20/rotations/north-east.png',
        'south-east': '/orange_wariar%20/rotations/south-east.png'
      },
      description: 'Strength focused. Masters heavy lifting and power training.'
    },
    {
      id: 'runner',
      name: 'CARDIO RUNNER',
      imagePaths: {
        south: '/blue_runner/rotations/south.png',
        west: '/blue_runner/rotations/west.png',
        north: '/blue_runner/rotations/north.png',
        east: '/blue_runner/rotations/east.png',
        'south-west': '/blue_runner/rotations/south-west.png',
        'north-west': '/blue_runner/rotations/north-west.png',
        'north-east': '/blue_runner/rotations/north-east.png',
        'south-east': '/blue_runner/rotations/south-east.png'
      },
      description: 'Endurance specialist. Excels in cardio and stamina challenges.'
    },
    {
      id: 'ninja',
      name: 'AGILITY NINJA',
      imagePaths: {
        south: '/purple_ninja/rotations/south.png',
        west: '/purple_ninja/rotations/west.png',
        north: '/purple_ninja/rotations/north.png',
        east: '/purple_ninja/rotations/east.png',
        'south-west': '/purple_ninja/rotations/south-west.png',
        'north-west': '/purple_ninja/rotations/north-west.png',
        'north-east': '/purple_ninja/rotations/north-east.png',
        'south-east': '/purple_ninja/rotations/south-east.png'
      },
      description: 'Speed and flexibility master. Perfect for HIIT and mobility.'
    },
    {
      id: 'guardian',
      name: 'VITALITY GUARDIAN',
      imagePaths: {
        south: '/sean_guardian/rotations/south.png',
        west: '/sean_guardian/rotations/west.png',
        north: '/sean_guardian/rotations/north.png',
        east: '/sean_guardian/rotations/east.png',
        'south-west': '/sean_guardian/rotations/south-west.png',
        'north-west': '/sean_guardian/rotations/north-west.png',
        'north-east': '/sean_guardian/rotations/north-east.png',
        'south-east': '/sean_guardian/rotations/south-east.png'
      },
      description: 'Balanced approach. Focuses on overall health and recovery.'
    }
  ];

  const fitnessGoals = [
    { id: 'muscle', name: 'BUILD MUSCLE', icon: '💪', description: 'Gain strength and muscle mass' },
    { id: 'cardio', name: 'IMPROVE CARDIO', icon: '❤️', description: 'Enhance cardiovascular fitness' },
    { id: 'weight', name: 'LOSE WEIGHT', icon: '📉', description: 'Reduce body fat percentage' },
    { id: 'general', name: 'GENERAL FITNESS', icon: '⚡', description: 'Overall health improvement' }
  ];

  const trainingLocations = [
    { id: 'gym', name: 'GYM TRAINING', icon: '🏋️', description: 'Full equipment access and group motivation' },
    { id: 'home', name: 'HOME TRAINING', icon: '🏠', description: 'Bodyweight and minimal equipment workouts' }
  ];

  const commonDietaryRestrictions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Low-Carb', 'Keto', 'Paleo'
  ];

  useEffect(() => {
    setIsVisible(true);
    
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    // Initialize rotation animations for each character
    const initialRotations: {[key: string]: number} = {};
    characters.forEach((character) => {
      initialRotations[character.id] = 0;
    });
    setCurrentRotations(initialRotations);
    
    // Start rotation animations
    const rotationInterval = setInterval(() => {
      setCurrentRotations(prev => {
        const newRotations = { ...prev };
        characters.forEach((character) => {
          newRotations[character.id] = (newRotations[character.id] + 1) % rotationDirections.length;
        });
        return newRotations;
      });
    }, 800);
    
    return () => {
      clearInterval(timeInterval);
      clearInterval(rotationInterval);
    };
  }, []);

  const handleCharacterSelect = (characterId: string) => {
    setSettingsData(prev => ({
      ...prev,
      selectedCharacter: characterId
    }));
  };

  const handleGoalSelect = (goalId: string) => {
    setSettingsData(prev => ({
      ...prev,
      fitnessGoal: goalId
    }));
  };

  const handleTrainingLocationSelect = (locationId: string) => {
    setSettingsData(prev => ({
      ...prev,
      trainingLocation: locationId
    }));
  };

  const handleForbiddenFoodsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSettingsData(prev => ({
      ...prev,
      forbiddenFoods: e.target.value
    }));
  };

  const handleDietaryRestrictionToggle = (restriction: string) => {
    setSettingsData(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter(r => r !== restriction)
        : [...prev.dietaryRestrictions, restriction]
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    console.log('Settings saved:', settingsData);
    
    // Show success message
    alert('Settings saved successfully! Your preferences have been updated.');
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
          <div className="text-green-400 text-sm font-mono ml-8">
            [USER_SETTINGS] - {currentTime}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className={`bg-gray-800 p-3 border-b border-green-800 transition-all duration-1000 delay-300 ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 hover-glow">
            ← BACK_TO_DASHBOARD
          </Link>
          <div className="text-green-400 text-sm font-mono">
            SYSTEM_CONFIG.settings
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Page Title */}
        <div className={`text-center mb-8 transition-all duration-1000 delay-500 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="text-green-400 text-3xl font-bold mb-4 animate-pulse">
            ⚙️ SYSTEM CONFIGURATION
          </div>
          <div className="text-gray-300 text-lg mb-4">
            Customize your FIT_HERO experience and preferences
          </div>
          <div className="text-cyan-400 text-sm font-mono bg-black px-3 py-1 rounded border border-cyan-600 inline-block">
            $ configure_user_settings --preferences
          </div>
        </div>

        <div className="space-y-8">
          {/* Character Selection - Full Width */}
          <div className={`transition-all duration-1000 delay-700 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="border border-green-800 rounded-lg bg-gray-900 p-6">
              <div className="text-green-400 text-xl font-bold mb-6">🎭 CHARACTER SELECTION</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {characters.map((character) => (
                  <div
                    key={character.id}
                    onClick={() => handleCharacterSelect(character.id)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 hover-lift ${
                      settingsData.selectedCharacter === character.id
                        ? 'border-cyan-400 bg-cyan-900/20 shadow-lg shadow-cyan-400/30'
                        : 'border-green-800 bg-gray-800 hover:border-green-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className="mb-4 p-6 bg-black rounded border-2 border-green-800 hover:border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20">
                        <Image 
                          src={character.imagePaths[rotationDirections[currentRotations[character.id] || 0] as keyof typeof character.imagePaths]}
                          alt={character.name}
                          width={128}
                          height={128}
                          className={`pixel-character-image mx-auto transition-all duration-300 ${
                            character.id === 'warrior' ? 'filter-orange hover:brightness-110' :
                            character.id === 'runner' ? 'filter-blue hover:brightness-110' :
                            character.id === 'ninja' ? 'filter-purple hover:brightness-110' :
                            'filter-green hover:brightness-110'
                          }`}
                        />
                      </div>
                      <div className="text-green-400 font-bold text-sm mb-1">{character.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fitness Goals and Training Environment - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Fitness Goals */}
            <div className={`transition-all duration-1000 delay-800 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="border border-green-800 rounded-lg bg-gray-900 p-6 h-full">
                <div className="text-green-400 text-xl font-bold mb-6">🎯 FITNESS OBJECTIVES</div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fitnessGoals.map((goal) => (
                    <div
                      key={goal.id}
                      onClick={() => handleGoalSelect(goal.id)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 hover-lift text-center ${
                        settingsData.fitnessGoal === goal.id
                          ? 'border-cyan-400 bg-gray-800'
                          : 'border-green-800 bg-gray-800 hover:border-green-400'
                      }`}
                    >
                      <div className="text-3xl mb-2">{goal.icon}</div>
                      <div className="text-green-400 font-bold text-sm mb-1">{goal.name}</div>
                      <div className="text-gray-300 text-xs">{goal.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Training Environment */}
            <div className={`transition-all duration-1000 delay-900 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="border border-green-800 rounded-lg bg-gray-900 p-6 h-full">
                <div className="text-green-400 text-xl font-bold mb-6">🏋️ TRAINING ENVIRONMENT</div>
                
                <div className="space-y-4">
                  {trainingLocations.map((location) => (
                    <div
                      key={location.id}
                      onClick={() => handleTrainingLocationSelect(location.id)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 hover-lift text-center ${
                        settingsData.trainingLocation === location.id
                          ? 'border-cyan-400 bg-gray-800'
                          : 'border-green-800 bg-gray-800 hover:border-green-400'
                      }`}
                    >
                      <div className="text-4xl mb-3">{location.icon}</div>
                      <div className="text-green-400 font-bold text-sm mb-1">{location.name}</div>
                      <div className="text-gray-300 text-xs">{location.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dietary Preferences - Full Width */}
          <div className={`transition-all duration-1000 delay-1000 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="border border-green-800 rounded-lg bg-gray-900 p-6">
              <div className="text-green-400 text-xl font-bold mb-6">🍽️ DIETARY PREFERENCES</div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Forbidden Foods */}
                <div>
                  <label className="block text-green-400 text-sm mb-2">
                    FORBIDDEN FOODS (AVOID IN MEAL PLAN):
                  </label>
                  <textarea
                    value={settingsData.forbiddenFoods}
                    onChange={handleForbiddenFoodsChange}
                    className="w-full bg-black border border-green-600 rounded px-3 py-2 text-green-400 focus:border-cyan-400 focus:outline-none transition-colors duration-300 font-mono h-32 resize-none"
                    placeholder="e.g., Seafood, Mushrooms, Spicy foods, Dairy products..."
                  />
                  <div className="text-gray-400 text-xs mt-1">
                    List foods you want to exclude from your meal plan (separated by commas)
                  </div>
                </div>

                {/* Dietary Restrictions */}
                <div>
                  <label className="block text-green-400 text-sm mb-3">
                    DIETARY RESTRICTIONS:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {commonDietaryRestrictions.map((restriction) => (
                      <button
                        key={restriction}
                        onClick={() => handleDietaryRestrictionToggle(restriction)}
                        className={`text-xs p-3 rounded border transition-all duration-200 ${
                          settingsData.dietaryRestrictions.includes(restriction)
                            ? 'border-cyan-400 bg-cyan-900/20 text-cyan-400'
                            : 'border-green-800 bg-gray-800 text-green-400 hover:border-green-400'
                        }`}
                      >
                        {restriction}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className={`text-center transition-all duration-1000 delay-1100 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="btn btn-success px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed hover-lift animate-glow"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2">⚡</span>
                  SAVING SETTINGS...
                </span>
              ) : (
                <span className="flex items-center">
                  <span className="mr-2">💾</span>
                  SAVE CONFIGURATION
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
