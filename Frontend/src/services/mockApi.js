// Mock API service to replace actual backend calls
// This helps with development and testing when the backend is not available

// Mock orders data store
let mockOrders = [];
let mockTransactions = [];

// Generate a unique order ID
const generateOrderId = () => {
  return 'order_' + Math.random().toString(36).substr(2, 9);
};

// Create a mock order
export const createOrder = async (orderData) => {
  const newOrder = {
    _id: generateOrderId(),
    ...orderData,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  mockOrders.push(newOrder);
  
  console.log('Mock order created:', newOrder);
  
  return {
    status: 'success',
    data: newOrder
  };
};

// Record a mock blockchain transaction
export const recordBlockchainTransaction = async (orderId, txData) => {
  const transaction = {
    orderId,
    ...txData,
    status: 'confirmed',
    timestamp: new Date().toISOString()
  };
  
  mockTransactions.push(transaction);
  
  // Update the associated order
  const orderIndex = mockOrders.findIndex(order => order._id === orderId);
  if (orderIndex >= 0) {
    mockOrders[orderIndex] = {
      ...mockOrders[orderIndex],
      blockchainTxId: txData.txId,
      status: 'completed'
    };
  }
  
  console.log('Mock blockchain transaction recorded:', transaction);
  
  return {
    status: 'success',
    data: transaction
  };
};

// Get all mock orders
export const getOrders = async (userId) => {
  if (userId) {
    return mockOrders.filter(order => order.userId === userId);
  }
  return mockOrders;
};

// Get a mock order by ID
export const getOrderById = async (orderId) => {
  const order = mockOrders.find(order => order._id === orderId);
  if (!order) {
    throw new Error('Order not found');
  }
  return order;
};

// For debugging
export const getMockDb = () => {
  return { orders: mockOrders, transactions: mockTransactions };
}; 