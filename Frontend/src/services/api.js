import axios from 'axios';
import config from '../config';
import * as mockApi from './mockApi';
import * as mockProducts from './mockProducts';

// Check if environment variable or config flag is set to use mock API
const useMock = config.USE_MOCK_API; // Use the config value

// Function to handle API errors with fallback to mock data
const handleApiRequestWithMockFallback = async (apiCall, mockData) => {
  try {
    // Always try the real API first, regardless of config
    const response = await apiCall();
    return response.data;
  } catch (error) {
    console.warn('API call failed, using mock data instead:', error);
    return mockData();
  }
};

// Create order
export const createOrder = async (orderData) => {
  return handleApiRequestWithMockFallback(
    // Real API call
    () => axios.post(`${config.API_BASE_URL}/api/orders`, orderData),
    // Mock fallback
    () => mockApi.createOrder(orderData)
  );
};

// Record blockchain transaction for an order
export const recordBlockchainTransaction = async (orderId, txData) => {
  return handleApiRequestWithMockFallback(
    // Real API call
    () => axios.post(`${config.API_BASE_URL}/api/orders/${orderId}/blockchain`, txData),
    // Mock fallback
    () => mockApi.recordBlockchainTransaction(orderId, txData)
  );
};

// Get product details
export const getProduct = async (productId) => {
  return handleApiRequestWithMockFallback(
    // Real API call
    () => axios.get(`${config.API_BASE_URL}/api/products/${productId}`),
    // Mock fallback
    () => mockProducts.getProductById(productId)
  );
};

// Get all products
export const getProducts = async (filters = {}) => {
  return handleApiRequestWithMockFallback(
    // Real API call
    () => axios.get(`${config.API_BASE_URL}/api/products`, { params: filters }),
    // Mock fallback
    () => mockProducts.getAllProducts(filters)
  );
}; 