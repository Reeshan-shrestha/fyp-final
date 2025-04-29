const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const mongoose = require('mongoose');
const { uploadToIpfsMiddleware } = require('../middleware/ipfsUpload');
const { getIPFSUrl, convertUrlToIPFS, isIPFSAvailable } = require('../services/ipfsService');
const blockchainInventoryService = require('../services/blockchainInventoryService');

// Helper to format product with IPFS URLs
const formatProductWithIpfs = (product) => {
  const formattedProduct = product.toObject ? product.toObject() : { ...product };
  
  // Convert imageUrl to IPFS URL if it's an IPFS CID
  if (formattedProduct.ipfsCid) {
    formattedProduct.ipfsUrl = `ipfs://${formattedProduct.ipfsCid}`;
    formattedProduct.imageUrl = getIPFSUrl(formattedProduct.ipfsCid);
  }
  
  return formattedProduct;
};

// After the formatProductWithIpfs helper function, add this helper for blockchain stock
const getBlockchainStock = async (product) => {
  if (!product || !product.blockchainManaged) {
    return null;
  }
  
  try {
    const stockResult = await blockchainInventoryService.getProductStock(product._id.toString());
    if (stockResult.success) {
      return stockResult.stock;
    }
  } catch (error) {
    console.error(`Error fetching blockchain stock for product ${product._id}:`, error);
  }
  
  return null;
};

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
    
    // Format products with IPFS URLs
    const formattedProducts = products.map(formatProductWithIpfs);
    
    // Log results for debugging
    console.log(`Found ${products.length} products with filters:`, filters);
    
    res.json(formattedProducts);
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
    
    const formattedProduct = formatProductWithIpfs(product);
    
    // If product is managed on blockchain, fetch the stock from there
    if (product.blockchainManaged) {
      const blockchainStock = await getBlockchainStock(product);
      if (blockchainStock !== null) {
        formattedProduct.countInStock = blockchainStock;
        formattedProduct.onChainStock = true;
      }
    }
    
    res.json(formattedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Error fetching product' });
  }
});

// Create new product with image upload to IPFS
router.post('/', uploadToIpfsMiddleware('image'), async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.name || !req.body.price || !req.body.category || !req.body.seller) {
      return res.status(400).json({ error: 'Missing required product fields' });
    }
    
    // Ensure seller field is present
    if (!req.body.seller) {
      return res.status(400).json({ error: 'Seller information is required' });
    }
    
    // Prepare product data with appropriate seller fields
    const productData = { ...req.body };
    
    // Make sure seller is properly assigned (by username, ID, etc.)
    // Ensure these fields are present for seller identification
    if (!productData.sellerId && productData.seller) {
      console.log(`Creating product with seller: ${productData.seller}`);
      // If only username is provided, add additional fields
      productData.sellerName = productData.seller;
    }
    
    // If an image was uploaded to IPFS, use the IPFS URL
    if (req.body.ipfsCid) {
      productData.ipfsCid = req.body.ipfsCid;
      productData.imageUrl = getIPFSUrl(req.body.ipfsCid);
      console.log(`Product image stored on IPFS with CID: ${req.body.ipfsCid}`);
    } else if (productData.imageUrl && isIPFSAvailable()) {
      // If an imageUrl was provided but not uploaded via file, try to convert it to IPFS
      try {
        const cid = await convertUrlToIPFS(productData.imageUrl);
        if (cid !== productData.imageUrl) {
          productData.ipfsCid = cid;
          productData.imageUrl = getIPFSUrl(cid);
          console.log(`Converted image URL to IPFS with CID: ${cid}`);
        }
      } catch (err) {
        console.error('Failed to convert image URL to IPFS, using original URL', err);
      }
    }
    
    // If still no image URL, use a default placeholder
    if (!productData.imageUrl) {
      productData.imageUrl = 'https://via.placeholder.com/300?text=No+Image';
    }
    
    // Check if blockchain inventory should be used
    const useBlockchain = productData.useBlockchain === 'true' || productData.useBlockchain === true;
    
    // Create and save the product
    const product = new Product(productData);
    await product.save();
    
    console.log('Created new product:', {
      name: product.name,
      seller: product.seller,
      id: product._id,
      ipfsCid: product.ipfsCid || 'None'
    });
    
    // If blockchain inventory is requested, add to blockchain
    if (useBlockchain && await blockchainInventoryService.isConnected()) {
      try {
        const result = await blockchainInventoryService.addProductToBlockchain(
          product._id.toString(),
          product.name,
          product.countInStock || 0
        );
        
        if (result.success) {
          // Update product with blockchain info
          product.blockchainManaged = true;
          product.blockchainTxHash = result.transactionHash;
          product.blockchainInventoryLastSync = new Date();
          
          // Add to stock history
          product.stockHistory = [{
            previousStock: 0,
            newStock: product.countInStock || 0,
            transactionHash: result.transactionHash,
            timestamp: new Date()
          }];
          
          await product.save();
          
          console.log(`Product ${product._id} added to blockchain inventory`);
        } else {
          console.error(`Failed to add product ${product._id} to blockchain:`, result.error);
        }
      } catch (error) {
        console.error(`Error adding product ${product._id} to blockchain:`, error);
      }
    }
    
    res.status(201).json(formatProductWithIpfs(product));
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Error creating product' });
  }
});

// Update product with IPFS support
router.patch('/:id', uploadToIpfsMiddleware('image'), async (req, res) => {
  try {
    // Find the product first
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Update fields that are provided
    const updateData = { ...req.body };
    
    // Ensure seller isn't changed to prevent unauthorized reassignment
    if (updateData.seller && product.seller && updateData.seller !== product.seller.toString()) {
      console.warn(`Attempted to change product seller from ${product.seller} to ${updateData.seller}`);
      // You can either reject or keep the original seller
      // For this implementation, we'll keep the original seller
      delete updateData.seller;
    }
    
    // If an image was uploaded to IPFS, use the IPFS URL
    if (req.body.ipfsCid) {
      updateData.ipfsCid = req.body.ipfsCid;
      updateData.imageUrl = getIPFSUrl(req.body.ipfsCid);
      console.log(`Updated product image stored on IPFS with CID: ${req.body.ipfsCid}`);
    } else if (updateData.imageUrl && updateData.imageUrl !== product.imageUrl && isIPFSAvailable()) {
      // If imageUrl was changed but not via file upload, try to convert it to IPFS
      try {
        const cid = await convertUrlToIPFS(updateData.imageUrl);
        if (cid !== updateData.imageUrl) {
          updateData.ipfsCid = cid;
          updateData.imageUrl = getIPFSUrl(cid);
          console.log(`Converted updated image URL to IPFS with CID: ${cid}`);
        }
      } catch (err) {
        console.error('Failed to convert updated image URL to IPFS, using original URL', err);
      }
    }
    
    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    console.log(`Updated product ${updatedProduct._id}:`, {
      name: updatedProduct.name,
      seller: updatedProduct.seller,
      ipfsCid: updatedProduct.ipfsCid || 'None'
    });
    
    res.json(formatProductWithIpfs(updatedProduct));
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
    res.json(formatProductWithIpfs(product));
  } catch (error) {
    console.error('Error verifying product:', error);
    res.status(500).json({ error: 'Error verifying product' });
  }
});

// Migrate existing product image to IPFS
router.post('/:id/migrate-to-ipfs', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check if product already has IPFS CID
    if (product.ipfsCid) {
      return res.json({ 
        message: 'Product image already on IPFS',
        product: formatProductWithIpfs(product)
      });
    }
    
    // Check if IPFS is available
    if (!isIPFSAvailable()) {
      return res.status(503).json({ error: 'IPFS service not available' });
    }
    
    // Check if product has an image URL
    if (!product.imageUrl) {
      return res.status(400).json({ error: 'Product has no image URL to migrate' });
    }
    
    // Convert URL to IPFS
    const cid = await convertUrlToIPFS(product.imageUrl);
    if (cid === product.imageUrl) {
      return res.status(400).json({ error: 'Failed to convert image to IPFS' });
    }
    
    // Update product with IPFS data
    product.ipfsCid = cid;
    product.imageUrl = getIPFSUrl(cid);
    await product.save();
    
    console.log(`Migrated product image to IPFS with CID: ${cid}`);
    
    res.json({
      message: 'Product image migrated to IPFS successfully',
      product: formatProductWithIpfs(product)
    });
  } catch (error) {
    console.error('Error migrating product image to IPFS:', error);
    res.status(500).json({ error: 'Error migrating product image to IPFS' });
  }
});

// Add this new route to update product stock
router.patch('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    
    if (stock === undefined || isNaN(parseInt(stock))) {
      return res.status(400).json({ error: 'Missing or invalid stock value' });
    }
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const oldStock = product.countInStock;
    const newStock = parseInt(stock);
    
    // If product is managed on blockchain, update there first
    if (product.blockchainManaged) {
      const blockchainResult = await blockchainInventoryService.updateProductStock(
        id,
        newStock
      );
      
      if (!blockchainResult.success) {
        return res.status(400).json({
          error: 'Failed to update stock on blockchain',
          details: blockchainResult.error
        });
      }
      
      // Update product with transaction details
      product.blockchainTxHash = blockchainResult.transactionHash;
      product.blockchainInventoryLastSync = new Date();
      
      // Add to stock history
      product.stockHistory.push({
        previousStock: oldStock,
        newStock,
        transactionHash: blockchainResult.transactionHash,
        timestamp: new Date()
      });
    }
    
    // Update stock in database
    product.countInStock = newStock;
    await product.save();
    
    res.json({
      success: true,
      product: formatProductWithIpfs(product),
      oldStock,
      newStock,
      onChain: product.blockchainManaged
    });
  } catch (error) {
    console.error('Error updating product stock:', error);
    res.status(500).json({ error: 'Error updating product stock' });
  }
});

// Add this new route to enable blockchain inventory for an existing product
router.post('/:id/enable-blockchain', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Don't re-enable if already enabled
    if (product.blockchainManaged) {
      return res.json({
        success: true,
        product: formatProductWithIpfs(product),
        message: 'Product already managed on blockchain'
      });
    }
    
    // Add to blockchain inventory
    const result = await blockchainInventoryService.addProductToBlockchain(
      id,
      product.name,
      product.countInStock || 0
    );
    
    if (!result.success) {
      return res.status(400).json({
        error: 'Failed to add product to blockchain',
        details: result.error
      });
    }
    
    // Update product with blockchain info
    product.blockchainManaged = true;
    product.blockchainTxHash = result.transactionHash;
    product.blockchainInventoryLastSync = new Date();
    
    // Add to stock history
    product.stockHistory = [{
      previousStock: 0,
      newStock: product.countInStock || 0,
      transactionHash: result.transactionHash,
      timestamp: new Date()
    }];
    
    await product.save();
    
    res.json({
      success: true,
      product: formatProductWithIpfs(product),
      message: 'Product now managed on blockchain'
    });
  } catch (error) {
    console.error('Error enabling blockchain for product:', error);
    res.status(500).json({ error: 'Error enabling blockchain for product' });
  }
});

module.exports = router; 