import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../config';
import * as authService from '../services/authService';

const AuthContext = createContext();

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

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [guestMode, setGuestMode] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      // Basic validation
      if (!credentials.username && !credentials.email) {
        throw new Error('Username or email is required');
      }
      
      if (!credentials.password) {
        throw new Error('Password is required');
      }
      
      console.log('AuthContext: Attempting login with:', credentials);
      
      // Use auth service to login
      const response = await authService.login(credentials);
      
      console.log('AuthContext: Login response received:', response);
      
      if (response && response.token) {
        // Store token
        safeBrowserStorage.setItem('token', response.token);
        
        // Set Authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
        
        // Update state with user data
        const userData = {
          ...response,
          id: response.id || response._id || (response.user && (response.user.id || response.user._id)),
          username: response.username || (response.user && response.user.username),
          email: response.email || (response.user && response.user.email),
          role: response.role || (response.user && response.user.role),
          isAdmin: response.isAdmin || (response.user && response.user.isAdmin) || (response.role === 'admin') || (response.user && response.user.role === 'admin'),
          isSeller: response.isSeller || (response.user && response.user.isSeller) || (response.role === 'seller') || (response.user && response.user.role === 'seller')
        };
        
        setUser(userData);
        setGuestMode(false);
        setAuthenticated(true);
        setIsAuthenticated(true);
        
        console.log('User logged in successfully:', userData);
        return userData;
      } else {
        throw new Error('Login failed - invalid response from server');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setError(error.message || 'Failed to login');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Initialize auth state - check if we have a token and fetch user info
  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check for token in storage
      const token = safeBrowserStorage.getItem('token');
      
      if (token) {
        console.log('Found token, verifying...');
        
        // Set token in axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Attempt to get current user with token
        const userData = await authService.getCurrentUser();
        
        if (userData) {
          setUser(userData);
          setGuestMode(false);
          setAuthenticated(true);
          setIsAuthenticated(true);
          console.log('User authenticated from saved token');
        } else {
          // Token invalid - clear it
          console.log('Token verification failed, clearing');
          safeBrowserStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setupGuestAccount();
        }
      } else {
        console.log('No token found, using guest mode');
        setupGuestAccount();
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setupGuestAccount();
    } finally {
      setLoading(false);
    }
  }, []);

  // Setup guest account
  const setupGuestAccount = () => {
    setUser(null);
    setGuestMode(true);
    setAuthenticated(false);
    setIsAuthenticated(false);
  };

  // Logout user
  const logout = () => {
    setUser(null);
    setGuestMode(true);
    setAuthenticated(false);
    setIsAuthenticated(false);
    
    // Clear token from storage
    safeBrowserStorage.removeItem('token');
    
    // Clear Authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    console.log('User logged out');
  };

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Basic validation
      if (!userData.username) {
        throw new Error('Username is required');
      }
      
      if (!userData.email) {
        throw new Error('Email is required');
      }
      
      if (!userData.password) {
        throw new Error('Password is required');
      }
      
      console.log('AuthContext: Attempting registration for:', userData.username);
      
      // Use auth service to register
      const response = await authService.register(userData);
      
      console.log('AuthContext: Registration response received:', response);
      
      if (response && response.token) {
        // Store token
        safeBrowserStorage.setItem('token', response.token);
        
        // Set Authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
        
        // Update state with user data (handling multiple response formats)
        const userData = {
          ...response,
          id: response.id || response._id || (response.user && (response.user.id || response.user._id)),
          username: response.username || (response.user && response.user.username),
          email: response.email || (response.user && response.user.email),
          role: response.role || (response.user && response.user.role),
          isAdmin: response.isAdmin || (response.user && response.user.isAdmin) || (response.role === 'admin') || (response.user && response.user.role === 'admin'),
          isSeller: response.isSeller || (response.user && response.user.isSeller) || (response.role === 'seller') || (response.user && response.user.role === 'seller')
        };
        
        setUser(userData);
        setGuestMode(false);
        setAuthenticated(true);
        setIsAuthenticated(true);
        
        console.log('User registered successfully:', userData);
        return userData;
      } else {
        throw new Error('Registration failed - invalid response from server');
      }
    } catch (error) {
      console.error('Error registering:', error);
      setError(error.message || 'Failed to register');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyProduct = async (productId) => {
    try {
      // Simple product verification - in a real app, this would check with your backend
      const response = await axios.get(`${config.API_BASE_URL}/api/products/${productId}/verify-status`);
      return response.data.verified;
    } catch (error) {
      console.error('Error checking product verification:', error);
      // For demo purposes, return true on error to simulate successful verification
      return true;
    }
  };

  // Use effect to initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const value = {
    loading,
    error,
    user,
    userId: user?.id || user?._id,
    userDisplayName: user?.displayName || user?.username,
    guestMode,
    authenticated,
    isAuthenticated,
    initializeAuth,
    login,
    register,
    logout,
    verifyProduct
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 