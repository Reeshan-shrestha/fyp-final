/**
 * Script to check all users in the database
 * Run: node scripts/checkUsers.js
 */

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB and retrieve all users
const checkUsers = async () => {
  try {
    // Get MongoDB URI from environment or use default
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/VerityDB';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find all users without returning password fields
    const users = await User.find().select('-password');
    
    // Count users by role
    const roleCounts = {
      total: users.length,
      user: users.filter(u => u.role === 'user').length,
      seller: users.filter(u => u.role === 'seller').length,
      admin: users.filter(u => u.role === 'admin').length
    };
    
    console.log('\nUser role distribution:');
    console.log(JSON.stringify(roleCounts, null, 2));
    
    console.log('\nAll users in the database:');
    users.forEach(user => {
      console.log(`\nUsername: ${user.username}`);
      console.log(`Email: ${user.email || 'Not set'}`);
      console.log(`Role: ${user.role}`);
      console.log(`Wallet: ${user.walletAddress || 'Not set'}`);
      console.log(`Verified: ${user.isVerified}`);
      console.log(`Created: ${user.createdAt}`);
    });
    
    // Close connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking users:', error);
    process.exit(1);
  }
};

// Run the script
checkUsers(); 