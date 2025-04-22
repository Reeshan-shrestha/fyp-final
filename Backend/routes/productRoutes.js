const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Get all products - with filtering options including seller filter
router.get('/', async (req, res) => {
  try {
    const filters = {};
    
    // Process filter parameters
    if (req.query.category && req.query.category !== 'all') {
      filters.category = req.query.category;
    }
    
    if (req.query.verifiedOnly === 'true') {
      filters.verified = true;
    }
    
    // Seller filtering - this is important for showing only one seller's products
    if (req.query.seller || req.query.sellerId || req.query.sellerName) {
      // This is an OR query to find products by any of the seller identifiers
      const sellerFilters = [];
      
      // Add seller filter if provided
      if (req.query.seller) {
        console.log(`Filtering by seller name: ${req.query.seller}`);
        sellerFilters.push({ seller: req.query.seller });
      }
      
      // Add sellerId filter if provided
      if (req.query.sellerId) {
        console.log(`Filtering by seller ID: ${req.query.sellerId}`);
        sellerFilters.push({ sellerId: req.query.sellerId });
      }
      
      // Add sellerName filter if provided
      if (req.query.sellerName) {
        console.log(`Filtering by seller name: ${req.query.sellerName}`);
        sellerFilters.push({ sellerName: req.query.sellerName });
      }
      
      // Apply OR filter to find products matching any of the criteria
      if (sellerFilters.length > 0) {
        filters.$or = sellerFilters;
      }
      
      console.log('Filtering products with criteria:', filters);
    }
    
    // Perform the database query with filters
    let query = Product.find(filters);
    
    // Apply sorting
    if (req.query.sortBy) {
      const sortOptions = {};
      
      switch (req.query.sortBy) {
        case 'newest':
          sortOptions.createdAt = -1;
          break;
        case 'oldest':
          sortOptions.createdAt = 1;
          break;
        case 'price-asc':
        case 'price_asc':
          sortOptions.price = 1;
          break;
        case 'price-desc':
        case 'price_desc':
          sortOptions.price = -1;
          break;
        case 'verified':
          // Sort verified products first
          sortOptions.verified = -1;
          break;
      }
      
      query = query.sort(sortOptions);
    }
    
    // Get the products
    const products = await query.exec();
    
    // Log results for debugging
    console.log(`Found ${products.length} products with filters:`, filters);
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Error fetching product' });
  }
});

// Create new product - ensure seller is stored
router.post('/', async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name || !req.body.price || !req.body.category || !req.body.seller) {
      return res.status(400).json({ error: 'Missing required product fields' });
    }
    
    // Ensure seller field is present
    if (!req.body.seller) {
      return res.status(400).json({ error: 'Seller information is required' });
    }
    
    // Create and save the product
    const product = new Product(req.body);
    await product.save();
    
    console.log('Created new product:', {
      name: product.name,
      seller: product.seller,
      id: product._id
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Error creating product' });
  }
});

// Update product
router.patch('/:id', async (req, res) => {
  try {
    // Find the product first
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Update fields that are provided
    const updateData = req.body;
    
    // Ensure seller isn't changed to prevent unauthorized reassignment
    if (updateData.seller && product.seller && updateData.seller !== product.seller.toString()) {
      console.warn(`Attempted to change product seller from ${product.seller} to ${updateData.seller}`);
      // You can either reject or keep the original seller
      // For this implementation, we'll keep the original seller
      delete updateData.seller;
    }
    
    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    console.log(`Updated product ${updatedProduct._id}:`, {
      name: updatedProduct.name,
      seller: updatedProduct.seller
    });
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Error updating product' });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    console.log(`Deleted product ${req.params.id}`);
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Error deleting product' });
  }
});

// Verify product
router.post('/:id/verify', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    product.verified = true;
    product.verifiedAt = new Date();
    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Error verifying product:', error);
    res.status(500).json({ error: 'Error verifying product' });
  }
});

module.exports = router; 