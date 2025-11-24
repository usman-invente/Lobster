

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Anchor, Loader2 } from 'lucide-react';
import axios from '../lib/axios';
import { useDispatch } from 'react-redux';
import { setUser } from '../userSlice';

export function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      // Call your login API endpoint
      const response = await axios.post('/api/login', {
        username,
        password,
      });
      // Debug: log the response data to check for token
      console.log('Login API response:', response.data);
      // Assume response.data contains user info and token
      const user = response.data.user || response.data;
      dispatch(setUser(user));
      // Store token from response.data.token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      } else if (user.token) {
        localStorage.setItem('token', user.token);
      } else {
        console.warn('No token found in login response!');
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4">
            <Anchor className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl text-gray-900 mb-2">Lobster Stock</h1>
          <p className="text-gray-600">Management System</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-xl text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-sm text-gray-600">Please enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter username"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              {submitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer */}
        
      </div>
    </div>
  );
}
