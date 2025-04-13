/**
 * Script to create a seller account
 * Run: node scripts/createSeller.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB and create seller account
const createSellerAccount = async () => {
  try {
    // Get MongoDB URI from environment or use default
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/VerityDB';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if seller already exists
    const username = 'seller1';
    const existingUser = await User.findOne({ username });
    
    if (existingUser) {
      console.log(`User "${username}" already exists with role: ${existingUser.role}`);
      
      // If user exists but is not a seller, update role
      if (existingUser.role !== 'seller') {
        existingUser.role = 'seller';
        await existingUser.save();
        console.log(`Updated ${username}'s role to seller`);
      }
      
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
      process.exit(0);
    }
    
    // Create seller account with credentials
    const password = 'seller123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generate wallet address
    const walletAddress = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    
    // Create new seller
    const newSeller = new User({
      username: 'seller1',
      email: 'seller1@example.com',
      password: hashedPassword,
      role: 'seller',
      walletAddress,
      isVerified: true,
      createdAt: new Date()
    });
    
    await newSeller.save();
    
    console.log(`Successfully created seller account:`);
    console.log(`Username: ${newSeller.username}`);
    console.log(`Email: ${newSeller.email}`);
    console.log(`Role: ${newSeller.role}`);
    console.log(`Wallet: ${newSeller.walletAddress}`);
    console.log(`Password: ${password} (clear text not stored in DB)`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating seller account:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
createSellerAccount(); 