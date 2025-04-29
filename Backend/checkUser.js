const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/fyp-final');
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'seller1@example.com' });
    if (user) {
      console.log('User found:', {
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      });
    } else {
      console.log('User not found');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUser(); 