const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const blockchainInventoryService = require('../services/blockchainInventoryService');

// Middleware to check blockchain connection
const checkBlockchainConnection = async (req, res, next) => {
  const isConnected = await blockchainInventoryService.isConnected();
  if (!isConnected) {
    return res.status(503).json({ error: 'Blockchain service unavailable' });
  }
  next();
};

// Get current stock for a product from blockchain
router.get('/:productId/stock', checkBlockchainConnection, async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Check if product exists in database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Get stock from blockchain
    const stockResult = await blockchainInventoryService.getProductStock(productId);
    
    if (!stockResult.success) {
      return res.status(404).json({
        error: 'Product stock not found on blockchain',
        details: stockResult.error
      });
    }
    
    res.json({
      productId,
      productName: product.name,
      stock: stockResult.stock,
      fromBlockchain: true
    });
  } catch (error) {
    console.error('Error fetching product stock from blockchain:', error);
    res.status(500).json({ error: 'Error fetching product stock' });
  }
});

// Add product to blockchain inventory
router.post('/', checkBlockchainConnection, async (req, res) => {
  try {
    const { productId, name, initialStock } = req.body;
    
    if (!productId || !name || initialStock === undefined) {
      return res.status(400).json({ error: 'Missing required fields: productId, name, initialStock' });
    }
    
    // Check if product exists in database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found in database' });
    }
    
    // Add product to blockchain inventory
    const result = await blockchainInventoryService.addProductToBlockchain(
      productId,
      name,
      initialStock
    );
    
    if (!result.success) {
      return res.status(400).json({
        error: 'Failed to add product to blockchain inventory',
        details: result.error
      });
    }
    
    // Update product in database to reflect on-chain inventory
    product.countInStock = initialStock;
    product.blockchainManaged = true;
    product.blockchainTxHash = result.transactionHash;
    await product.save();
    
    res.status(201).json({
      success: true,
      productId,
      productName: name,
      initialStock,
      transactionHash: result.transactionHash
    });
  } catch (error) {
    console.error('Error adding product to blockchain inventory:', error);
    res.status(500).json({ error: 'Error adding product to blockchain inventory' });
  }
});

// Update stock in blockchain inventory
router.patch('/:productId/stock', checkBlockchainConnection, async (req, res) => {
  try {
    const { productId } = req.params;
    const { newStock } = req.body;
    
    if (newStock === undefined || isNaN(parseInt(newStock))) {
      return res.status(400).json({ error: 'Missing or invalid newStock value' });
    }
    
    // Check if product exists in database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Update stock in blockchain
    const result = await blockchainInventoryService.updateProductStock(
      productId,
      parseInt(newStock)
    );
    
    if (!result.success) {
      return res.status(400).json({
        error: 'Failed to update stock in blockchain',
        details: result.error
      });
    }
    
    // Update product in database
    product.countInStock = parseInt(newStock);
    product.blockchainManaged = true;
    product.blockchainTxHash = result.transactionHash;
    await product.save();
    
    res.json({
      success: true,
      productId,
      productName: product.name,
      oldStock: product.countInStock,
      newStock: parseInt(newStock),
      transactionHash: result.transactionHash
    });
  } catch (error) {
    console.error('Error updating stock in blockchain:', error);
    res.status(500).json({ error: 'Error updating stock in blockchain' });
  }
});

// Reserve stock during checkout
router.post('/:productId/reserve', checkBlockchainConnection, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
      return res.status(400).json({ error: 'Missing or invalid quantity value' });
    }
    
    // Check if product exists in database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Reserve stock in blockchain
    const result = await blockchainInventoryService.reserveProductStock(
      productId,
      parseInt(quantity)
    );
    
    if (!result.success) {
      // Check if error is due to insufficient stock
      if (result.error.includes('Insufficient stock')) {
        return res.status(400).json({
          error: 'Insufficient stock',
          available: await blockchainInventoryService.getProductStock(productId).then(r => r.stock || 0),
          requested: parseInt(quantity)
        });
      }
      
      return res.status(400).json({
        error: 'Failed to reserve stock in blockchain',
        details: result.error
      });
    }
    
    // Get updated stock from blockchain
    const updatedStock = await blockchainInventoryService.getProductStock(productId);
    
    // Update product in database
    product.countInStock = updatedStock.stock;
    await product.save();
    
    res.json({
      success: true,
      productId,
      productName: product.name,
      quantity: parseInt(quantity),
      remainingStock: updatedStock.stock,
      transactionHash: result.transactionHash
    });
  } catch (error) {
    console.error('Error reserving stock in blockchain:', error);
    res.status(500).json({ error: 'Error reserving stock in blockchain' });
  }
});

// Sync database stock with blockchain
router.post('/:productId/sync', checkBlockchainConnection, async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Check if product exists in database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Get stock from blockchain
    const stockResult = await blockchainInventoryService.getProductStock(productId);
    
    if (!stockResult.success) {
      return res.status(404).json({
        error: 'Product stock not found on blockchain',
        details: stockResult.error
      });
    }
    
    // Update product in database
    const previousStock = product.countInStock;
    product.countInStock = stockResult.stock;
    product.blockchainManaged = true;
    await product.save();
    
    res.json({
      success: true,
      productId,
      productName: product.name,
      previousStock,
      currentStock: stockResult.stock,
      syncedFromBlockchain: true
    });
  } catch (error) {
    console.error('Error syncing product stock with blockchain:', error);
    res.status(500).json({ error: 'Error syncing product stock with blockchain' });
  }
});

module.exports = router; 