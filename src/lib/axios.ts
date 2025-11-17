import axios from 'axios';

// Create axios instance with default config for Laravel Sanctum
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000', // Update this to your Laravel API URL
  withCredentials: true, // Important for Laravel Sanctum cookie-based authentication
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add auth token here if using token-based auth
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      // Handle unauthorized - clear token and redirect to login
      localStorage.removeItem('auth_token');
      // You can dispatch a logout action here
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
