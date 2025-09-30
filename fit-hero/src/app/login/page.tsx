'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // First, check credentials with our custom endpoint for specific error messages
      const authCheck = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const authResult = await authCheck.json();

      if (!authCheck.ok) {
        setError(authResult.error);
        return;
      }

      // If credentials are valid, proceed with NextAuth signin
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Authentication failed. Please try again.');
      } else {
        // Successful login - use smart callback to determine redirect
        router.push('/auth/callback');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: '/auth/callback' });
    } catch (error) {
      setError(`Failed to sign in with ${provider}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono relative overflow-hidden">
      {/* Matrix Background */}
      <div className="matrix-bg"></div>
      <div className="scanlines"></div>
      
      {/* Terminal Header */}
      <div className={`bg-gray-900 border-b border-green-500 p-4 transition-all duration-1000 ${isVisible ? 'animate-slide-in-bottom' : 'opacity-0'}`}>
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse delay-100"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-200"></div>
            <span className="text-green-400 text-lg font-bold ml-4">FIT_HERO.exe</span>
          </div>
          <div className="text-green-400 text-sm">
            [USER_AUTH_MODULE] - v2.4.1
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className={`bg-gray-800 p-3 border-b border-green-800 transition-all duration-1000 delay-300 ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 hover-glow">
            ← BACK_TO_MAIN
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <div className={`w-full max-w-md transition-all duration-1000 delay-500 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {/* Login Terminal Window */}
          <div className="border border-green-800 rounded-lg bg-gray-900 shadow-2xl hover-lift">
            {/* Terminal Header */}
            <div className="bg-gray-800 p-3 border-b border-green-800 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-400 text-sm ml-2">login.exe</span>
                </div>
                <div className="text-green-400 text-xs">AUTH_REQUIRED</div>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-6">
              <div className="mb-6">
                <div className="text-green-400 text-xl font-bold mb-2 animate-pulse">
                  <img src="/lock-locked.png" alt="Authentication" className="w-6 h-6 inline mr-2" />
                  USER AUTHENTICATION
                </div>
                <div className="text-gray-300 text-sm mb-4">
                  Enter your credentials to access the fitness matrix
                </div>
                <div className="text-cyan-400 text-xs font-mono bg-black px-3 py-1 rounded border border-cyan-600">
                  $ authenticate_user --secure
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-green-400 text-sm mb-2">
                    EMAIL_ADDRESS:
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-black border border-green-600 rounded px-3 py-2 text-green-400 focus:border-cyan-400 focus:outline-none transition-colors duration-300 font-mono"
                    placeholder="user@fithero.exe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-green-400 text-sm mb-2">
                    PASSWORD:
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

                {error && (
                  <div className="bg-red-900/30 border border-red-600 text-red-400 px-4 py-3 rounded mb-4">
                    <div className="flex items-start">
                      <img src="/warning.png" alt="Warning" className="w-5 h-5 mr-2 mt-0.5" />
                      <div>
                        <div className="font-semibold text-red-300 mb-1">Authentication Error</div>
                        <div className="text-sm">{error}</div>
                        {(error.includes('Google') || error.includes('GitHub')) && (
                          <div className="mt-2 text-xs text-red-300">
                            <img src="/light-bulb.png" alt="Tip" className="w-4 h-4 inline mr-1" />                             <img src="/light-bulb.png" alt="Tip" className="w-4 h-4 inline mr-1" /> Use the social login buttons below instead
                          </div>
                        )}
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
                      <img src="/lightning-bolt.png" alt="Loading" className="w-5 h-5 animate-spin mr-2" />
                      AUTHENTICATING...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <img src="/rocket.png" alt="Login" className="w-5 h-5 mr-2" />
                      EXECUTE_LOGIN
                    </span>
                  )}
                </button>

                {/* Social Login Divider */}
                <div className="flex items-center my-6">
                  <div className="flex-1 border-t border-green-800"></div>
                  <span className="px-4 text-gray-400 text-sm">OR</span>
                  <div className="flex-1 border-t border-green-800"></div>
                </div>

                {/* Social Login Buttons */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    disabled={isLoading}
                    className={`w-full ${
                      error.includes('Google') 
                        ? 'bg-blue-600/20 border-blue-400 animate-pulse hover:bg-blue-600/30' 
                        : 'bg-gray-800 hover:bg-gray-700 border-green-600'
                    } text-green-400 font-bold py-3 rounded transition-all duration-300 hover-lift flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed border`}
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>LOGIN_WITH_GOOGLE</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialLogin('github')}
                    disabled={isLoading}
                    className={`w-full ${
                      error.includes('GitHub') 
                        ? 'bg-purple-600/20 border-purple-400 animate-pulse hover:bg-purple-600/30' 
                        : 'bg-gray-800 hover:bg-gray-700 border-green-600'
                    } text-green-400 font-bold py-3 rounded transition-all duration-300 hover-lift flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed border`}
                  >
                    <svg className="w-5 h-5 mr-3 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span>LOGIN_WITH_GITHUB</span>
                  </button>
                </div>
              </form>

              {/* Additional Options */}
              <div className="mt-6 pt-4 border-t border-green-800">
                <div className="text-center space-y-2">
                  <div className="text-gray-400 text-sm">
                    No account detected?
                  </div>
                  <Link 
                    href="/signup"
                    className="inline-block text-cyan-400 hover:text-cyan-300 transition-colors duration-300 hover-glow text-sm"
                  >
                    → CREATE_NEW_USER
                  </Link>
                </div>
                
                                  <div className="text-center mt-4">
                    <Link 
                      href="/forgot-password"
                      className="text-gray-500 hover:text-gray-400 transition-colors duration-300 text-xs"
                    >
                      FORGOT_PASSWORD?
                    </Link>
                  </div>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className={`mt-6 text-center text-xs text-gray-500 transition-all duration-1000 delay-700 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
            <div>FIT_HERO Authentication System v2.4.1</div>
            <div className="mt-1 flex items-center">
              Secure connection established 
              <img src="/lock-locked.png" alt="Secure" className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
