import { NavigateFunction } from 'react-router-dom';

// Store navigate function reference for use outside React components
let navigateFunction: NavigateFunction | null = null;

// Set the navigate function (call this in your App component or router setup)
export const setNavigateFunction = (navigate: NavigateFunction) => {
  navigateFunction = navigate;
};

// Navigation utility for use outside React components
export const navigateTo = (path: string) => {
  if (navigateFunction) {
    navigateFunction(path);
  } else {
    // Fallback to window.location if navigate function is not set
    console.warn('Navigate function not set, using window.location fallback');
    window.location.href = path;
  }
};