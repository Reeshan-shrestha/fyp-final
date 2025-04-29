const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

// Set up test environment variables
process.env.JWT_SECRET = 'test-jwt-secret';

// Mock the blockchain service
jest.mock('../services/blockchainInventoryService', () => ({
  reserveProductStock: jest.fn().mockResolvedValue({
    success: true,
    transactionHash: '0x1234567890'
  }),
  getProductStock: jest.fn().mockResolvedValue(100),
  isConnected: jest.fn().mockResolvedValue(true)
}));

// Create a mock auth middleware
const mockAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Mock the auth middleware module
jest.mock('../middleware/auth', () => ({
  auth: (req, res, next) => mockAuth(req, res, next)
}));

let mongoServer;
let app;
let testUser;
let testProduct;
let authToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create Express app
  app = express();
  app.use(express.json());
  app.use(mockAuth);
  app.use('/api/orders', require('../routes/orders'));
});

beforeEach(async () => {
  // Clear database collections
  await Promise.all([
    Product.deleteMany({}),
    User.deleteMany({}),
    Order.deleteMany({})
  ]);

  // Create test user
  testUser = await User.create({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    walletAddress: '0x' + '1'.repeat(40)
  });

  // Generate auth token
  authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET);

  // Create test product
  testProduct = await Product.create({
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    countInStock: 10,
    blockchainManaged: true,
    status: 'active',
    category: 'electronics',
    imageUrl: 'https://example.com/test-image.jpg',
    seller: testUser._id.toString()
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Order Creation', () => {
  test('placing order with sufficient stock returns txHash', async () => {
    const orderData = {
      items: [{
        product: testProduct._id,
        quantity: 2,
        price: testProduct.price
      }],
      totalAmount: testProduct.price * 2,
      shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'Test Country'
      },
      paymentMethod: 'credit_card'
    };

    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send(orderData);

    expect(response.status).toBe(201);
    expect(response.body.order).toBeDefined();
    expect(response.body.message).toBe('Order created successfully');

    // Verify product stock was updated
    const updatedProduct = await Product.findById(testProduct._id);
    expect(updatedProduct.countInStock).toBe(8);
    expect(updatedProduct.blockchainTxHash).toBe('0x1234567890');
    expect(updatedProduct.stockHistory).toHaveLength(1);
    expect(updatedProduct.stockHistory[0].previousStock).toBe(10);
    expect(updatedProduct.stockHistory[0].newStock).toBe(8);
  });
});

describe('Order History', () => {
  test('should retrieve all orders for a user', async () => {
    // Create multiple test orders for the user
    const orderData1 = {
      user: testUser._id,
      items: [{
        product: testProduct._id,
        quantity: 2,
        price: testProduct.price
      }],
      totalAmount: testProduct.price * 2,
      shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'Test Country'
      },
      paymentMethod: 'credit_card',
      status: 'delivered'
    };

    const orderData2 = {
      user: testUser._id,
      items: [{
        product: testProduct._id,
        quantity: 1,
        price: testProduct.price
      }],
      totalAmount: testProduct.price,
      shippingAddress: {
        street: '456 Test Ave',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'Test Country'
      },
      paymentMethod: 'credit_card',
      status: 'pending'
    };

    // Create the orders directly in the database with a delay between them
    const order1 = await Order.create(orderData1);
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
    const order2 = await Order.create(orderData2);

    // Generate JWT token for authentication
    const token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET);

    // Make request to get order history
    const response = await request(app)
      .get('/api/orders/myorders')
      .set('Authorization', `Bearer ${token}`);

    // Assertions
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    
    // Verify order details
    const orders = response.body;
    expect(orders[0].user).toBe(testUser._id.toString());
    expect(orders[0].items[0].product.name).toBe('Test Product');
    expect(orders[1].user).toBe(testUser._id.toString());
    expect(orders[1].items[0].product.name).toBe('Test Product');
    
    // Verify orders are sorted by creation date (newest first)
    const firstOrderDate = new Date(orders[0].createdAt).getTime();
    const secondOrderDate = new Date(orders[1].createdAt).getTime();
    expect(firstOrderDate).toBeGreaterThan(secondOrderDate);
  });
});

describe('Order Cancellation', () => {
  test('should successfully cancel a pending order', async () => {
    // Create a test order in pending status
    const orderData = {
      user: testUser._id,
      items: [{
        product: testProduct._id,
        quantity: 1,
        price: testProduct.price
      }],
      totalAmount: testProduct.price,
      shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'Test Country'
      },
      paymentMethod: 'credit_card',
      status: 'pending'
    };

    // Create the order
    const order = await Order.create(orderData);

    // Generate JWT token for authentication
    const token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET);

    // Record initial product stock
    const initialStock = testProduct.countInStock;

    // Attempt to cancel the order
    const response = await request(app)
      .patch(`/api/orders/${order._id}/cancel`)
      .set('Authorization', `Bearer ${token}`);

    // Verify response
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Order cancelled successfully');
    expect(response.body.order.status).toBe('cancelled');

    // Verify order status in database
    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder.status).toBe('cancelled');

    // Verify product stock was restored
    const updatedProduct = await Product.findById(testProduct._id);
    expect(updatedProduct.countInStock).toBe(initialStock + orderData.items[0].quantity);

    // Verify status history was updated
    expect(updatedOrder.statusHistory).toHaveLength(2); // Initial 'pending' + 'cancelled'
    expect(updatedOrder.statusHistory[1].status).toBe('cancelled');
  });

  test('should throw InvalidOperationError when cancelling shipped order', async () => {
    // Create a test order that's already shipped
    const orderData = {
      user: testUser._id,
      items: [{
        product: testProduct._id,
        quantity: 1,
        price: testProduct.price
      }],
      totalAmount: testProduct.price,
      shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'Test Country'
      },
      paymentMethod: 'credit_card',
      status: 'shipped',
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(Date.now() - 2000),
        notes: 'Order created'
      }, {
        status: 'processing',
        timestamp: new Date(Date.now() - 1000),
        notes: 'Order processing'
      }, {
        status: 'shipped',
        timestamp: new Date(),
        notes: 'Order shipped'
      }]
    };

    // Create the order
    const order = await Order.create(orderData);

    // Generate JWT token for authentication
    const token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET);

    // Record initial product stock
    const initialStock = testProduct.countInStock;

    // Attempt to cancel the shipped order
    const response = await request(app)
      .patch(`/api/orders/${order._id}/cancel`)
      .set('Authorization', `Bearer ${token}`);

    // Verify response indicates correct error
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Cannot cancel order in current status',
      currentStatus: 'shipped'
    });

    // Verify order status remains unchanged
    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder.status).toBe('shipped');
    
    // Verify status history
    expect(updatedOrder.statusHistory).toHaveLength(4); // Account for auto-added entry
    expect(updatedOrder.statusHistory[0].status).toBe('pending');
    expect(updatedOrder.statusHistory[1].status).toBe('processing');
    expect(updatedOrder.statusHistory[2].status).toBe('shipped');
    expect(updatedOrder.statusHistory[3].status).toBe('shipped');

    // Verify product stock remains unchanged
    const updatedProduct = await Product.findById(testProduct._id);
    expect(updatedProduct.countInStock).toBe(initialStock);
  });
}); 