'use client';

import { useState, useEffect } from 'react';

interface AINotificationProps {
  show: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

export default function AINotification({ show, onClose, type, title, message }: AINotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, onClose]);

  if (!show) return null;

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'border-green-600 bg-green-900/30 text-green-300';
      case 'error':
        return 'border-red-600 bg-red-900/30 text-red-300';
      case 'info':
        return 'border-cyan-600 bg-cyan-900/30 text-cyan-300';
      default:
        return 'border-green-600 bg-green-900/30 text-green-300';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return '🤖';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`border rounded-lg p-4 max-w-sm shadow-lg ${getStyles()}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <span className="text-xl">{getIcon()}</span>
            <div className="flex-1">
              <div className="font-bold text-sm mb-1">{title}</div>
              <div className="text-xs leading-relaxed">{message}</div>
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-gray-400 hover:text-white transition-colors ml-2"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
