import axios from 'axios';
import config from '../config';
import * as mockApi from './mockApi';
import * as mockProducts from './mockProducts';

// Check if environment variable or config flag is set to use mock API
const useMock = config.USE_MOCK_API; // Use the config value

// Helper to get the most up-to-date API base URL
const getBaseUrl = () => {
  // If a port was detected after initial config load, use that instead
  const detectedPort = sessionStorage.getItem('detected_backend_port');
  if (detectedPort) {
    return `http://localhost:${detectedPort}`;
  }
  return config.API_BASE_URL;
};

// Function to handle API errors with fallback to mock data
const handleApiRequestWithMockFallback = async (apiCall, mockData) => {
  try {
    // Always try the real API first, regardless of config
    const baseUrl = getBaseUrl();
    console.log(`Making API request to ${baseUrl}`);
    const response = await apiCall(baseUrl);
    console.log('API request successful');
    return response.data;
  } catch (error) {
    console.warn('API call failed, using mock data instead:', error);
    
    // If we get a specific error that suggests the port is wrong, clear detection
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.warn('Network error - clearing detected port');
      sessionStorage.removeItem('detected_backend_port');
    }
    
    return mockData();
  }
};

// Create order
export const createOrder = async (orderData) => {
  return handleApiRequestWithMockFallback(
    // Real API call
    (baseUrl) => axios.post(`${baseUrl}/api/orders`, orderData),
    // Mock fallback
    () => mockApi.createOrder(orderData)
  );
};

// Record blockchain transaction for an order
export const recordBlockchainTransaction = async (orderId, txData) => {
  return handleApiRequestWithMockFallback(
    // Real API call
    (baseUrl) => axios.post(`${baseUrl}/api/orders/${orderId}/blockchain`, txData),
    // Mock fallback
    () => mockApi.recordBlockchainTransaction(orderId, txData)
  );
};

// Get product details
export const getProduct = async (productId) => {
  return handleApiRequestWithMockFallback(
    // Real API call
    (baseUrl) => axios.get(`${baseUrl}/api/products/${productId}`),
    // Mock fallback
    () => mockProducts.getProductById(productId)
  );
};

// Get all products
export const getProducts = async (filters = {}) => {
  return handleApiRequestWithMockFallback(
    // Real API call
    (baseUrl) => axios.get(`${baseUrl}/api/products`, { params: filters }),
    // Mock fallback
    () => mockProducts.getAllProducts(filters)
  );
};

// Get product reviews
export const getProductReviews = async (productId) => {
  return handleApiRequestWithMockFallback(
    // Real API call
    (baseUrl) => axios.get(`${baseUrl}/api/reviews/${productId}`),
    // Mock fallback
    () => mockApi.getProductReviews(productId)
  );
};

// Create a product review
export const createProductReview = async (reviewData) => {
  return handleApiRequestWithMockFallback(
    // Real API call
    (baseUrl) => axios.post(`${baseUrl}/api/reviews`, reviewData),
    // Mock fallback
    () => mockApi.createProductReview(reviewData)
  );
};

// Get supply chain events
export const getSupplyChainEvents = async (productId) => {
  return handleApiRequestWithMockFallback(
    // Real API call
    (baseUrl) => axios.get(`${baseUrl}/api/supply-chain/${productId}`),
    // Mock fallback
    () => mockApi.getSupplyChainEvents(productId)
  );
};

// Test connection to backend - used for port detection
export const testBackendConnection = async (port) => {
  try {
    const response = await axios.get(`http://localhost:${port}/api/auth/test`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}; 