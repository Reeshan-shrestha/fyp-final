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

      // Validate input
      if (!credentials.username || !credentials.password) {
        throw new Error('Username and password are required');
      }
      
      // Use authentication service
      const userData = await authService.login(credentials);
      
      if (userData) {
        // Update state with additional seller information if needed
        const enhancedUserData = {
          ...userData,
          // Ensure we have a consistent sellerId format
          sellerId: userData.sellerId || (userData.role === 'seller' ? `seller_${userData.username}` : null)
        };
        
        setUser(enhancedUserData);
        setGuestMode(false);
        setAuthenticated(true);
        setIsAuthenticated(true);
        
        console.log('User logged in successfully:', enhancedUserData);
        return enhancedUserData;
      } else {
        throw new Error('Failed to login');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setError(error.message || 'Failed to login');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      // Validate input
      if (!userData.username || !userData.email || !userData.password) {
        throw new Error('All fields are required');
      }
      
      // Use authentication service
      const user = await authService.register(userData);
      
      if (user) {
        // Update state
        setUser(user);
        setGuestMode(false);
        setAuthenticated(true);
        setIsAuthenticated(true);
        
        console.log('User registered successfully:', user);
        return user;
      } else {
        throw new Error('Failed to register');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      setError(error.message || 'Failed to register');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    authService.logout();
    
    setUser(null);
    setGuestMode(true);
    setAuthenticated(false);
    setIsAuthenticated(false);
    
    // Generate guest account
    setGuestAccount();
  };

  const setGuestAccount = () => {
    // Generate a random guest ID
    const guestUser = {
      id: 'guest_' + Math.random().toString(36).substring(2, 15),
      username: 'Guest User',
      displayName: 'Guest User'
    };
    setUser(guestUser);
    setGuestMode(true);
    setAuthenticated(false);
    setIsAuthenticated(false);
  };

  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Initialize auth service
      authService.initAuth();
      
      // Check if user is already logged in
      const savedUser = authService.getCurrentUser();
      if (savedUser) {
        setUser(savedUser);
        setGuestMode(false);
        setAuthenticated(true);
        setIsAuthenticated(true);
      } else {
        // Use guest mode if no user is logged in
        setGuestAccount();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setError(error.message || 'Failed to initialize authentication');
      // Still create a guest account if all else fails
      if (!user) {
        setGuestAccount();
      }
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array so it doesn't recreate on every render

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

  // Initialize auth when the component mounts
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]); // Include initializeAuth as a dependency since we're using useCallback

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