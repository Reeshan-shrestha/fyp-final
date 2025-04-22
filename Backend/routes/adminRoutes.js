const express = require('express');
const router = express.Router();
const { isAdmin, authenticate } = require('../middleware/authMiddleware');
const { spawn } = require('child_process');
const path = require('path');

// Route to distribute products to sellers (admin only)
router.post('/distribute-products', authenticate, isAdmin, async (req, res) => {
  try {
    // Use child_process to run the distribution script
    const scriptPath = path.join(__dirname, '../scripts/distributeProductsToSellers.js');
    
    const process = spawn('node', [scriptPath]);
    
    let output = '';
    let errorOutput = '';
    
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        return res.status(200).json({ 
          success: true, 
          message: 'Products distributed successfully', 
          details: output 
        });
      } else {
        return res.status(500).json({ 
          success: false, 
          message: 'Error running distribution script', 
          error: errorOutput 
        });
      }
    });
  } catch (error) {
    console.error('Error distributing products:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error distributing products', 
      error: error.message 
    });
  }
});

module.exports = router; 