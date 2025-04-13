const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

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
    const { username, email, password, role } = req.body;
    
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
    const walletAddress = req.body.walletAddress || 
      '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    
    console.log("Using wallet address:", walletAddress); // Debug log
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Validate role (only allow user or seller)
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
      walletAddress,
      role: validRole,  // Set to the validated role
      isVerified: false
    });
    
    // Log the user object before saving
    console.log('Creating user with data:', {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      walletAddress: newUser.walletAddress
    });
    
    await newUser.save();
    
    // Verify user was saved correctly by retrieving from database
    const savedUser = await User.findOne({ username });
    console.log('User saved in database with role:', savedUser.role);
    
    // Create JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRATION }
    );
    
    // Return user info without password
    const userResponse = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      isVerified: newUser.isVerified,
      createdAt: newUser.createdAt
    };
    
    // Log successful registration with role
    console.log(`User registered successfully as ${newUser.role}: ${username}`);
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt for username:', username);
    
    // Check if user exists
    const user = await User.findOne({ username });
    
    if (!user) {
      console.log('User not found:', username);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('Password mismatch for user:', username);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    console.log('Successful login for user:', username);
    
    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
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
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Add isAdmin and isSeller flags for frontend
    const userResponse = {
      ...user.toObject(),
      isAdmin: user.role === 'admin',
      isSeller: user.role === 'seller'
    };
    
    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Simple API test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Auth API is working' });
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