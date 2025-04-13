import axios from 'axios';
import config from '../config';

// Create axios instance with default config
const api = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Login user
export const login = async (credentials) => {
  try {
    console.log('Login attempt with:', credentials);
    
    const response = await api.post('/api/auth/login', {
      username: credentials.username,
      password: credentials.password
    });
    
    console.log('Login response:', response.data);
    
    // Store token if provided
    if (response.data.token) {
      localStorage.setItem(config.AUTH.TOKEN_KEY, response.data.token);
      setAuthToken(response.data.token);
    }
    
    // Store user data with role information
    if (response.data.user) {
      const userData = {
        ...response.data.user,
        isAdmin: response.data.user.role === 'admin',
        isSeller: response.data.user.role === 'seller'
      };
      localStorage.setItem(config.AUTH.USER_KEY, JSON.stringify(userData));
      return userData;
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error details:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Register user
export const register = async (userData) => {
  try {
    const response = await api.post('/api/auth/register', userData);
    
    // Store token if provided
    if (response.data.token) {
      localStorage.setItem(config.AUTH.TOKEN_KEY, response.data.token);
      setAuthToken(response.data.token);
    }
    
    // Store user data
    if (response.data.user) {
      localStorage.setItem(config.AUTH.USER_KEY, JSON.stringify(response.data.user));
      return response.data.user;
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error.response?.data || error;
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem(config.AUTH.TOKEN_KEY);
  localStorage.removeItem(config.AUTH.USER_KEY);
  setAuthToken(null);
};

// Get current user
export const getCurrentUser = () => {
  const userJson = localStorage.getItem(config.AUTH.USER_KEY);
  if (userJson) {
    return JSON.parse(userJson);
  }
  return null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return localStorage.getItem(config.AUTH.TOKEN_KEY) !== null;
};

// Get auth token
export const getToken = () => {
  return localStorage.getItem(config.AUTH.TOKEN_KEY);
};

// Set auth token for all requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Initialize auth
export const initAuth = () => {
  const token = getToken();
  if (token) {
    setAuthToken(token);
  }
};

// Export the configured axios instance
export default api;

// Initialize auth when the module is loaded
initAuth(); 