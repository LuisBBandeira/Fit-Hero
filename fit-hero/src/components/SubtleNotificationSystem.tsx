'use client';

import { useState, useEffect } from 'react';

interface SubtleNotification {
  id: string;
  type: 'success' | 'info';
  message: string;
  duration?: number;
}

export default function SubtleNotificationSystem() {
  const [notifications, setNotifications] = useState<SubtleNotification[]>([]);

  useEffect(() => {
    // Listen for custom events from the app
    const handleNotification = (event: CustomEvent<SubtleNotification>) => {
      const notification = event.detail;
      setNotifications(prev => [...prev, notification]);

      // Auto-remove after duration
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, notification.duration || 4000);
    };

    window.addEventListener('subtle-notification' as any, handleNotification);
    
    return () => {
      window.removeEventListener('subtle-notification' as any, handleNotification);
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            transform transition-all duration-300 ease-in-out
            animate-slide-in-right
            bg-gray-900/95 border rounded-lg p-4 max-w-sm shadow-2xl backdrop-blur-sm
            ${notification.type === 'success' 
              ? 'border-green-600 text-green-300' 
              : 'border-cyan-600 text-cyan-300'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm">
                {notification.type === 'success' ? (
                  <img src="/star.png" alt="Success" className="w-4 h-4" />
                ) : (
                  <img src="/light-bulb.png" alt="Info" className="w-4 h-4" />
                )}
              </span>
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-white transition-colors ml-3 text-xs"
            >
              <img src="/cross.png" alt="Close" className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Utility function to trigger notifications from anywhere in the app
export const showSubtleNotification = (notification: Omit<SubtleNotification, 'id'>) => {
  const event = new CustomEvent('subtle-notification', {
    detail: {
      ...notification,
      id: Math.random().toString(36).substr(2, 9)
    }
  });
  window.dispatchEvent(event);
};
