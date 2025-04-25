/**
 * Script to migrate existing product images to IPFS
 * Run: node scripts/migrateImagesToIPFS.js
 */

const mongoose = require('mongoose');
const Product = require('../models/Product');
const { convertUrlToIPFS, getIPFSUrl, isIPFSAvailable } = require('../services/ipfsService');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/VerityDB';

async function migrateImagesToIPFS() {
  console.log('Starting migration of product images to IPFS...');
  
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if IPFS is available
    if (!isIPFSAvailable()) {
      console.error('IPFS client is not initialized. Check your INFURA credentials in .env file.');
      process.exit(1);
    }
    
    // Get all products without IPFS CID
    const products = await Product.find({ ipfsCid: { $exists: false } });
    console.log(`Found ${products.length} products without IPFS CIDs`);
    
    if (products.length === 0) {
      console.log('No products need migration. Exiting...');
      await mongoose.connection.close();
      return;
    }
    
    // Process each product
    let successCount = 0;
    let failureCount = 0;
    
    for (const product of products) {
      try {
        if (!product.imageUrl) {
          console.log(`Product ${product._id} has no image URL. Skipping...`);
          failureCount++;
          continue;
        }
        
        console.log(`Processing product: ${product.name} (${product._id})`);
        console.log(`Original image URL: ${product.imageUrl}`);
        
        // Convert URL to IPFS
        const cid = await convertUrlToIPFS(product.imageUrl);
        
        if (cid === product.imageUrl) {
          console.log(`Failed to convert image to IPFS for product ${product._id}. Skipping...`);
          failureCount++;
          continue;
        }
        
        // Update product with IPFS data
        product.ipfsCid = cid;
        product.imageUrl = getIPFSUrl(cid);
        await product.save();
        
        console.log(`Successfully migrated product ${product._id} to IPFS with CID: ${cid}`);
        successCount++;
        
      } catch (error) {
        console.error(`Error processing product ${product._id}:`, error);
        failureCount++;
      }
    }
    
    // Print summary
    console.log('\nMigration summary:');
    console.log(`Total products processed: ${products.length}`);
    console.log(`Successfully migrated: ${successCount}`);
    console.log(`Failed migrations: ${failureCount}`);
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Migration script error:', error);
    try {
      await mongoose.connection.close();
    } catch (err) {
      // Ignore
    }
    process.exit(1);
  }
}

// Run the script
migrateImagesToIPFS(); 