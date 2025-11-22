import axios from 'axios';

// Create axios instance with default config for Laravel Sanctum
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000', // Update this to your Laravel API URL
  withCredentials: false, // Set to false if using Bearer token instead of cookies
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
      // Handle unauthorized - clear token and optionally redirect to login
      localStorage.removeItem('token'); // Fix: clear the correct token key
      // You can dispatch a logout action here
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
