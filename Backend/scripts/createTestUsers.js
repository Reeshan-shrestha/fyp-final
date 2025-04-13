const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const testUsers = [
  {
    username: 'testuser1',
    email: 'test1@example.com',
    password: 'password123',
    role: 'user',
    walletAddress: '0x1234567890123456789012345678901234567890',
    isVerified: true
  },
  {
    username: 'testuser2',
    email: 'test2@example.com',
    password: 'password123',
    role: 'user',
    walletAddress: '0x2345678901234567890123456789012345678901',
    isVerified: false
  },
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    walletAddress: '0x3456789012345678901234567890123456789012',
    isVerified: true
  }
];

const createTestUsers = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/VerityDB');
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create new test users
    for (const user of testUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await User.create({
        ...user,
        password: hashedPassword
      });
    }

    console.log('Test users created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
};

createTestUsers(); 