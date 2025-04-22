/**
 * Script to update existing products to use the username as the seller field
 * This ensures compatibility with our updated code.
 * Usage: node scripts/updateProductSellers.js
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
 * Update products to use username as seller
 */
async function updateProductSellers() {
  try {
    // Get all products
    const products = await Product.find({});
    
    console.log(`Found ${products.length} products to check for seller update`);
    
    // Get all sellers
    const sellers = await User.find({ role: 'seller' });
    
    if (sellers.length === 0) {
      console.log('No sellers found. Please run createSellers.js first.');
      process.exit(1);
    }
    
    console.log(`Found ${sellers.length} sellers for product updates`);
    
    // Organize sellers by ID for easier lookup
    const sellerById = {};
    sellers.forEach(seller => {
      sellerById[seller._id.toString()] = seller;
    });
    
    // Update products
    const updates = [];
    
    for (const product of products) {
      // Determine if we need to update this product
      let needsUpdate = false;
      let updateFields = {};
      
      // Get the current seller information from the product
      const currentSeller = product.seller;
      
      // If the seller is already a username but no sellerName is set
      if (typeof currentSeller === 'string' && !product.sellerName) {
        console.log(`Product ${product._id} has seller "${currentSeller}" but no sellerName. Adding sellerName.`);
        updateFields.sellerName = currentSeller;
        needsUpdate = true;
      }
      
      // If the seller field looks like an ObjectId and we need to convert it
      if (mongoose.Types.ObjectId.isValid(currentSeller)) {
        const seller = sellerById[currentSeller];
        
        if (seller) {
          console.log(`Updating product ${product._id} - setting seller from ${currentSeller} to ${seller.username}`);
          updateFields.seller = seller.username;
          updateFields.sellerId = currentSeller;
          updateFields.sellerName = seller.username;
          needsUpdate = true;
        } else {
          console.log(`Warning: No seller found with ID ${currentSeller} for product ${product._id}`);
        }
      }
      
      // Add the update if needed
      if (needsUpdate) {
        updates.push(
          Product.updateOne(
            { _id: product._id },
            { $set: updateFields }
          )
        );
      } else {
        console.log(`Product ${product._id} does not need updates`);
      }
    }
    
    if (updates.length === 0) {
      console.log('No products need updating');
      process.exit(0);
    }
    
    // Execute all updates
    const results = await Promise.all(updates);
    
    // Get count of successful updates
    const totalUpdated = results.reduce((count, result) => count + result.modifiedCount, 0);
    
    console.log(`Successfully updated ${totalUpdated} products with seller information`);
    process.exit(0);
    
  } catch (error) {
    console.error('Error updating product sellers:', error);
    process.exit(1);
  }
}

// Start the update process
updateProductSellers(); 