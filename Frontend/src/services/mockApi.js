// Mock API service to replace actual backend calls
// This helps with development and testing when the backend is not available

// Mock orders data store
let mockOrders = [];
let mockTransactions = [];
let mockReviews = [
  {
    _id: 'review1',
    productId: 'prod1',
    userId: 'user1',
    userName: 'John Doe',
    userType: 'customer',
    rating: 4.5,
    title: 'Great Product',
    comment: 'This is an excellent product, very satisfied with the quality.',
    verified: true,
    purchaseVerified: true,
    timestamp: '2023-10-15T14:30:00.000Z'
  },
  {
    _id: 'review2',
    productId: 'prod1',
    userId: 'user2',
    userName: 'Jane Smith',
    userType: 'seller',
    rating: 5,
    title: 'Fantastic Quality',
    comment: 'One of our bestsellers, customers love it!',
    verified: true,
    purchaseVerified: false,
    timestamp: '2023-10-20T09:15:00.000Z'
  }
];
let mockBills = [];

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

// Get mock product reviews
export const getProductReviews = async (productId) => {
  const filteredReviews = mockReviews.filter(review => review.productId === productId);
  return {
    status: 'success',
    reviews: filteredReviews
  };
};

// Create a mock product review
export const createProductReview = async (reviewData) => {
  const newReview = {
    _id: 'review_' + Math.random().toString(36).substr(2, 9),
    ...reviewData,
    userName: 'Mock User',
    verified: false,
    purchaseVerified: Math.random() > 0.5,
    timestamp: new Date().toISOString()
  };
  
  mockReviews.push(newReview);
  
  console.log('Mock review created:', newReview);
  
  return {
    status: 'success',
    data: newReview
  };
};

// Get supply chain events
export const getSupplyChainEvents = async (productId) => {
  // Generate deterministic events based on product ID
  const events = [
    {
      eventType: 'MANUFACTURED',
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      location: 'Factory, Shanghai, China',
      details: 'Product manufactured and quality checked',
      transactionHash: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
    },
    {
      eventType: 'PACKAGED',
      timestamp: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(), // 28 days ago
      location: 'Distribution Center, Shanghai, China',
      details: 'Product packaged for international shipping',
      transactionHash: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
    },
    {
      eventType: 'SHIPPED',
      timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
      location: 'Port of Shanghai, China',
      details: 'Product shipped via sea freight',
      transactionHash: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
    },
    {
      eventType: 'STORED',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      location: 'Central Warehouse, San Francisco, USA',
      details: 'Product received at central warehouse',
      transactionHash: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
    },
    {
      eventType: 'RETAIL',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      location: 'Retail Store, San Francisco, USA',
      details: 'Product available for purchase',
      transactionHash: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
    }
  ];
  
  return {
    status: 'success',
    events: events
  };
};

// Create a mock bill
export const createBill = async (billData) => {
  const newBill = {
    _id: 'bill_' + Math.random().toString(36).substr(2, 9),
    ...billData,
    createdAt: new Date().toISOString(),
    invoiceNumber: 'INV-' + Date.now().toString().substr(-6)
  };
  
  mockBills.push(newBill);
  
  console.log('Mock bill created:', newBill);
  
  return {
    status: 'success',
    data: newBill
  };
};

// Get all bills (for admin)
export const getAllBills = async () => {
  return {
    status: 'success',
    data: mockBills
  };
};

// Get user bills
export const getUserBills = async (userId) => {
  const userBills = mockBills.filter(bill => bill.userId === userId);
  return {
    status: 'success',
    data: userBills
  };
};

// For debugging
export const getMockDb = () => {
  return { 
    orders: mockOrders, 
    transactions: mockTransactions,
    reviews: mockReviews,
    bills: mockBills
  };
}; 