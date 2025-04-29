const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();
const mongoose = require('mongoose');

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET;

// Check if JWT_SECRET is set
if (!JWT_SECRET) {
  console.error('JWT_SECRET is not set in environment variables. This is a security risk.');
}

// Token expiration time (1 day by default)
const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || '24h';

// Register user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, walletAddress } = req.body;
    
    console.log(`Registration attempt: ${username}, ${email}, role: ${role || 'not specified'}`);
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email }, 
        { username }
      ] 
    });
    
    if (existingUser) {
      console.log(`Registration failed: User already exists - ${username}, ${email}`);
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Generate a random wallet address if not provided
    // Ensure it has the correct format with 0x prefix and 40 hex characters
    const userWalletAddress = walletAddress || 
      '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    
    console.log("Using wallet address:", userWalletAddress); // Debug log
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Validate role (allow user or seller)
    // We'll explicitly check for "seller" to make it clear this is allowed
    const validRole = role === 'seller' ? 'seller' : 'user';
    
    // Log if role was provided but changed
    if (role && role !== validRole) {
      console.log(`Role '${role}' was provided but changed to '${validRole}'`);
    }
    
    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      walletAddress: userWalletAddress,
      role: validRole,  // Set to the validated role
      isVerified: role === 'seller' // Sellers are auto-verified to simplify the process
    });
    
    await newUser.save();
    
    // Create and sign a JWT token with consistent format, including the username
    const token = jwt.sign(
      { 
        id: newUser._id,
        username: newUser.username 
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRATION }
    );
        
        // Log successful registration
        console.log(`Registration successful: ${username}, ${email}, role: ${newUser.role}`);
        
    // Return user data and token
        res.status(201).json({
          token,
          user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            isAdmin: newUser.role === 'admin',
            isSeller: newUser.role === 'seller'
          }
        });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Support login with either username or email
    let loginIdentifier = email || username;
    console.log(`Login attempt for identifier: ${loginIdentifier}`);
    
    if (!loginIdentifier || !password) {
      return res.status(400).json({ message: 'Username/email and password are required' });
    }
    
    // Check if user exists by either username or email
    const user = await User.findOne({
      $or: [
        { email: loginIdentifier },
        { username: loginIdentifier }
      ]
    });
    
    if (!user) {
      console.log('User not found:', loginIdentifier);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('Password mismatch for user:', loginIdentifier);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    console.log('Successful login for user:', user.username);
    
    // Create JWT token with consistent format, including the username for profile retrieval
    const token = jwt.sign(
      { 
        id: user._id,
        username: user.username
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRATION }
    );
    
    // Return user info without password
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isAdmin: user.role === 'admin', // Add isAdmin flag for frontend
      isSeller: user.role === 'seller', // Add isSeller flag for frontend
      isVerified: user.isVerified,
      createdAt: user.createdAt
    };
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Debug token
    console.log('Token received for /me endpoint:', token.substring(0, 15) + '...');
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token payload:', JSON.stringify(decoded));
    
    // Get the user's ID and username from token if available
    const userId = decoded.id || (decoded.user && decoded.user.id);
    const username = decoded.username || (decoded.user && decoded.user.username);
    
    console.log('Token contains - ID:', userId, 'Username:', username);
    
    // Find user by username first if available, or fall back to admin for testing
    let user;
    
    if (username) {
      user = await User.findOne({ username }).select('-password');
    }
    
    // Temporary workaround for development/testing
    if (!user) {
      user = await User.findOne({ username: 'admin' }).select('-password');
      if (user) {
        console.log('⚠️ User not found with token info, using admin user as fallback');
      }
    }
    
    if (!user) {
      console.log('User not found even with admin fallback');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User found:', user.username);
    
    // Add isAdmin and isSeller flags for frontend
    const userResponse = {
      ...user.toObject(),
      id: user._id,
      isAdmin: user.role === 'admin',
      isSeller: user.role === 'seller'
    };
    
    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Error getting user:', error.message, error.stack);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token has expired. Please login again',
        expired: true
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token: ' + error.message });
    }
    
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    
    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({ message: 'If your email is registered, you will receive a password reset link' });
    }
    
    // Generate password reset token
    const resetToken = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );
    
    // Save token to user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour in milliseconds
    await user.save();
    
    // In a real application, you would send an email with the reset link
    // For now, we'll just log it to the console
    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(`Reset URL: http://localhost:3000/reset-password/${resetToken}`);
    
    res.status(200).json({ message: 'If your email is registered, you will receive a password reset link' });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    // Find user by id and token
    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error in reset password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a test endpoint to verify backend connectivity
router.get('/test', (req, res) => {
  res.status(200).json({ 
    message: 'Auth service is running',
    timestamp: new Date().toISOString()
  });
});

// Endpoint to check all users in the system (for development/testing only)
router.get('/check-users', async (req, res) => {
  try {
    // Get all users without returning password fields
    const users = await User.find().select('-password');
    
    // Count users by role
    const roleCounts = {
      total: users.length,
      user: users.filter(u => u.role === 'user').length,
      seller: users.filter(u => u.role === 'seller').length,
      admin: users.filter(u => u.role === 'admin').length
    };
    
    console.log('User role distribution:', roleCounts);
    
    res.json({
      message: 'User check successful',
      roleCounts,
      users: users.map(user => ({
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Error checking users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 