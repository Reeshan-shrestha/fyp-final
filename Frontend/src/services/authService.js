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

// Change the mock sellers to seller data
// Seller data to ensure these accounts exist in the database
const sellerData = [
  {
    username: 'TechVision',
    email: 'tech@vision.com',
    password: 'seller123',
    role: 'seller',
    walletAddress: '0x123456789abcdef123456789abcdef123456789a'
  },
  {
    username: 'SportStyle',
    email: 'sport@style.com',
    password: 'seller123',
    role: 'seller',
    walletAddress: '0x223456789abcdef123456789abcdef123456789b'
  },
  {
    username: 'GourmetDelights',
    email: 'gourmet@delights.com',
    password: 'seller123',
    role: 'seller',
    walletAddress: '0x323456789abcdef123456789abcdef123456789c'
  },
  {
    username: 'FashionFusion',
    email: 'fashion@fusion.com',
    password: 'seller123',
    role: 'seller',
    walletAddress: '0x423456789abcdef123456789abcdef123456789d'
  },
  {
    username: 'SmartHome',
    email: 'smart@home.com',
    password: 'seller123',
    role: 'seller',
    walletAddress: '0x523456789abcdef123456789abcdef123456789e'
  }
];

// Function to create a seller account if it doesn't exist
const createSellerIfNotExists = async (sellerInfo) => {
  try {
    // Try to login first to see if the account exists
    const loginResponse = await api.post('/api/auth/login', {
      username: sellerInfo.username,
      password: sellerInfo.password
    });
    
    if (loginResponse.data && loginResponse.data.token) {
      console.log(`Seller ${sellerInfo.username} already exists, logging in`);
      return loginResponse.data;
    }
  } catch (loginError) {
    // Login failed, account might not exist, try to create it
    console.log(`Seller ${sellerInfo.username} not found, attempting to register`);
    
    try {
      const registerResponse = await api.post('/api/auth/register', sellerInfo);
      if (registerResponse.data && registerResponse.data.token) {
        console.log(`Created seller account for ${sellerInfo.username}`);
        return registerResponse.data;
      }
    } catch (registerError) {
      console.error(`Failed to create seller account for ${sellerInfo.username}:`, registerError);
      throw new Error(`Could not create seller account: ${registerError.message}`);
    }
  }
  
  throw new Error(`Failed to ensure seller account for ${sellerInfo.username}`);
};

// Login user
export const login = async (credentials) => {
  try {
    console.log('Login attempt with:', credentials);
    
    // First, try to login with the real API
    try {
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
    } catch (loginError) {
      console.warn('Login API error:', loginError);
      
      // If it's one of our predefined sellers, try to create the account
      const matchingSeller = sellerData.find(
        seller => seller.username === credentials.username && credentials.password === 'seller123'
      );
      
      if (matchingSeller) {
        console.log(`Attempting to create predefined seller account for ${matchingSeller.username}`);
        
        // Try to create the seller account
        const sellerAccount = await createSellerIfNotExists(matchingSeller);
        
        if (sellerAccount && sellerAccount.token) {
          localStorage.setItem(config.AUTH.TOKEN_KEY, sellerAccount.token);
          setAuthToken(sellerAccount.token);
          
          // Store user data
          const userData = {
            ...sellerAccount.user,
            isAdmin: sellerAccount.user.role === 'admin',
            isSeller: sellerAccount.user.role === 'seller'
          };
          localStorage.setItem(config.AUTH.USER_KEY, JSON.stringify(userData));
          return userData;
        }
      }
      
      // If we get here, neither login nor account creation worked
      throw new Error('Login failed and could not create account.');
    }
  } catch (error) {
    console.error('Login error details:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// Register user
export const register = async (userData) => {
  try {
    // Check if it's one of our predefined sellers
    const matchingSeller = sellerData.find(
      seller => seller.username === userData.username || seller.email === userData.email
    );
    
    if (matchingSeller) {
      console.log(`Registering predefined seller: ${matchingSeller.username}`);
      // Use the predefined seller data for consistency
      const sellerAccount = await createSellerIfNotExists(matchingSeller);
      
      if (sellerAccount && sellerAccount.token) {
        localStorage.setItem(config.AUTH.TOKEN_KEY, sellerAccount.token);
        setAuthToken(sellerAccount.token);
        
        // Store user data
        const userData = {
          ...sellerAccount.user,
          isAdmin: sellerAccount.user.role === 'admin',
          isSeller: sellerAccount.user.role === 'seller'
        };
        localStorage.setItem(config.AUTH.USER_KEY, JSON.stringify(userData));
        return userData;
      }
    }
    
    // For non-predefined users, proceed with regular registration
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