import axios from '../lib/axios';

// API endpoints
const API_ENDPOINTS = {
  CSRF_COOKIE: '/sanctum/csrf-cookie',
  LOGIN: '/api/login',
  LOGOUT: '/api/logout',
  USER: '/api/user',
  REGISTER: '/api/register',
};

// Authentication API service
export const authService = {
  // Get CSRF cookie (required for Laravel Sanctum)
  getCsrfCookie: async () => {
    return axios.get(API_ENDPOINTS.CSRF_COOKIE);
  },

  // Login user
  login: async (username: string, password: string) => {
    // First, get CSRF cookie
    await authService.getCsrfCookie();
    
    // Then attempt login
    const response = await axios.post(API_ENDPOINTS.LOGIN, {
      email: username, // Laravel typically uses 'email' field
      password: password,
    });
    
    // Store token if using token-based auth
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await axios.post(API_ENDPOINTS.LOGOUT);
    localStorage.removeItem('auth_token');
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await axios.get(API_ENDPOINTS.USER);
    return response.data;
  },

  // Register new user
  register: async (name: string, email: string, password: string, passwordConfirmation: string) => {
    await authService.getCsrfCookie();
    
    const response = await axios.post(API_ENDPOINTS.REGISTER, {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
    
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data;
  },
};

export default authService;
