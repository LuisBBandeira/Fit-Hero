'use client';

import { useState, useEffect } from 'react';

interface AIActivationStatus {
  hasPlayer: boolean;
  aiActivated: boolean;
  player?: {
    id: string;
    name: string;
    createdAt: string;
  };
  plans?: {
    hasWorkoutPlan: boolean;
    hasMealPlan: boolean;
    latestWorkoutPlan?: any;
    latestMealPlan?: any;
  };
  recommendations?: string[];
}

export default function AIActivationWidget() {
  const [status, setStatus] = useState<AIActivationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check AI activation status on component mount
  useEffect(() => {
    checkActivationStatus();
  }, []);

  const checkActivationStatus = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/ai/activate');
      const data = await response.json();
      
      if (response.ok) {
        setStatus(data);
      } else {
        setError(data.error || 'Failed to check AI status');
      }
    } catch (err) {
      setError('Failed to connect to AI service');
    } finally {
      setIsLoading(false);
    }
  };

  const activateAI = async () => {
    setIsActivating(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/ai/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('AI service activated successfully!');
        // Refresh the status
        await checkActivationStatus();
      } else {
        setError(data.error || 'Failed to activate AI service');
      }
    } catch (err) {
      setError('Failed to activate AI service');
    } finally {
      setIsActivating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="border border-green-800 rounded-lg bg-gray-900 p-6 animate-pulse">
        <div className="flex items-center justify-center">
          <img src="/lightning-bolt.png" alt="Loading" className="w-6 h-6 animate-spin mr-3" />
          <span className="text-green-400">Checking AI Service Status...</span>
        </div>
      </div>
    );
  }

  if (!status?.hasPlayer) {
    return (
      <div className="border border-yellow-600 rounded-lg bg-yellow-900/20 p-6">
        <div className="text-yellow-400 font-bold mb-2 flex items-center">
          <img src="/warning.png" alt="Warning" className="w-5 h-5 mr-2" />
          PLAYER PROFILE REQUIRED
        </div>
        <div className="text-yellow-300 text-sm">
          Create your character profile first to activate AI services.
        </div>
      </div>
    );
  }

  return (
    <div className="border border-green-800 rounded-lg bg-gray-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-green-400 font-bold text-lg flex items-center gap-2">
          <img src="/robot.png" alt="AI" className="w-5 h-5" />
          AI SERVICE STATUS
        </div>
        <button
          onClick={checkActivationStatus}
          disabled={isLoading}
          className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
        >
          <img src="/gear.png" alt="Refresh" className="w-4 h-4 inline mr-1" />
          Refresh
        </button>
      </div>

      {/* Status Display */}
      <div className="space-y-4">
        {status?.aiActivated ? (
          <div className="bg-green-900/30 border border-green-600 rounded p-4">
            <div className="flex items-center mb-2">
              <img src="/checkmark.png" alt="Running" className="w-4 h-4 mr-2" />
              <span className="text-green-300 font-semibold">AI Service Active</span>
            </div>
            <div className="text-green-200 text-sm">
              Your personalized workout and meal plans are ready!
            </div>
            
            {/* Plan Status */}
            <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
              <div className={`p-2 rounded ${status.plans?.hasWorkoutPlan ? 'bg-green-800/30 text-green-300' : 'bg-red-800/30 text-red-300'}`}>
                <div className="font-semibold">Workout Plan</div>
                <div className="flex items-center gap-1">
                  {status.plans?.hasWorkoutPlan ? 
                    <><img src="/checkmark.png" alt="Generated" className="w-3 h-3" /> Generated</> : 
                    <><img src="/cross.png" alt="Missing" className="w-3 h-3" /> Missing</>
                  }
                </div>
                {status.plans?.latestWorkoutPlan && (
                  <div className="text-xs mt-1 text-gray-400">
                    {status.plans.latestWorkoutPlan.month}/{status.plans.latestWorkoutPlan.year}
                  </div>
                )}
              </div>
              
              <div className={`p-2 rounded ${status.plans?.hasMealPlan ? 'bg-green-800/30 text-green-300' : 'bg-red-800/30 text-red-300'}`}>
                <div className="font-semibold">Meal Plan</div>
                <div className="flex items-center gap-1">
                  {status.plans?.hasMealPlan ? 
                    <><img src="/checkmark.png" alt="Generated" className="w-3 h-3" /> Generated</> : 
                    <><img src="/cross.png" alt="Missing" className="w-3 h-3" /> Missing</>
                  }
                </div>
                {status.plans?.latestMealPlan && (
                  <div className="text-xs mt-1 text-gray-400">
                    {status.plans.latestMealPlan.month}/{status.plans.latestMealPlan.year}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-900/30 border border-yellow-600 rounded p-4">
            <div className="flex items-center mb-2">
              <img src="/warning.png" alt="Warning" className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="text-yellow-300 font-semibold">AI Service Not Activated</span>
            </div>
            <div className="text-yellow-200 text-sm mb-3">
              Generate your personalized fitness and nutrition plans.
            </div>
            
            {/* Recommendations */}
            {status?.recommendations && status.recommendations.length > 0 && (
              <div className="mb-3">
                <div className="text-yellow-300 text-sm font-semibold mb-1">Recommendations:</div>
                <ul className="text-yellow-200 text-xs space-y-1">
                  {status.recommendations.map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Activation Button */}
            <button
              onClick={activateAI}
              disabled={isActivating}
              className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-2 px-4 rounded transition-colors duration-300"
            >
              {isActivating ? (
                <span className="flex items-center justify-center">
                  <img src="/lightning-bolt.png" alt="Activating" className="w-5 h-5 animate-spin mr-2" />
                  Activating AI...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <img src="/rocket.png" alt="Launch" className="w-5 h-5 mr-2" />
                  Activate AI Service
                </span>
              )}
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/30 border border-red-600 rounded p-4">
            <div className="flex items-start">
              <img src="/cross.png" alt="Error" className="w-4 h-4 mr-2 mt-0.5" />
              <div>
                <div className="text-red-300 font-semibold">Error</div>
                <div className="text-red-200 text-sm">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div className="bg-green-900/30 border border-green-600 rounded p-4">
            <div className="flex items-start">
              <img src="/checkmark.png" alt="Success" className="w-4 h-4 mr-2 mt-0.5" />
              <div>
                <div className="text-green-300 font-semibold">Success</div>
                <div className="text-green-200 text-sm">{success}</div>
              </div>
            </div>
          </div>
        )}

        {/* Player Info */}
        {status?.player && (
          <div className="border-t border-green-800 pt-3 mt-3">
            <div className="text-gray-400 text-xs">
              Player: <span className="text-green-400">{status.player.name}</span> | 
              Created: <span className="text-cyan-400">{new Date(status.player.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        )}

        {/* Re-activation Option */}
        {status?.aiActivated && (
          <div className="border-t border-green-800 pt-3 mt-3">
            <button
              onClick={activateAI}
              disabled={isActivating}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-2 px-4 rounded transition-colors duration-300 text-sm"
            >
              {isActivating ? (
                <span className="flex items-center justify-center">
                  <img src="/lightning-bolt.png" alt="Regenerating" className="w-5 h-5 animate-spin mr-2" />
                  Regenerating...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <img src="/gear.png" alt="Refresh" className="w-5 h-5 mr-2" />
                  Regenerate AI Plans
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
