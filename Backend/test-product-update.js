/**
 * Product Update Test Script
 */

const axios = require('axios');
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
require('dotenv').config();

const API_URL = 'http://localhost:3006/api';

// Helper function to generate a random Ethereum address
const generateRandomWalletAddress = () => {
  return '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
};

// Configure Mongoose
mongoose.set('debug', true);  // Enable debugging

async function createTestUsers() {
  // Create owner (seller1)
  const owner = new User({
    username: 'seller1',
    email: 'seller1@example.com',
    password: '$2b$10$40QypRoWHzInGp86NEM.wuZDO3hDbWB.h.Ukqpw5BYRUKnYwlbwbC', // seller123
    role: 'seller',
    isVerified: true,
    walletAddress: '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db'
  });

  // Create non-owner (seller2)
  const nonOwner = new User({
    username: 'seller2',
    email: 'seller2@example.com',
    password: '$2b$10$40QypRoWHzInGp86NEM.wuZDO3hDbWB.h.Ukqpw5BYRUKnYwlbwbC', // seller123
    role: 'seller',
    isVerified: true,
    walletAddress: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4'
  });

  await User.deleteMany({}); // Clear existing users
  await owner.save();
  await nonOwner.save();
}

const testNonOwnerUpdate = async () => {
  console.log('\n==== Product Update Authorization Test ====\n');
  
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10
    });
    console.log('Connected to MongoDB\n');

    // Create owner user
    console.log('Creating owner user...');
    const ownerUser = new User({
      username: 'owner_user',
      email: 'owner@test.com',
      password: '$2b$10$40QypRoWHzInGp86NEM.wuZDO3hDbWB.h.Ukqpw5BYRUKnYwlbwbC', // seller123
      role: 'seller',
      isVerified: true,
      walletAddress: '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db'
    });
    await ownerUser.save();
    console.log('Owner user created\n');

    // Create non-owner user
    console.log('Creating non-owner user...');
    const nonOwnerUser = new User({
      username: 'non_owner_user',
      email: 'nonowner@test.com',
      password: '$2b$10$40QypRoWHzInGp86NEM.wuZDO3hDbWB.h.Ukqpw5BYRUKnYwlbwbC', // seller123
      role: 'seller',
      isVerified: true,
      walletAddress: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4'
    });
    await nonOwnerUser.save();
    console.log('Non-owner user created\n');

    // Login as owner
    console.log('Logging in as owner...');
    const ownerLoginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'owner@test.com',
      password: 'seller123'
    });
    const ownerToken = ownerLoginResponse.data.token;
    console.log('Owner login successful\n');

    // Create a test product as owner
    console.log('Creating test product...');
    const testProduct = {
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      category: 'electronics',
      countInStock: 10,
      imageUrl: 'https://example.com/test.jpg'
    };

    const createResponse = await axios.post(`${API_URL}/products`, testProduct, {
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        'Content-Type': 'application/json'
      }
    });
    const productId = createResponse.data._id;
    console.log('Test product created\n');

    // Login as non-owner
    console.log('Logging in as non-owner...');
    const nonOwnerLoginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'nonowner@test.com',
      password: 'seller123'
    });
    const nonOwnerToken = nonOwnerLoginResponse.data.token;
    console.log('Non-owner login successful\n');

    // Attempt to update product as non-owner
    console.log('Test Case: Non-owner Update Attempt');
    console.log('Objective: To verify non-owners receive an AuthorizationError when updating');
    console.log('Action: Attempting to update product as non-owner...\n');

    try {
      await axios.patch(`${API_URL}/products/${productId}`, {
        name: 'Unauthorized Update'
      }, {
        headers: {
          Authorization: `Bearer ${nonOwnerToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Test Failed: Update succeeded when it should have been forbidden');
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log('✅ Test Passed:');
        console.log('Expected Result: HTTP 403 Forbidden with AuthorizationError');
        console.log(`Actual Result: HTTP ${error.response.status} - ${error.response.data.message}`);
      } else {
        console.log('❌ Test Failed:');
        console.log('Expected: HTTP 403 Forbidden');
        console.log(`Received: HTTP ${error.response ? error.response.status : 'Unknown'}`);
        console.log('Error details:', error.response ? error.response.data : error.message);
      }
    }

  } catch (error) {
    console.error('Error during test:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  } finally {
    // Clean up
    try {
      await User.deleteMany({ username: { $in: ['owner_user', 'non_owner_user'] } });
      await Product.deleteMany({ name: 'Test Product' });
      console.log('\nTest cleanup completed');
    } catch (err) {
      console.error('Error during cleanup:', err.message);
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Test completed. Disconnected from MongoDB');
  }
};

// Run the test
console.log('Starting Product Update Authorization Test...');
testNonOwnerUpdate().catch(error => {
  console.error('Fatal error:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}); 