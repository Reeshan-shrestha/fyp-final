'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create Auth Context
const AuthContext = createContext(null);

// Auth Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper for safe browser storage access (client-side only)
const safeBrowserStorage = {
  getItem: (key, storageType = 'local') => {
    if (typeof window === 'undefined') return null;
    
    try {
      const storage = storageType === 'local' ? localStorage : sessionStorage;
      return storage.getItem(key);
    } catch (error) {
      console.error(`Error accessing ${storageType} storage:`, error);
      return null;
    }
  },
  setItem: (key, value, storageType = 'local') => {
    if (typeof window === 'undefined') return;
    
    try {
      const storage = storageType === 'local' ? localStorage : sessionStorage;
      storage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting ${storageType} storage:`, error);
    }
  },
  removeItem: (key, storageType = 'local') => {
    if (typeof window === 'undefined') return;
    
    try {
      const storage = storageType === 'local' ? localStorage : sessionStorage;
      storage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from ${storageType} storage:`, error);
    }
  }
};

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on component mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = safeBrowserStorage.getItem('token');
        if (token) {
          // Verify token validity
          const response = await axios.get('http://localhost:3006/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data) {
            setUser(response.data);
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        safeBrowserStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    // Only run on client-side
    if (typeof window !== 'undefined') {
      initAuth();
    } else {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('http://localhost:3006/api/auth/login', credentials);
      
      if (response.data.token) {
        safeBrowserStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response.data.user;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    safeBrowserStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('http://localhost:3006/api/auth/register', userData);
      
      if (response.data.token) {
        safeBrowserStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response.data.user;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Auth context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 