'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      // Wait for session to be loaded
      if (status === 'loading') return;

      if (status === 'unauthenticated') {
        // No session, redirect to login immediately
        router.replace('/login');
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
          
          // Redirect based on character status - use replace for instant navigation
          if (data.hasCharacter) {
            router.replace('/dashboard');
          } else {
            router.replace('/character-creation');
          }
        } catch (error) {
          console.error('Callback error:', error);
          // Fallback to dashboard immediately
          router.replace('/dashboard');
        }
      }
    };

    handleCallback();
  }, [status, router]);

  // Return minimal content - this will only flash briefly before redirect
  return null;
}
