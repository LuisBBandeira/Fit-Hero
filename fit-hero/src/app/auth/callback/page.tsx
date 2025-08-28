'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

function CallbackContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      // Wait for session to be loaded
      if (status === 'loading') return;

      if (status === 'unauthenticated') {
        // No session, redirect to login
        router.push('/login');
        return;
      }

      if (status === 'authenticated') {
        try {
          // Check if user has a character
          const response = await fetch('/api/user/character-status');
          
          if (!response.ok) {
            throw new Error('Failed to check character status');
          }

          const data = await response.json();
          
          // Redirect based on character status
          if (data.hasCharacter) {
            console.log('✅ User has character, redirecting to dashboard');
            router.push('/dashboard');
          } else {
            console.log('👤 User needs character creation');
            router.push('/character-creation');
          }
        } catch (error) {
          console.error('Callback error:', error);
          setError('Failed to check user status. Redirecting to dashboard...');
          // Fallback to dashboard after 2 seconds
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } finally {
          setIsChecking(false);
        }
      }
    };

    handleCallback();
  }, [status, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-black text-red-400 font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-xl mb-4">Something went wrong</div>
          <div className="text-sm mb-4">{error}</div>
          <div className="text-xs text-gray-400">Redirecting automatically...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">🔄</div>
        <div className="text-xl mb-4">Setting up your account...</div>
        <div className="text-sm text-gray-400">
          {isChecking ? 'Checking character status...' : 'Redirecting...'}
        </div>
        <div className="mt-6">
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function CallbackLoading() {
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">🔄</div>
        <div className="text-xl mb-4">Loading...</div>
        <div className="mt-6">
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function CallbackPage() {
  return (
    <Suspense fallback={<CallbackLoading />}>
      <CallbackContent />
    </Suspense>
  );
}
