'use client';

import { useState, useEffect } from 'react';

interface SmartPlanLoaderProps {
  playerId: string;
  planType: 'workout' | 'meal';
  fallbackComponent: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export default function SmartPlanLoader({ 
  playerId, 
  planType, 
  fallbackComponent, 
  loadingComponent 
}: SmartPlanLoaderProps) {
  const [planStatus, setPlanStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;

  useEffect(() => {
    let mounted = true;
    let pollInterval: NodeJS.Timeout;

    const checkPlanAvailability = async () => {
      try {
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        
        const endpoint = planType === 'workout' 
          ? `/api/monthly-plans/workout?month=${month}&year=${year}`
          : `/api/monthly-plans/meal?month=${month}&year=${year}`;
        
        const response = await fetch(endpoint);
        
        if (response.ok) {
          const data = await response.json();
          if (data.plan && mounted) {
            setPlanStatus('ready');
            if (pollInterval) clearInterval(pollInterval);
          }
        } else if (response.status === 404) {
          // Plan doesn't exist yet, keep waiting
          if (retryCount >= maxRetries && mounted) {
            setPlanStatus('fallback');
            if (pollInterval) clearInterval(pollInterval);
          } else {
            setRetryCount(prev => prev + 1);
          }
        }
      } catch (error) {
        console.error(`Error checking ${planType} plan:`, error);
        if (retryCount >= maxRetries && mounted) {
          setPlanStatus('fallback');
          if (pollInterval) clearInterval(pollInterval);
        } else {
          setRetryCount(prev => prev + 1);
        }
      }
    };

    // Initial check
    checkPlanAvailability();

    // Poll every 3 seconds for up to 30 seconds (10 retries)
    if (planStatus === 'loading') {
      pollInterval = setInterval(checkPlanAvailability, 3000);
    }

    return () => {
      mounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [playerId, planType, retryCount, maxRetries, planStatus]);

  // Show loading state while AI generates plans
  if (planStatus === 'loading') {
    return loadingComponent || (
      <div className="border border-green-800 rounded-lg bg-gray-900 p-6 animate-pulse">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin text-green-400">⚡</div>
          <div className="text-green-400">
            Generating your personalized {planType} plan...
          </div>
        </div>
        <div className="mt-4 text-center">
          <div className="text-gray-400 text-sm">
            Our AI is analyzing your profile and creating the perfect plan for you
          </div>
          <div className="mt-2 w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((retryCount / maxRetries) * 100, 90)}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            This usually takes 10-30 seconds...
          </div>
        </div>
      </div>
    );
  }

  // Show the actual plan component when ready, or fallback if generation failed
  return <>{fallbackComponent}</>;
}
