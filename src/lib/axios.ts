import axios from 'axios';
import { navigateTo } from './navigation';

// Create axios instance with default config for Laravel Sanctum
const axiosInstance = axios.create({
  baseURL: __API_BASE_URL__,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add auth token here if using token-based auth
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Debug: log token and Authorization header
      console.log('Auth token:', token);
      console.log('Authorization header:', config.headers.Authorization);
    } else {
      console.log('No auth token found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Check if the response contains "Unauthenticated." message
      if (error.response.data?.message === 'Unauthenticated.') {
        // Clear stored auth token
        localStorage.removeItem('token');

        // Show error message (assuming you have toast notifications)
        // You can replace this with your preferred notification system
        console.log('Session expired - redirecting to login');

        // Redirect to login page
        navigateTo('/login');

        // Return a resolved promise to prevent further error handling
        return Promise.resolve();
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
