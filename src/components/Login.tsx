import React, { useState } from 'react';
import { Eye, EyeOff, Package, AlertTriangle, Mail, Lock, ArrowRight, Shield, BarChart3, Users, Zap, Building2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate loading
      onLogin(email, password);
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Section - Hero/Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative">
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white opacity-10 rounded-full"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-white opacity-5 rounded-full"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white opacity-10 rounded-full"></div>
        
        <div className="flex flex-col justify-center p-16 text-white relative z-10 max-w-lg">
          {/* Logo and Header */}
          <div className="mb-12">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                <Package className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Lobster Stock</h1>
                <p className="text-blue-100 text-lg">Inventory Management</p>
              </div>
            </div>
            
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Modern Inventory Management
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Streamline your business operations with powerful inventory tracking, 
              real-time analytics, and automated workflows.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Real-time Analytics</h4>
                <p className="text-blue-100">Monitor inventory levels, track trends, and get actionable insights instantly</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Enterprise Security</h4>
                <p className="text-blue-100">Bank-level encryption with role-based access controls and audit trails</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Multi-Location Support</h4>
                <p className="text-blue-100">Manage inventory across multiple warehouses and locations seamlessly</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-4 shadow-lg">
              <Package className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Lobster Stock</h1>
            <p className="text-gray-600 text-lg">Inventory Management System</p>
          </div>

          {/* Login Card */}
          <Card className="shadow-xl border-0 bg-white">
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome Back</h2>
                <p className="text-gray-600 text-lg">Sign in to access your dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-14 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your email"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-14 h-14 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your password"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">Remember me</span>
                  </label>
                  <a
                    href="#"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Signing you in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="mt-8 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">Secure Login</span>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="text-center">
                <div className="inline-flex items-center text-sm text-gray-500">
                  <Shield className="w-4 h-4 mr-2" />
                  <span>Protected by enterprise-grade security</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-3">
              © 2025 Lobster Stock. All rights reserved.
            </p>
            <div className="flex justify-center space-x-6 text-xs text-gray-400">
              <a href="#" className="hover:text-gray-600 transition-colors font-medium">Privacy</a>
              <a href="#" className="hover:text-gray-600 transition-colors font-medium">Terms</a>
              <a href="#" className="hover:text-gray-600 transition-colors font-medium">Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
