/**
 * Script to distribute existing products to our five specific sellers
 * Usage: node scripts/distributeProductsToSellers.js
 */

const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chainbazzar')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

/**
 * Distribute products to sellers
 * This will:
 * 1. Get all products that don't have a seller assigned
 * 2. Get all sellers
 * 3. Randomly assign products to sellers
 */
async function distributeProducts() {
  try {
    // Get all products that don't have a seller assigned yet
    const unassignedProducts = await Product.find({ seller: { $exists: false } });
    
    if (unassignedProducts.length === 0) {
      console.log('No unassigned products found');
      process.exit(0);
    }
    
    console.log(`Found ${unassignedProducts.length} unassigned products`);
    
    // Get all sellers (users with role = 'seller')
    const sellers = await User.find({ role: 'seller' });
    
    if (sellers.length === 0) {
      console.log('No sellers found in the system');
      process.exit(1);
    }
    
    console.log(`Found ${sellers.length} sellers`);
    
    // Distribute products among sellers
    const updates = [];
    
    for (let i = 0; i < unassignedProducts.length; i++) {
      // Pick a random seller
      const randomSellerIndex = Math.floor(Math.random() * sellers.length);
      const seller = sellers[randomSellerIndex];
      
      // Assign product to seller
      updates.push(
        Product.updateOne(
          { _id: unassignedProducts[i]._id },
          { 
            seller: seller.username, // Use the username for compatibility with existing code
            sellerId: seller._id.toString(), // Store seller ID directly for easier querying
            sellerName: seller.username // Add seller name for display purposes
          }
        )
      );
    }
    
    // Execute all updates
    const results = await Promise.all(updates);
    
    // Get count of successful updates
    const totalUpdated = results.reduce((count, result) => count + result.modifiedCount, 0);
    
    console.log(`Successfully distributed ${totalUpdated} products to sellers`);
    process.exit(0);
    
  } catch (error) {
    console.error('Error distributing products:', error);
    process.exit(1);
  }
}

// Start the distribution process
distributeProducts(); 