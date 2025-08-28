'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface LogoutButtonProps {
  className?: string;
  showIcon?: boolean;
  redirectTo?: string;
  variant?: 'default' | 'danger' | 'minimal';
}

export default function LogoutButton({ 
  className = '', 
  showIcon = true, 
  redirectTo = '/',
  variant = 'default'
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      await signOut({
        callbackUrl: redirectTo,
        redirect: true
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: redirect manually if signOut fails
      router.push(redirectTo);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return 'text-red-400 hover:text-red-300 hover:bg-red-900/20';
      case 'minimal':
        return 'text-gray-400 hover:text-gray-300';
      default:
        return 'text-gray-400 hover:text-red-400';
    }
  };

  return (
    <button 
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`
        ${getVariantStyles()}
        transition-all duration-300 
        flex items-center space-x-2 
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:animate-pulse
        ${className}
      `}
    >
      {showIcon && <span>{isLoggingOut ? '⏳' : '🚪'}</span>}
      <span>{isLoggingOut ? 'LOGGING_OUT...' : 'LOGOUT'}</span>
    </button>
  );
}
