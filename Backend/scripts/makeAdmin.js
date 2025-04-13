/**
 * Script to make a specific user an admin
 * Run: node scripts/makeAdmin.js
 */

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
const updateUserToAdmin = async () => {
  try {
    // Get MongoDB URI from environment or use default
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/VerityDB';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find user by username
    const username = 'Reeshan';
    const user = await User.findOne({ username });
    
    if (!user) {
      console.error(`User "${username}" not found in the database`);
      process.exit(1);
    }
    
    // Store original role for logging
    const originalRole = user.role;
    
    // Update user role to admin
    user.role = 'admin';
    await user.save();
    
    console.log(`Successfully updated user "${username}" role from "${originalRole}" to "admin"`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating user role:', error);
    process.exit(1);
  }
};

// Run the script
updateUserToAdmin(); 