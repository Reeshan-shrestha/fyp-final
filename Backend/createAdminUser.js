const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB for admin creation'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function createAdmin() {
  try {
    // Clear all existing users first
    await User.deleteMany({});
    console.log('Cleared all existing users');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Reeshan@1', salt);
    
    // Create admin user - using the schema fields from User.js
    const adminUser = new User({
      username: 'Reeshan',
      email: 'reeshan@admin.com',
      password: hashedPassword,
      role: 'admin',
      walletAddress: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
      isVerified: true
    });
    
    await adminUser.save();
    
    console.log('Admin user created successfully:');
    console.log('Username: Reeshan');
    console.log('Email: reeshan@admin.com');
    console.log('Password: Reeshan@1');
    
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error creating admin user:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

createAdmin(); 