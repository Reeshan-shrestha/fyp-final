const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./Backend/models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chainbazzar';

async function resetPasswords() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Reset user1 password
    const user1 = await User.findOne({ username: 'user1' });
    if (user1) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('user123', salt);
      user1.password = hashedPassword;
      await user1.save();
      console.log('Reset password for user1 to "user123"');
    } else {
      console.log('User "user1" not found');
    }
    
    // Reset TechGadgets password
    const techGadgets = await User.findOne({ username: 'TechGadgets' });
    if (techGadgets) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('seller123', salt);
      techGadgets.password = hashedPassword;
      await techGadgets.save();
      console.log('Reset password for TechGadgets to "seller123"');
    } else {
      console.log('User "TechGadgets" not found');
    }
    
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error resetting passwords:', error);
    process.exit(1);
  }
}

resetPasswords(); 