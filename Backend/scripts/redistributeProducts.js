/**
 * Script to remove seller1 and redistribute products among the 5 sellers
 * Run: node scripts/redistributeProducts.js
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/VerityDB';

// The 5 sellers we want to keep
const SELLERS_TO_KEEP = ['TechVision', 'SportStyle', 'GourmetDelights', 'FashionFusion', 'SmartHome'];

const redistributeProducts = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Step 1: Find all valid sellers
    const sellers = await User.find({ 
      username: { $in: SELLERS_TO_KEEP },
      role: 'seller'
    });
    
    if (sellers.length !== 5) {
      console.warn(`Warning: Expected 5 sellers, found ${sellers.length}`);
    }
    
    console.log(`Found ${sellers.length} valid sellers:`);
    sellers.forEach(seller => console.log(`- ${seller.username}`));
    
    // Step 2: Find seller1 account
    const seller1 = await User.findOne({ username: 'seller1' });
    
    // Step 3: Find admin (Reeshan) account
    const adminUser = await User.findOne({ username: 'Reeshan' });
    const adminId = adminUser ? adminUser._id : null;
    
    if (seller1) {
      console.log(`Found seller1 account with ID: ${seller1._id}`);
      
      // Find all products belonging to seller1
      const seller1Products = await Product.find({ seller: seller1._id });
      console.log(`Found ${seller1Products.length} products belonging to seller1`);
      
      // Redistribute seller1 products
      for (let i = 0; i < seller1Products.length; i++) {
        const product = seller1Products[i];
        // Select a seller using round-robin
        const newSeller = sellers[i % sellers.length];
        
        // Update the product
        product.seller = newSeller._id;
        await product.save();
        
        console.log(`Reassigned product "${product.name}" to seller "${newSeller.username}"`);
      }
      
      // Delete seller1 account
      await User.deleteOne({ _id: seller1._id });
      console.log('Deleted seller1 account');
    } else {
      console.log('seller1 account not found');
    }
    
    // Step 6: Find any products assigned to admin (Reeshan)
    if (adminId) {
      const adminProducts = await Product.find({ seller: adminId });
      console.log(`Found ${adminProducts.length} products assigned to admin`);
      
      // Redistribute admin products
      for (let i = 0; i < adminProducts.length; i++) {
        const product = adminProducts[i];
        // Select a seller using round-robin
        const newSeller = sellers[i % sellers.length];
        
        // Update the product
        product.seller = newSeller._id;
        await product.save();
        
        console.log(`Reassigned product "${product.name}" from admin to seller "${newSeller.username}"`);
      }
    } else {
      console.log('Admin account not found');
    }
    
    // Final check
    const remainingAdminProducts = adminId ? await Product.countDocuments({ seller: adminId }) : 0;
    const remainingSeller1Products = seller1 ? await Product.countDocuments({ seller: seller1._id }) : 0;
    
    console.log('\nFinal check:');
    console.log(`- Products assigned to admin: ${remainingAdminProducts}`);
    console.log(`- Products assigned to seller1: ${remainingSeller1Products}`);
    
    // Check distribution among 5 sellers
    console.log('\nCurrent product distribution:');
    for (const seller of sellers) {
      const count = await Product.countDocuments({ seller: seller._id });
      console.log(`- ${seller.username}: ${count} products`);
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
    
  } catch (error) {
    console.error('Error:', error);
    try {
      await mongoose.connection.close();
    } catch (err) {
      // Ignore
    }
    process.exit(1);
  }
};

// Run the script
redistributeProducts(); 