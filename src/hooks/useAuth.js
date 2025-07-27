import { useState, useEffect } from 'react';

const AUTH_TOKEN_KEY = 'ai_apps_directory_auth_token';
const AUTH_EXPIRY_KEY = 'ai_apps_directory_auth_expiry';
const DEFAULT_PASSWORD = 'admin123'; // In a real app, this would be stored securely on a server

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth token on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const expiry = localStorage.getItem(AUTH_EXPIRY_KEY);
      
      if (token && expiry) {
        // Check if token is still valid
        if (new Date().getTime() < parseInt(expiry, 10)) {
          setIsAuthenticated(true);
        } else {
          // Token expired, clean up
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(AUTH_EXPIRY_KEY);
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = (password, rememberMe = false) => {
    // In a real app, you would verify against a server
    // For this demo, we'll use a simple check
    if (password === DEFAULT_PASSWORD) {
      // Generate a simple token (in a real app, use JWT or similar)
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      
      // Set expiry - 7 days if remember me is checked, 1 day otherwise
      const expiryDays = rememberMe ? 7 : 1;
      const expiry = new Date().getTime() + (expiryDays * 24 * 60 * 60 * 1000);
      
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_EXPIRY_KEY, expiry.toString());
      
      setIsAuthenticated(true);
      return { success: true };
    } else {
      return { 
        success: false, 
        error: 'Invalid password. Try "admin123" for this demo.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_EXPIRY_KEY);
    setIsAuthenticated(false);
  };

  return { isAuthenticated, isLoading, login, logout };
};

export default useAuth;