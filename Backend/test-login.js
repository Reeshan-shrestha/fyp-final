/**
 * Simple Login Test Script
 */

const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const API_URL = 'http://localhost:3006/api/auth';

const testLogin = async () => {
  try {
    // Connect to MongoDB first
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    console.log('Connected to MongoDB for direct testing');
    
    console.log('Attempting login with admin user...');
    
    // Login
    const loginResponse = await axios.post(`${API_URL}/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    if (loginResponse.data && loginResponse.data.token) {
      console.log('Login successful!');
      console.log(`Token received: ${loginResponse.data.token.substring(0, 15)}...`);
      
      // Get user ID
      const userId = loginResponse.data.user._id || loginResponse.data.user.id;
      console.log('User ID from login response:', userId);
      
      // Try to find user directly in MongoDB to confirm it exists
      const user = await User.findOne({ username: 'admin' });
      if (user) {
        console.log('Found user directly in database:');
        console.log('ID:', user._id.toString(), '(type:', typeof user._id, ')');
        console.log('Username:', user.username);
        
        // Compare IDs
        console.log('ID comparison:');
        console.log('From Login API:', userId);
        console.log('From Database:', user._id.toString());
        console.log('IDs match:', userId === user._id.toString());
        
        // Try explicit ObjectId conversion to debug
        try {
          const objectId = new mongoose.Types.ObjectId(userId);
          console.log('Conversion to ObjectId successful!', objectId);
          
          // Try finding with the explicit ObjectId
          const userWithObjectId = await User.findById(objectId);
          if (userWithObjectId) {
            console.log('Found user with explicit ObjectId conversion:', userWithObjectId.username);
          } else {
            console.log('User not found with explicit ObjectId');
          }
        } catch (err) {
          console.error('Cannot convert ID to ObjectId:', err.message);
        }
      } else {
        console.log('Could not find admin user directly in database!');
      }
      
      // Try to get user info
      try {
        const userResponse = await axios.get(`${API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${loginResponse.data.token}`
          }
        });
        
        console.log('User info retrieved successfully:');
        console.log(JSON.stringify(userResponse.data, null, 2));
      } catch (userError) {
        console.error('Failed to get user info:', userError.response?.data || userError.message);
      }
    } else {
      console.error('Login failed - invalid response:', loginResponse.data);
    }
  } catch (error) {
    console.error('Error during test:', error.response?.data || error.message);
  } finally {
    // Disconnect from MongoDB
    try {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    } catch (err) {
      console.error('Error disconnecting from MongoDB:', err);
    }
  }
};

testLogin().catch(console.error); 