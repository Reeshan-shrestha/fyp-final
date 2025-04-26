import axios from 'axios';
import config from '../config';

// Helper to get the most up-to-date API base URL
const getBaseUrl = () => {
  // If a port was detected after initial config load, use that instead
  const detectedPort = sessionStorage.getItem('detected_backend_port');
  if (detectedPort) {
    return `http://localhost:${detectedPort}`;
  }
  return config.API_BASE_URL;
};

// Create order
export const createOrder = async (orderData) => {
  try {
    const baseUrl = getBaseUrl();
    const response = await axios.post(`${baseUrl}/api/orders`, orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Record blockchain transaction for an order
export const recordBlockchainTransaction = async (orderId, txData) => {
  try {
    const baseUrl = getBaseUrl();
    const response = await axios.post(`${baseUrl}/api/orders/${orderId}/blockchain`, txData);
    return response.data;
  } catch (error) {
    console.error('Error recording blockchain transaction:', error);
    throw error;
  }
};

// Get product details
export const getProduct = async (productId) => {
  try {
    const baseUrl = getBaseUrl();
    const response = await axios.get(`${baseUrl}/api/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
};

// Get all products
export const getProducts = async (filters = {}) => {
  try {
    // Real API call with explicit seller filtering
    const baseUrl = getBaseUrl();
    console.log('Getting products with filters:', filters);
    
    // If we're filtering by seller, make sure the API includes this parameter
    if (filters.seller) {
      console.log('Filtering products by seller:', filters.seller);
    }
    
    const response = await axios.get(`${baseUrl}/api/products`, { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Get product reviews
export const getProductReviews = async (productId) => {
  try {
    const baseUrl = getBaseUrl();
    const response = await axios.get(`${baseUrl}/api/reviews/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    throw error;
  }
};

// Create a product review
export const createProductReview = async (reviewData) => {
  try {
    const baseUrl = getBaseUrl();
    const response = await axios.post(`${baseUrl}/api/reviews`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error creating product review:', error);
    throw error;
  }
};

// Get supply chain events
export const getSupplyChainEvents = async (productId) => {
  try {
    const baseUrl = getBaseUrl();
    const response = await axios.get(`${baseUrl}/api/supply-chain/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching supply chain events:', error);
    throw error;
  }
};

// Create a bill
export const createBill = async (billData) => {
  try {
    const baseUrl = getBaseUrl();
    const response = await axios.post(`${baseUrl}/api/bills`, billData);
    return response.data;
  } catch (error) {
    console.error('Error creating bill:', error);
    throw error;
  }
};

// Get all bills for admin
export const getAllBills = async () => {
  try {
    const baseUrl = getBaseUrl();
    const response = await axios.get(`${baseUrl}/api/billing/bills`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all bills:', error);
    throw error;
  }
};

// Get user bills
export const getUserBills = async (userId) => {
  try {
    const baseUrl = getBaseUrl();
    const response = await axios.get(`${baseUrl}/api/users/${userId}/bills`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user bills:', error);
    throw error;
  }
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

// General HTTP methods for flexibility
export const get = async (url, config = {}) => {
  try {
    const response = await axios.get(url, config);
    return response;
  } catch (error) {
    console.error('GET request failed:', error);
    throw error;
  }
};

export const post = async (url, data, config = {}) => {
  try {
    const response = await axios.post(url, data, config);
    return response;
  } catch (error) {
    console.error('POST request failed:', error);
    throw error;
  }
};

export const patch = async (url, data, config = {}) => {
  try {
    const response = await axios.patch(url, data, config);
    return response;
  } catch (error) {
    console.error('PATCH request failed:', error);
    throw error;
  }
};

export const delete_ = async (url, config = {}) => {
  try {
    const response = await axios.delete(url, config);
    return response;
  } catch (error) {
    console.error('DELETE request failed:', error);
    throw error;
  }
};

// Create a product
export const createProduct = async (productData, token) => {
  try {
    const baseUrl = getBaseUrl();
    // Include authentication token in the request header if provided
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await axios.post(
      `${baseUrl}/api/products`, 
      productData,
      { headers }
    );
    
    return { data: response.data };
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}; 