const express = require('express');
const router = express.Router();
const { isAdmin, authenticate } = require('../middleware/authMiddleware');

// Add other admin routes here as needed

module.exports = router; 