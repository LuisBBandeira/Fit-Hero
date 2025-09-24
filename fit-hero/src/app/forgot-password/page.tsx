'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password reset instructions have been sent to your email address if an account exists with that email.');
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Matrix Effect */}
      <div className="absolute inset-0 opacity-5 pointer-events-none z-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-green-400 text-xs font-mono animate-matrix-rain pointer-events-none"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          >
            {String.fromCharCode(65 + Math.random() * 26)}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className={`bg-gray-900 border-b border-green-800 p-4 transition-all duration-1000 relative z-10 ${isVisible ? 'animate-slide-in-down' : 'opacity-0'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-green-400 text-sm">
            [PASSWORD_RECOVERY_MODULE] - v2.4.1
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className={`bg-gray-800 p-3 border-b border-green-800 transition-all duration-1000 delay-300 relative z-10 ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
        <div className="max-w-4xl mx-auto">
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 hover-glow">
            ← BACK_TO_LOGIN
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-4 relative z-10">
        <div className={`w-full max-w-md transition-all duration-1000 delay-500 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {/* Password Recovery Terminal Window */}
          <div className="border border-green-800 rounded-lg bg-gray-900 shadow-2xl hover-lift relative z-20">
            {/* Terminal Header */}
            <div className="bg-gray-800 p-3 border-b border-green-800 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-400 text-sm ml-2">password-recovery.exe</span>
                </div>
                <div className="text-green-400 text-xs">RECOVERY_MODE</div>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-6">
              <div className="mb-6">
                <div className="text-green-400 text-xl font-bold mb-2 animate-pulse">
                  🔓 PASSWORD RECOVERY
                </div>
                <div className="text-gray-300 text-sm mb-4">
                  Enter your email to receive password reset instructions
                </div>
                <div className="text-cyan-400 text-xs font-mono bg-black px-3 py-1 rounded border border-cyan-600">
                  $ initiate_password_recovery --secure
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-green-400 text-sm mb-2">
                    EMAIL_ADDRESS:
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black border border-green-600 rounded px-3 py-2 text-green-400 focus:border-cyan-400 focus:outline-none transition-colors duration-300 font-mono"
                    placeholder="user@fithero.exe"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-900/30 border border-red-600 text-red-400 px-4 py-3 rounded mb-4">
                    <div className="flex items-start">
                      <span className="mr-2 mt-0.5">⚠️</span>
                      <div>
                        <div className="font-semibold text-red-300 mb-1">Recovery Error</div>
                        <div className="text-sm">{error}</div>
                      </div>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="bg-green-900/30 border border-green-600 text-green-400 px-4 py-3 rounded mb-4">
                    <div className="flex items-start">
                      <span className="mr-2 mt-0.5">✅</span>
                      <div>
                        <div className="font-semibold text-green-300 mb-1">Recovery Initiated</div>
                        <div className="text-sm">{success}</div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-3 rounded transition-all duration-300 hover-lift animate-glow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin mr-2">🔄</span>
                      PROCESSING_RECOVERY...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <span className="mr-2">📧</span>
                      SEND_RECOVERY_EMAIL
                    </span>
                  )}
                </button>

                {/* Additional Options */}
                <div className="mt-6 pt-4 border-t border-green-800">
                  <div className="text-center space-y-2">
                    <div className="text-gray-400 text-sm">
                      Remember your password?
                    </div>
                    <Link 
                      href="/login"
                      className="inline-block text-cyan-400 hover:text-cyan-300 transition-colors duration-300 hover-glow text-sm"
                    >
                      → RETURN_TO_LOGIN
                    </Link>
                  </div>
                  
                  <div className="text-center mt-4">
                    <Link 
                      href="/signup"
                      className="text-gray-500 hover:text-gray-400 transition-colors duration-300 text-xs"
                    >
                      CREATE_NEW_ACCOUNT?
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* System Info */}
          <div className={`mt-6 text-center text-xs text-gray-500 transition-all duration-1000 delay-700 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
            <div>FIT_HERO Password Recovery System v2.4.1</div>
            <div className="mt-1">Secure recovery protocol active 🔒</div>
          </div>
        </div>
      </div>
    </div>
  );
}
