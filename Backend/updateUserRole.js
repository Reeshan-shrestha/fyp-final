const mongoose = require('mongoose');
const User = require('./models/User');

async function updateUserRole() {
  try {
    await mongoose.connect('mongodb://localhost:27017/fyp-final');
    console.log('Connected to MongoDB');

    const result = await User.updateOne(
      { email: 'seller1@example.com' },
      { $set: { role: 'seller' } }
    );

    if (result.modifiedCount > 0) {
      console.log('User role updated successfully');
    } else {
      console.log('No user was updated');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

updateUserRole(); 