/**
 * Login Test Script - Testing both valid and invalid credentials
 */

const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const API_URL = 'http://localhost:3006/api/auth';

const testLogin = async () => {
  console.log('\n==== Authentication Test Suite ====\n');
  
  try {
    // Connect to MongoDB first
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    console.log('Connected to MongoDB for testing\n');

    // Test Case 1: Invalid Credentials
    console.log('Test Case 1: Invalid Credentials');
    console.log('Objective: To confirm that invalid credentials throw an UnauthorizedError');
    console.log('Action: Attempting login with incorrect password...');
    
    try {
      await axios.post(`${API_URL}/login`, {
        username: 'admin',
        password: 'wrongpassword123'
      });
      console.log('❌ Test Failed: Expected 401 error but got success');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Test Passed:');
        console.log('Expected Result: HTTP 401 Unauthorized');
        console.log(`Actual Result: HTTP ${error.response.status} - ${error.response.data.message}`);
      } else {
        console.log('❌ Test Failed: Unexpected error');
        console.log('Error:', error.message);
      }
    }

    // Test Case 2: Valid Credentials
    console.log('\nTest Case 2: Valid Credentials');
    console.log('Objective: To verify that valid credentials produce a signed JWT');
    console.log('Action: Attempting login with correct credentials...');
    
    try {
      const loginResponse = await axios.post(`${API_URL}/login`, {
        username: 'admin',
        password: 'admin123'
      });
      
      if (loginResponse.data && loginResponse.data.token) {
        console.log('✅ Test Passed:');
        console.log('Expected Result: HTTP 200 OK with JWT token');
        console.log(`Actual Result: HTTP 200 - Token received: ${loginResponse.data.token.substring(0, 15)}...`);
      }
    } catch (error) {
      console.log('❌ Test Failed:');
      console.log('Error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Error during test suite:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nTest suite completed. Disconnected from MongoDB');
  }
};

// Run the test suite
console.log('Starting Authentication Test Suite...');
testLogin().catch(console.error); 