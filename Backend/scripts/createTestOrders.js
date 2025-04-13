/**
 * Script to create test orders for the admin dashboard
 * Run: node scripts/createTestOrders.js
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
require('dotenv').config();

// Mock product data
const mockProducts = [
  { id: 'product1', name: 'Smartphone', price: 799.99 },
  { id: 'product2', name: 'Laptop', price: 1299.99 },
  { id: 'product3', name: 'Headphones', price: 249.99 },
  { id: 'product4', name: 'Smartwatch', price: 349.99 },
  { id: 'product5', name: 'Tablet', price: 499.99 }
];

// Random status generator
const getRandomStatus = () => {
  const statuses = ['pending', 'processing', 'completed', 'cancelled'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

// Random date within the last 30 days
const getRandomDate = () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return new Date(thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime()));
};

// Create random orders
const createTestOrders = async () => {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/VerityDB';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find().select('_id');
    
    if (users.length === 0) {
      console.error('No users found in the database. Please create users first.');
      process.exit(1);
    }

    console.log(`Found ${users.length} users. Creating test orders...`);

    // Create random orders
    const numOrders = 10; // Number of test orders to create
    const orders = [];

    for (let i = 0; i < numOrders; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)];
      const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 items
      
      const order = new Order({
        userId: randomUser._id,
        itemId: randomProduct.id,
        quantity: quantity,
        price: randomProduct.price,
        orderDate: getRandomDate(),
        status: getRandomStatus(),
        blockchainVerified: Math.random() > 0.7, // 30% chance of being verified
        blockchainTxId: Math.random() > 0.7 ? '0x' + Math.random().toString(16).substr(2, 40) : null,
        shippingAddress: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country'
        }
      });

      orders.push(order);
    }

    // Save all orders
    const savedOrders = await Order.insertMany(orders);
    console.log(`Successfully created ${savedOrders.length} test orders`);

    // Print a summary
    const ordersByStatus = {
      pending: savedOrders.filter(o => o.status === 'pending').length,
      processing: savedOrders.filter(o => o.status === 'processing').length,
      completed: savedOrders.filter(o => o.status === 'completed').length,
      cancelled: savedOrders.filter(o => o.status === 'cancelled').length
    };

    console.log('\nOrder status summary:');
    console.log(ordersByStatus);

    const totalRevenue = savedOrders.reduce((sum, order) => sum + (order.price * order.quantity), 0);
    console.log(`\nTotal test revenue: $${totalRevenue.toFixed(2)}`);

    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error creating test orders:', error);
    process.exit(1);
  }
};

// Run the script
createTestOrders(); 