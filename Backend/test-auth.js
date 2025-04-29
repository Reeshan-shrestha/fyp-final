/**
 * Authentication System Test Script
 * 
 * This script tests the basic authentication functionality.
 * Run with: node test-auth.js
 */

const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const API_URL = 'http://localhost:3006/api/auth';

const testAuth = async () => {
  console.log('==== Authentication System Test ====');
  
  try {
    // Connect to MongoDB for direct verification
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    console.log('Connected to MongoDB for testing');
    
    // Test backend connectivity
    console.log('\n1. Testing backend connectivity...');
    const testResponse = await axios.get(`${API_URL}/test`);
    console.log(`✅ Backend is accessible: ${testResponse.data.message} at ${testResponse.data.timestamp}`);
    
    // Test registration
    console.log('\n2. Testing user registration...');
    const testUser = {
      username: `testuser_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: 'Password123!'
    };
    
    console.log(`Registering user: ${testUser.username} (${testUser.email})`);
    
    try {
      const registerResponse = await axios.post(`${API_URL}/register`, testUser);
      console.log('✅ Registration successful');
      console.log(`User created with ID: ${registerResponse.data.user.id || registerResponse.data.user._id}`);
      console.log(`Auth token received: ${registerResponse.data.token.substring(0, 15)}...`);
      
      // Store the user ID
      const userId = registerResponse.data.user.id || registerResponse.data.user._id;
      
      // Directly check if user exists in MongoDB
      console.log('\nDirectly checking MongoDB for user...');
      const userDocument = await User.findById(userId);
      
      if (userDocument) {
        console.log(`✅ User found in database: ${userDocument.username}`);
      } else {
        console.log(`❌ User not found in database with ID: ${userId}`);
        console.log('This suggests a MongoDB ObjectID format issue');
      }
      
      // Test login with username
      console.log('\n3. Testing login with username...');
      const usernameLoginResponse = await axios.post(`${API_URL}/login`, {
        username: testUser.username,
        password: testUser.password
      });
      console.log('✅ Username login successful');
      console.log(`Username login token: ${usernameLoginResponse.data.token.substring(0, 15)}...`);
      
      // Test login with email
      console.log('\n4. Testing login with email...');
      const emailLoginResponse = await axios.post(`${API_URL}/login`, {
        email: testUser.email,
        password: testUser.password
      });
      console.log('✅ Email login successful');
      console.log(`Email login token: ${emailLoginResponse.data.token.substring(0, 15)}...`);
      
      // Decode token for debugging
      const tokenParts = registerResponse.data.token.split('.');
      const decodedPayload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString('utf8'));
      console.log('\n5. Testing current user API...');
      console.log('Decoded token payload:', decodedPayload);
      
      // Extract user ID from token
      const tokenUserId = decodedPayload.id || (decodedPayload.user && decodedPayload.user.id);
      
      // Log ids for comparison
      console.log('\nComparing IDs:');
      console.log('- ID from registration response:', userId);
      console.log('- ID from token payload:', tokenUserId);
      
      try {
        const userResponse = await axios.get(`${API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${registerResponse.data.token}`
          }
        });
        console.log('✅ Current user API successful');
        console.log(`Retrieved user: ${userResponse.data.username} (${userResponse.data.email})`);
      } catch (error) {
        console.error('❌ Current user API failed:', error.response?.data || error.message);
        console.error('Response status:', error.response?.status);
        console.error('Response headers:', error.response?.headers);
      }
      
      console.log('\n✅ ALL TESTS PASSED! Authentication system is working correctly.');
      
    } catch (error) {
      console.error('❌ Registration/login test failed:', error.response?.data || error.message);
      console.log('Check that the backend is running and MongoDB is accessible');
    }
    
  } catch (error) {
    console.error('❌ Backend connectivity test failed:', error.message);
    console.log('Check that the backend server is running on port 3006');
  } finally {
    try {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    } catch (err) {
      console.error('Error disconnecting from MongoDB:', err);
    }
  }
};

// Run the tests
testAuth().catch(console.error); 