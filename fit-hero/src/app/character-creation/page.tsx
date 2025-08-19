'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CharacterCreationPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRotations, setCurrentRotations] = useState<{[key: string]: number}>({});
  
  const rotationDirections = ['south', 'south-west', 'west', 'north-west', 'north', 'north-east', 'east', 'south-east'];

  const [formData, setFormData] = useState({
    nickname: '',
    age: '',
    height: '',
    weight: '',
    selectedCharacter: '',
    fitnessGoal: ''
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
      description: 'Strength focused. Masters heavy lifting and power training.',
      speciality: 'POWERLIFTING'
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
      description: 'Endurance specialist. Excels in cardio and stamina challenges.',
      speciality: 'MARATHON'
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
      description: 'Speed and flexibility master. Perfect for HIIT and mobility.',
      speciality: 'FLEXIBILITY'
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
      description: 'Balanced approach. Focuses on overall health and recovery.',
      speciality: 'WELLNESS'
    }
  ];

  const fitnessGoals = [
    { id: 'muscle', name: 'BUILD MUSCLE', icon: '💪', description: 'Gain strength and muscle mass' },
    { id: 'cardio', name: 'IMPROVE CARDIO', icon: '❤️', description: 'Enhance cardiovascular fitness' },
    { id: 'weight', name: 'LOSE WEIGHT', icon: '📉', description: 'Reduce body fat percentage' },
    { id: 'general', name: 'GENERAL FITNESS', icon: '⚡', description: 'Overall health improvement' }
  ];

  useEffect(() => {
    setIsVisible(true);
    
    // Initialize rotation animations for each character
    const initialRotations: {[key: string]: number} = {};
    characters.forEach((character) => {
      initialRotations[character.id] = 0;
    });
    setCurrentRotations(initialRotations);
    
    // Start rotation animations
    const interval = setInterval(() => {
      setCurrentRotations(prev => {
        const newRotations = { ...prev };
        characters.forEach((character) => {
          newRotations[character.id] = (newRotations[character.id] + 1) % rotationDirections.length;
        });
        return newRotations;
      });
    }, 800); // Change direction every 800ms
    
    return () => clearInterval(interval);
  }, [characters, rotationDirections.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCharacterSelect = (characterId: string) => {
    setFormData({
      ...formData,
      selectedCharacter: characterId
    });
  };

  const handleGoalSelect = (goalId: string) => {
    setFormData({
      ...formData,
      fitnessGoal: goalId
    });
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    console.log('Character created:', formData);
    
    // Show success message and redirect to dashboard
    alert('Character created successfully! Welcome to FIT_HERO!');
    router.push('/dashboard');
  };

  const getStepProgress = () => {
    return (currentStep / 3) * 100;
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.nickname && formData.age && formData.height && formData.weight;
      case 2:
        return formData.selectedCharacter;
      case 3:
        return formData.fitnessGoal;
      default:
        return false;
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
            [CHARACTER_CREATOR] - v3.0.1
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className={`bg-gray-800 p-3 border-b border-green-800 transition-all duration-1000 delay-300 ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 hover-glow">
            ← BACK_TO_MAIN
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-sm">STEP {currentStep}/3</span>
            <div className="w-32 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getStepProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="text-center mb-8">
              <div className="text-green-400 text-3xl font-bold mb-4 animate-pulse">
                📊 INITIALIZE CHARACTER STATS
              </div>
              <div className="text-gray-300 text-lg mb-4">
                Enter your basic information to begin your fitness journey
              </div>
              <div className="text-cyan-400 text-sm font-mono bg-black px-3 py-1 rounded border border-cyan-600 inline-block">
                $ create_character --profile --stats
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="border border-green-800 rounded-lg bg-gray-900 p-6">
                <div className="text-green-400 text-xl font-bold mb-6">PLAYER INFO</div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-green-400 text-sm mb-2">
                      NICKNAME:
                    </label>
                    <input
                      type="text"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleInputChange}
                      className="w-full bg-black border border-green-600 rounded px-3 py-2 text-green-400 focus:border-cyan-400 focus:outline-none transition-colors duration-300 font-mono"
                      placeholder="Enter your hero name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-green-400 text-sm mb-2">
                      AGE (YEARS):
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full bg-black border border-green-600 rounded px-3 py-2 text-green-400 focus:border-cyan-400 focus:outline-none transition-colors duration-300 font-mono"
                      placeholder="25"
                      min="13"
                      max="100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-green-400 text-sm mb-2">
                      HEIGHT (CM):
                    </label>
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleInputChange}
                      className="w-full bg-black border border-green-600 rounded px-3 py-2 text-green-400 focus:border-cyan-400 focus:outline-none transition-colors duration-300 font-mono"
                      placeholder="175"
                      min="100"
                      max="250"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-green-400 text-sm mb-2">
                      WEIGHT (KG):
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className="w-full bg-black border border-green-600 rounded px-3 py-2 text-green-400 focus:border-cyan-400 focus:outline-none transition-colors duration-300 font-mono"
                      placeholder="70"
                      min="30"
                      max="300"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="border border-green-800 rounded-lg bg-gray-900 p-6">
                <div className="text-green-400 text-xl font-bold mb-6">CALCULATED STATS</div>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce-slow">🏃‍♂️</div>
                    <div className="text-gray-300 text-sm">Your character will be created based on your stats</div>
                  </div>

                  {formData.height && formData.weight && (
                    <div className="mt-6 p-4 bg-black rounded border border-cyan-600">
                      <div className="text-cyan-400 text-sm font-mono">
                        BMI: {(parseFloat(formData.weight) / Math.pow(parseFloat(formData.height) / 100, 2)).toFixed(1)}
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        Body Mass Index calculated automatically
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-4">
                    * All data is encrypted and stored securely
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Character Selection */}
        {currentStep === 2 && (
          <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="text-center mb-8">
              <div className="text-green-400 text-3xl font-bold mb-4 animate-pulse">
                🎭 SELECT CHARACTER CLASS
              </div>
              <div className="text-gray-300 text-lg mb-4">
                Choose your fitness specialization and play style
              </div>
              <div className="text-cyan-400 text-sm font-mono bg-black px-3 py-1 rounded border border-cyan-600 inline-block">
                $ select_class --specialization
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {characters.map((character) => (
                <div
                  key={character.id}
                  onClick={() => handleCharacterSelect(character.id)}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-300 hover-lift transform hover:scale-105 hover:-translate-y-2 ${
                    formData.selectedCharacter === character.id
                      ? 'border-cyan-400 bg-cyan-900/20 shadow-lg shadow-cyan-400/30'
                      : 'border-green-800 bg-gray-900 hover:border-green-400 hover:shadow-lg hover:shadow-green-400/20'
                  }`}
                >
                  <div className="text-center">
                    {/* Rotating Pixel Art Character */}
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
                    
                    <div className="text-green-400 font-bold text-lg mb-2">{character.name}</div>
                    <div className="text-cyan-400 text-xs font-mono bg-black px-2 py-1 rounded border border-cyan-600 mb-3">
                      SPEC: {character.speciality}
                    </div>
                    <div className="text-gray-300 text-sm mb-4">{character.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Fitness Goal */}
        {currentStep === 3 && (
          <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="text-center mb-8">
              <div className="text-green-400 text-3xl font-bold mb-4 animate-pulse">
                🎯 SET PRIMARY OBJECTIVE
              </div>
              <div className="text-gray-300 text-lg mb-4">
                Define your main fitness goal to customize your experience
              </div>
              <div className="text-cyan-400 text-sm font-mono bg-black px-3 py-1 rounded border border-cyan-600 inline-block">
                $ set_objective --primary-goal
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {fitnessGoals.map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => handleGoalSelect(goal.id)}
                  className={`border rounded-lg p-6 cursor-pointer transition-all duration-300 hover-lift text-center ${
                    formData.fitnessGoal === goal.id
                      ? 'border-cyan-400 bg-gray-800'
                      : 'border-green-800 bg-gray-900'
                  }`}
                >
                  <div className="text-5xl mb-4 animate-bounce-slow">{goal.icon}</div>
                  <div className="text-green-400 font-bold text-lg mb-2">{goal.name}</div>
                  <div className="text-gray-300 text-sm">{goal.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-12">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="btn btn-secondary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed hover-lift"
          >
            ← PREVIOUS
          </button>

          <div className="text-center">
            <div className="text-gray-400 text-sm">
              Progress: {Math.round(getStepProgress())}%
            </div>
          </div>

          {currentStep < 3 ? (
            <button
              onClick={nextStep}
              disabled={!isStepValid()}
              className="btn btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed hover-lift animate-glow"
            >
              NEXT →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isStepValid() || isLoading}
              className="btn btn-success px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed hover-lift animate-glow"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2">⚡</span>
                  CREATING...
                </span>
              ) : (
                <span className="flex items-center">
                  <span className="mr-2">🚀</span>
                  CREATE HERO
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
