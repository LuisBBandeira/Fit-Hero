'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [currentRotations, setCurrentRotations] = useState<{[key: string]: number}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [playerData, setPlayerData] = useState<{
    id: string;
    name: string;
    age?: number;
    height?: number;
    weight?: number;
    character: string;
    objective: string;
    trainingEnvironment: string;
    dietaryRestrictions: string[];
    forbiddenFoods: string[];
  } | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const rotationDirections = ['south', 'south-west', 'west', 'north-west', 'north', 'north-east', 'east', 'south-east'];

  const [settingsData, setSettingsData] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    selectedCharacter: '',
    fitnessGoal: '',
    forbiddenFoods: '',
    trainingLocation: '',
    dietaryRestrictions: [] as string[]
  });

  const characters = useMemo(() => [
    {
      id: 'FITNESS_WARRIOR',
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
      id: 'CARDIO_RUNNER',
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
      id: 'AGILITY_NINJA',
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
      id: 'VITALITY_GUARDIAN',
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
  ], []);

  const fitnessGoals = [
    { id: 'BUILD_MUSCLE', name: 'BUILD MUSCLE', icon: '/gym.png', description: 'Gain strength and muscle mass' },
    { id: 'IMPROVE_CARDIO', name: 'IMPROVE CARDIO', icon: '/heart.png', description: 'Enhance cardiovascular fitness' },
    { id: 'LOSE_WEIGHT', name: 'LOSE WEIGHT', icon: '/chart.png', description: 'Reduce body fat percentage' },
    { id: 'GENERAL_FITNESS', name: 'GENERAL FITNESS', icon: '/lightning-bolt.png', description: 'Overall health improvement' }
  ];

  const trainingLocations = [
    { id: 'GYM_TRAINING', name: 'GYM TRAINING', icon: '/gym.png', description: 'Full equipment access and group motivation' },
    { id: 'HOME_TRAINING', name: 'HOME TRAINING', icon: '/house.png', description: 'Bodyweight and minimal equipment workouts' }
  ];

  const commonDietaryRestrictions = [
    'VEGETARIAN', 'VEGAN', 'GLUTEN_FREE', 'DAIRY_FREE', 'NUT_FREE', 'LOW_CARB', 'KETO', 'PALEO'
  ];

  const loadPlayerData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/player');
      const data = await response.json();

      if (response.ok) {
        setPlayerData(data.player);
        // Populate form with existing data
        setSettingsData({
          name: data.player.name || '',
          age: data.player.age?.toString() || '',
          height: data.player.height?.toString() || '',
          weight: data.player.weight?.toString() || '',
          selectedCharacter: data.player.character || '',
          fitnessGoal: data.player.objective || '',
          forbiddenFoods: data.player.forbiddenFoods?.join(', ') || '',
          trainingLocation: data.player.trainingEnvironment || '',
          dietaryRestrictions: data.player.dietaryRestrictions || []
        });
      } else if (response.status === 404) {
        // Player profile doesn't exist, redirect to character creation
        router.push('/character-creation');
      } else {
        setError(data.error || 'Failed to load player data');
      }
    } catch (error) {
      setError('Failed to load player data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is authenticated
    if (status === 'loading') return; // Still loading
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Load player data
    loadPlayerData();
    
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
  }, [status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettingsData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

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
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Prepare data for API
      const updateData = {
        name: settingsData.name,
        age: settingsData.age ? parseInt(settingsData.age) : null,
        height: settingsData.height ? parseFloat(settingsData.height) : null,
        weight: settingsData.weight ? parseFloat(settingsData.weight) : null,
        character: settingsData.selectedCharacter,
        objective: settingsData.fitnessGoal,
        trainingEnvironment: settingsData.trainingLocation,
        dietaryRestrictions: settingsData.dietaryRestrictions,
        forbiddenFoods: settingsData.forbiddenFoods.split(',').map(food => food.trim()).filter(food => food.length > 0)
      };

      const response = await fetch('/api/player', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Settings saved successfully!');
        setPlayerData(data.player);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.error || 'Failed to save settings');
      }
    } catch (error) {
      setError('An error occurred while saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono relative overflow-hidden">
      {/* Matrix Background */}
      <div className="matrix-bg"></div>
      <div className="scanlines"></div>
      
      {/* Terminal Header */}
      <div className={`bg-gray-900 border-b border-green-500 p-2 md:p-4 transition-all duration-1000 ${isVisible ? 'animate-slide-in-bottom' : 'opacity-0'}`}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 md:w-3 md:h-3 bg-yellow-500 rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse delay-200"></div>
            <span className="text-green-400 text-sm md:text-lg font-bold ml-2 md:ml-4">FIT_HERO.exe</span>
          </div>
          <div className="text-green-400 text-xs md:text-sm font-mono hidden sm:block">
            [USER_SETTINGS] - {currentTime}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className={`bg-gray-800 p-2 md:p-3 border-b border-green-800 transition-all duration-1000 delay-300 ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 hover-glow text-sm md:text-base">
            <span className="hidden md:inline">← BACK_TO_DASHBOARD</span>
            <span className="md:hidden">← DASHBOARD</span>
          </Link>
          <div className="text-green-400 text-xs md:text-sm font-mono hidden sm:block">
            SYSTEM_CONFIG.settings
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-3 md:p-4 lg:p-6">
        {/* Page Title */}
        <div className={`text-center mb-6 md:mb-8 transition-all duration-1000 delay-500 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="text-green-400 text-xl md:text-3xl font-bold mb-2 md:mb-4 animate-pulse">
            <img src="/gear.png" alt="System Configuration" className="w-6 h-6 inline mr-2" />
            SYSTEM CONFIGURATION
          </div>
          <div className="text-gray-300 text-sm md:text-lg mb-2 md:mb-4">
            <span className="hidden md:inline">Customize your FIT_HERO experience and preferences</span>
            <span className="md:hidden">Configure your settings</span>
          </div>
          <div className="text-cyan-400 text-xs md:text-sm font-mono bg-black px-2 md:px-3 py-1 rounded border border-cyan-600 inline-block">
            <span className="hidden md:inline">$ configure_user_settings --preferences</span>
            <span className="md:hidden">$ config --user</span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="text-green-400 text-xl flex items-center justify-center">
              <img src="/lightning-bolt.png" alt="Loading" className="w-6 h-6 animate-spin mr-2" />
              LOADING PLAYER DATA...
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/30 border border-red-600 text-red-400 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-900/30 border border-green-600 text-green-400 px-4 py-3 rounded mb-6">
            {successMessage}
          </div>
        )}

        {/* Show content only when not loading */}
        {!isLoading && (
        <div className="space-y-4 md:space-y-8">
          {/* Personal Information Section */}
          <div className={`transition-all duration-1000 delay-600 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="border border-green-800 rounded-lg bg-gray-900 p-3 md:p-6">
              <div className="text-green-400 text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">
                <img src="/user.png" alt="User" className="w-5 h-5 md:w-6 md:h-6" />
                PERSONAL INFORMATION
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div>
                  <label className="block text-green-400 text-xs md:text-sm mb-2">
                    HERO NAME:
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={settingsData.name}
                    onChange={handleInputChange}
                    className="w-full bg-black border border-green-600 rounded px-2 md:px-3 py-2 text-green-400 focus:border-cyan-400 focus:outline-none transition-colors duration-300 font-mono text-sm md:text-base"
                    placeholder="Enter your hero name"
                  />
                </div>

                <div>
                  <label className="block text-green-400 text-xs md:text-sm mb-2">
                    AGE (YEARS):
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={settingsData.age}
                    onChange={handleInputChange}
                    className="w-full bg-black border border-green-600 rounded px-2 md:px-3 py-2 text-green-400 focus:border-cyan-400 focus:outline-none transition-colors duration-300 font-mono text-sm md:text-base"
                    placeholder="25"
                    min="13"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-green-400 text-xs md:text-sm mb-2">
                    HEIGHT (CM):
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={settingsData.height}
                    onChange={handleInputChange}
                    className="w-full bg-black border border-green-600 rounded px-2 md:px-3 py-2 text-green-400 focus:border-cyan-400 focus:outline-none transition-colors duration-300 font-mono text-sm md:text-base"
                    placeholder="175"
                    min="100"
                    max="250"
                  />
                </div>

                <div>
                  <label className="block text-green-400 text-xs md:text-sm mb-2">
                    WEIGHT (KG):
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={settingsData.weight}
                    onChange={handleInputChange}
                    className="w-full bg-black border border-green-600 rounded px-2 md:px-3 py-2 text-green-400 focus:border-cyan-400 focus:outline-none transition-colors duration-300 font-mono text-sm md:text-base"
                    placeholder="70"
                    min="30"
                    max="300"
                  />
                </div>
              </div>

              {/* BMI Calculator */}
              {settingsData.height && settingsData.weight && (
                <div className="mt-4 md:mt-6 p-3 md:p-4 bg-black rounded border border-cyan-600">
                  <div className="text-cyan-400 text-xs md:text-sm font-mono">
                    BMI: {(parseFloat(settingsData.weight) / Math.pow(parseFloat(settingsData.height) / 100, 2)).toFixed(1)}
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    Body Mass Index calculated automatically
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Character Selection - Full Width */}
          <div className={`transition-all duration-1000 delay-700 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="border border-green-800 rounded-lg bg-gray-900 p-3 md:p-6">
              <div className="text-green-400 text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center">
                <img src="/preforming-arts.png" alt="Character Selection" className="w-6 h-6 md:w-8 md:h-8 mr-2" />
                CHARACTER SELECTION
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
                {characters.map((character) => (
                  <div
                    key={character.id}
                    onClick={() => handleCharacterSelect(character.id)}
                    className={`border-2 rounded-lg p-2 md:p-4 cursor-pointer transition-all duration-300 hover-lift ${
                      settingsData.selectedCharacter === character.id
                        ? 'border-cyan-400 bg-cyan-900/20 shadow-lg shadow-cyan-400/30'
                        : 'border-green-800 bg-gray-800 hover:border-green-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className="mb-2 md:mb-4 p-3 md:p-6 bg-black rounded border-2 border-green-800 hover:border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20">
                        <Image 
                          src={character.imagePaths[rotationDirections[currentRotations[character.id] || 0] as keyof typeof character.imagePaths]}
                          alt={character.name}
                          width={128}
                          height={128}
                          className={`pixel-character-image mx-auto transition-all duration-300 w-16 h-16 md:w-32 md:h-32 ${
                            character.id === 'warrior' ? 'filter-orange hover:brightness-110' :
                            character.id === 'runner' ? 'filter-blue hover:brightness-110' :
                            character.id === 'ninja' ? 'filter-purple hover:brightness-110' :
                            'filter-green hover:brightness-110'
                          }`}
                        />
                      </div>
                      <div className="text-green-400 font-bold text-xs md:text-sm mb-1">
                        <span className="hidden md:inline">{character.name}</span>
                        <span className="md:hidden">
                          {character.id === 'FITNESS_WARRIOR' ? 'WARRIOR' :
                           character.id === 'CARDIO_RUNNER' ? 'RUNNER' :
                           character.id === 'AGILITY_NINJA' ? 'NINJA' :
                           'GUARDIAN'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fitness Goals and Training Environment - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
            {/* Fitness Goals */}
            <div className={`transition-all duration-1000 delay-800 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="border border-green-800 rounded-lg bg-gray-900 p-3 md:p-6 h-full">
                <div className="text-green-400 text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center">
                  <img src="/target.png" alt="Fitness Objectives" className="w-6 h-6 md:w-8 md:h-8 mr-2" />
                  FITNESS OBJECTIVES
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                  {fitnessGoals.map((goal) => (
                    <div
                      key={goal.id}
                      onClick={() => handleGoalSelect(goal.id)}
                      className={`border rounded-lg p-3 md:p-4 cursor-pointer transition-all duration-300 hover-lift text-center ${
                        settingsData.fitnessGoal === goal.id
                          ? 'border-cyan-400 bg-gray-800'
                          : 'border-green-800 bg-gray-800 hover:border-green-400'
                      }`}
                    >
                      <div className="mb-1 md:mb-2 flex justify-center">
                        <img src={goal.icon} alt={goal.name} className="w-8 h-8 md:w-12 md:h-12" />
                      </div>
                      <div className="text-green-400 font-bold text-xs md:text-sm mb-1">
                        <span className="hidden md:inline">{goal.name}</span>
                        <span className="md:hidden">
                          {goal.id === 'BUILD_MUSCLE' ? 'BUILD MUSCLE' :
                           goal.id === 'IMPROVE_CARDIO' ? 'CARDIO' :
                           goal.id === 'LOSE_WEIGHT' ? 'LOSE WEIGHT' :
                           'FITNESS'}
                        </span>
                      </div>
                      <div className="text-gray-300 text-xs hidden md:block">{goal.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Training Environment */}
            <div className={`transition-all duration-1000 delay-900 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="border border-green-800 rounded-lg bg-gray-900 p-3 md:p-6 h-full">
                <div className="text-green-400 text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center">
                  <img src="/gym.png" alt="Training Environment" className="w-6 h-6 md:w-8 md:h-8 mr-2" />
                  TRAINING ENVIRONMENT
                </div>
                
                <div className="space-y-2 md:space-y-4">
                  {trainingLocations.map((location) => (
                    <div
                      key={location.id}
                      onClick={() => handleTrainingLocationSelect(location.id)}
                      className={`border rounded-lg p-3 md:p-4 cursor-pointer transition-all duration-300 hover-lift text-center ${
                        settingsData.trainingLocation === location.id
                          ? 'border-cyan-400 bg-gray-800'
                          : 'border-green-800 bg-gray-800 hover:border-green-400'
                      }`}
                    >
                      <div className="mb-2 md:mb-3 flex justify-center">
                        <img src={location.icon} alt={location.name} className="w-12 h-12 md:w-16 md:h-16" />
                      </div>
                      <div className="text-green-400 font-bold text-xs md:text-sm mb-1">
                        <span className="hidden md:inline">{location.name}</span>
                        <span className="md:hidden">
                          {location.id === 'GYM_TRAINING' ? 'GYM' : 'HOME'}
                        </span>
                      </div>
                      <div className="text-gray-300 text-xs hidden md:block">{location.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dietary Preferences - Full Width */}
          <div className={`transition-all duration-1000 delay-1000 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="border border-green-800 rounded-lg bg-gray-900 p-3 md:p-6">
              <div className="text-green-400 text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center">
                <img src="/salad.png" alt="Dietary Preferences" className="w-6 h-6 md:w-8 md:h-8 mr-2" />
                DIETARY PREFERENCES
              </div>
              
              <div className="space-y-4 md:space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
                {/* Forbidden Foods */}
                <div>
                  <label className="block text-green-400 text-sm md:text-sm mb-3">
                    <span className="hidden md:inline">FORBIDDEN FOODS (AVOID IN MEAL PLAN):</span>
                    <span className="md:hidden">FORBIDDEN FOODS:</span>
                  </label>
                  <textarea
                    value={settingsData.forbiddenFoods}
                    onChange={handleForbiddenFoodsChange}
                    className="w-full bg-black border border-green-600 rounded px-3 py-3 text-green-400 focus:border-cyan-400 focus:outline-none transition-colors duration-300 font-mono h-28 md:h-32 resize-none text-sm"
                    placeholder="e.g., Seafood, Mushrooms, Spicy foods..."
                  />
                  <div className="text-gray-400 text-xs mt-2">
                    <span className="hidden md:inline">List foods you want to exclude from your meal plan (separated by commas)</span>
                    <span className="md:hidden">Foods to exclude (comma separated)</span>
                  </div>
                </div>

                {/* Dietary Restrictions */}
                <div>
                  <label className="block text-green-400 text-sm md:text-sm mb-3">
                    DIETARY RESTRICTIONS:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {commonDietaryRestrictions.map((restriction) => (
                      <button
                        key={restriction}
                        onClick={() => handleDietaryRestrictionToggle(restriction)}
                        className={`text-xs md:text-xs p-3 rounded border transition-all duration-200 font-mono ${
                          settingsData.dietaryRestrictions.includes(restriction)
                            ? 'border-cyan-400 bg-cyan-900/20 text-cyan-400'
                            : 'border-green-800 bg-gray-800 text-green-400 hover:border-green-400'
                        }`}
                      >
                        {restriction.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className={`text-center px-4 transition-all duration-1000 delay-1100 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="btn btn-success px-6 md:px-8 py-3 md:py-3 disabled:opacity-50 disabled:cursor-not-allowed hover-lift animate-glow text-sm md:text-base w-full md:w-auto max-w-xs mx-auto"
            >
              {isSaving ? (
                <span className="flex items-center justify-center">
                  <img src="/lightning-bolt.png" alt="Saving" className="w-5 h-5 animate-spin mr-2" />
                  <span>SAVING SETTINGS...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <img src="/floppy-disk.png" alt="Save" className="w-5 h-5 mr-2" />
                  <span>SAVE CONFIGURATION</span>
                </span>
              )}
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
