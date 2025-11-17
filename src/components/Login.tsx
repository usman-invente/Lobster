import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, Package, AlertTriangle, User, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      setIsLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      onLogin(username, password);
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left Section - Branding */}
          <div className="lg:flex-1 bg-gradient-to-br from-blue-500 to-blue-600 p-8 lg:p-16 flex items-center justify-center text-white">
            <div className="text-center lg:text-left max-w-md">
              <div className="flex items-center justify-center lg:justify-start mb-8">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-4">
                  <Package className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold">Lobster Stock</h1>
                  <p className="text-blue-100 text-sm">Online inventory management system</p>
                </div>
              </div>
              
              {/* Illustration - Hidden on mobile for minimal look */}
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="w-72 h-48 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 p-6 flex items-center justify-center">
                    <div className="text-center text-white/70">
                      <Package className="w-16 h-16 mx-auto mb-4 text-white/50" strokeWidth={1.5} />
                      <p className="text-sm">Streamlined inventory management for your business</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Login Form */}
          <div className="lg:flex-1 p-8 lg:p-16 flex items-center justify-center">
            <div className="w-full max-w-sm">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Login</h2>
                <p className="text-gray-600 text-sm">Enter your email and password</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <div>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-12 h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500/20"
                      placeholder="Username"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500/20"
                      placeholder="Password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-gray-600">Keep me logged in</span>
                  </label>
                  <a 
                    href="#" 
                    className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                    tabIndex={isLoading ? -1 : 0}
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-base shadow-lg hover:shadow-xl transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    'Log in'
                  )}
                </Button>
              </form>

              {/* Additional Options */}
              <div className="mt-8 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Login with TouchID</span>
                  </div>
                </div>
                
                <button
                  type="button"
                  className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  disabled={isLoading}
                >
                  <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
