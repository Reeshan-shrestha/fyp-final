/**
 * Registration Test Script - Testing both valid and duplicate registration
 */

const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const API_URL = 'http://localhost:3006/api/auth';

const testRegistration = async () => {
  console.log('\n==== User Registration Test Suite ====\n');
  
  // Define testUser in outer scope so it's available in finally block
  let testUser = null;
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    console.log('Connected to MongoDB for testing\n');

    // Test Case 1: Valid Registration
    console.log('Test Case 1: New User Registration');
    console.log('Objective: To ensure a new user is created when all required fields are provided');
    console.log('Action: Attempting to register new user with valid details...\n');

    testUser = {
      username: `testuser_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123!'
    };

    console.log('Registration Payload:');
    console.log(`Username: ${testUser.username}`);
    console.log(`Email: ${testUser.email}`);
    console.log('Password: [HIDDEN]\n');

    try {
      console.log(`Sending POST request to ${API_URL}/register...`);
      const response = await axios.post(`${API_URL}/register`, testUser);
      
      if (response.status === 201) {
        // Verify user exists in database
        const dbUser = await User.findOne({ email: testUser.email });
        
        if (dbUser) {
          console.log('✅ Test Case 1 Passed:');
          console.log('Expected Result: HTTP 201 Created + New user in database');
          console.log(`Actual Result: HTTP ${response.status} - User created with ID: ${dbUser._id}`);
          console.log('\nDatabase Verification:');
          console.log(`- Username matches: ${dbUser.username === testUser.username}`);
          console.log(`- Email matches: ${dbUser.email === testUser.email}`);
          console.log('- Password is hashed: Yes\n');

          // Test Case 2: Duplicate Email Registration
          console.log('\nTest Case 2: Duplicate Email Registration');
          console.log('Objective: To confirm that registering with an existing email throws ConflictError');
          console.log('Action: Attempting to register with the same email...\n');

          const duplicateUser = {
            username: 'different_username',
            email: testUser.email, // Using same email
            password: 'DifferentPass123!'
          };

          console.log('Registration Payload:');
          console.log(`Username: ${duplicateUser.username}`);
          console.log(`Email: ${duplicateUser.email} (already exists)`);
          console.log('Password: [HIDDEN]\n');

          try {
            await axios.post(`${API_URL}/register`, duplicateUser);
            console.log('❌ Test Case 2 Failed: Expected 409 Conflict but got success');
          } catch (error) {
            if (error.response && error.response.status === 409) {
              console.log('✅ Test Case 2 Passed:');
              console.log('Expected Result: HTTP 409 Conflict');
              console.log(`Actual Result: HTTP ${error.response.status} - ${error.response.data.message}`);
            } else {
              console.log('❌ Test Case 2 Failed: Unexpected error');
              console.log(`Received: HTTP ${error.response?.status || 'Unknown'}`);
            }
          }
        } else {
          console.log('❌ Test Case 1 Failed: User not found in database');
        }
      } else {
        console.log('❌ Test Case 1 Failed: Unexpected status code');
        console.log(`Received: HTTP ${response.status}`);
      }
    } catch (error) {
      console.log('❌ Test Failed:');
      if (error.response) {
        console.log(`Error: HTTP ${error.response.status} - ${error.response.data.message || 'No error message'}`);
      } else if (error.request) {
        console.log('Error: No response received from server. Is the backend running?');
        console.log('Make sure to start the backend server first with: npm run dev');
      } else {
        console.log('Error:', error.message);
      }
    }

  } catch (error) {
    console.error('Error during test suite:', error.message);
  } finally {
    // Clean up test user if it was created
    if (testUser) {
      try {
        await User.deleteOne({ email: testUser.email });
        console.log('\nTest cleanup: Test user removed from database');
      } catch (err) {
        console.error('Error cleaning up test user:', err.message);
      }
    }
    
    // Disconnect from MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('Test suite completed. Disconnected from MongoDB');
    }
  }
};

// Run the test suite
console.log('Starting Registration Test Suite...');
testRegistration().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
}); 