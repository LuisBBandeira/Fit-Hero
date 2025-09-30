'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ResetPasswordForm() {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    setIsVisible(true);
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      setIsValidToken(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/validate-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setIsValidToken(true);
      } else {
        setIsValidToken(false);
        setError(data.error || 'Invalid or expired reset link. Please request a new password reset.');
      }
    } catch (error) {
      setIsValidToken(false);
      setError('Failed to validate reset link. Please try again.');
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 25;
    return Math.min(strength, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      setIsLoading(false);
      return;
    }
    
    if (passwordStrength < 50) {
      setError('Password is too weak. Please use a stronger password.');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength >= 75) return 'bg-green-500';
    if (passwordStrength >= 50) return 'bg-yellow-500';
    if (passwordStrength >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStrengthText = () => {
    if (passwordStrength >= 75) return 'STRONG';
    if (passwordStrength >= 50) return 'GOOD';
    if (passwordStrength >= 25) return 'WEAK';
    return 'VERY WEAK';
  };

  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <img src="/gear.png" alt="Loading" className="w-16 h-16 animate-spin" />
          </div>
          <div>Validating reset link...</div>
        </div>
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-400 to-orange-400 rounded-full filter blur-3xl animate-pulse"></div>
        </div>

        <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
          <div className="w-full max-w-md">
            <div className="border border-red-800 rounded-lg bg-gray-900 shadow-2xl relative z-20">
              <div className="bg-gray-800 p-3 border-b border-red-800 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-red-400 text-sm ml-2">error.exe</span>
                  </div>
                  <div className="text-red-400 text-xs">ACCESS_DENIED</div>
                </div>
              </div>

              <div className="p-6">
                <div className="text-red-400 text-xl font-bold mb-4 animate-pulse">
                  <div className="flex items-center gap-2">
                    <img src="/cross.png" alt="Error" className="w-4 h-4" />
                    INVALID RESET LINK
                  </div>
                </div>
                <div className="text-gray-300 text-sm mb-6">
                  {error}
                </div>
                <div className="space-y-3">
                  <Link 
                    href="/forgot-password"
                    className="block w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded transition-all duration-300 text-center"
                  >
                    <img src="/gear.png" alt="Request" className="w-5 h-5 inline mr-2" />
                    REQUEST_NEW_RESET
                  </Link>
                  <Link 
                    href="/login"
                    className="block w-full border border-green-600 text-green-400 hover:bg-green-600 hover:text-black font-bold py-3 rounded transition-all duration-300 text-center"
                  >
                    ← BACK_TO_LOGIN
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            [PASSWORD_RESET_MODULE] - v2.4.1
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
          {/* Reset Password Terminal Window */}
          <div className="border border-green-800 rounded-lg bg-gray-900 shadow-2xl hover-lift relative z-20">
            {/* Terminal Header */}
            <div className="bg-gray-800 p-3 border-b border-green-800 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-400 text-sm ml-2">password-reset.exe</span>
                </div>
                <div className="text-green-400 text-xs">RESET_MODE</div>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-6">
              <div className="mb-6">
                <div className="text-green-400 text-xl font-bold mb-2 animate-pulse">
                  <img src="/lock-unlocked.png" alt="Password" className="w-6 h-6 inline mr-2" />
                  SET NEW PASSWORD
                </div>
                <div className="text-gray-300 text-sm mb-4">
                  Enter your new secure password
                </div>
                <div className="text-cyan-400 text-xs font-mono bg-black px-3 py-1 rounded border border-cyan-600">
                  $ update_password --secure --verify
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-green-400 text-sm mb-2">
                    NEW_PASSWORD:
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-black border border-green-600 rounded px-3 py-2 text-green-400 focus:border-cyan-400 focus:outline-none transition-colors duration-300 font-mono"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Password Strength:</span>
                      <span className={passwordStrength >= 50 ? 'text-green-400' : 'text-red-400'}>
                        {getStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-green-400 text-sm mb-2">
                    CONFIRM_PASSWORD:
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full bg-black border border-green-600 rounded px-3 py-2 text-green-400 focus:border-cyan-400 focus:outline-none transition-colors duration-300 font-mono"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-900/30 border border-red-600 text-red-400 px-4 py-3 rounded mb-4">
                    <div className="flex items-start">
                      <img src="/warning.png" alt="Warning" className="w-4 h-4 mr-2 mt-0.5" />
                      <div>
                        <div className="font-semibold text-red-300 mb-1">Reset Error</div>
                        <div className="text-sm">{error}</div>
                      </div>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="bg-green-900/30 border border-green-600 text-green-400 px-4 py-3 rounded mb-4">
                    <div className="flex items-start">
                      <img src="/checkmark.png" alt="Success" className="w-4 h-4 mr-2 mt-0.5" />
                      <div>
                        <div className="font-semibold text-green-300 mb-1">Password Reset</div>
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
                      <img src="/gear.png" alt="Loading" className="w-5 h-5 animate-spin mr-2" />
                      UPDATING_PASSWORD...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <img src="/lock-locked.png" alt="Reset" className="w-5 h-5 mr-2" />
                      UPDATE_PASSWORD
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* System Info */}
          <div className={`mt-6 text-center text-xs text-gray-500 transition-all duration-1000 delay-700 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
            <div>FIT_HERO Password Reset System v2.4.1</div>
            <div className="mt-1 flex items-center">
              Secure reset protocol active 
              <img src="/lock-locked.png" alt="Secure" className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <img src="/gear.png" alt="Loading" className="w-16 h-16 animate-spin" />
          </div>
          <div>Loading...</div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
