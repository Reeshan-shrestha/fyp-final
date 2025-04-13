const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chainbazzar')
  .then(() => console.log('MongoDB connected...'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to generate random stock between min and max (inclusive)
const getRandomStock = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Update all products to have a random stock of at least 20
const updateProductStock = async () => {
  try {
    console.log('Updating product stock...');

    const products = await Product.find({});
    console.log(`Found ${products.length} products.`);

    // Update each product
    const updatePromises = products.map(async (product) => {
      // Generate random stock between 20 and 100
      const newStock = getRandomStock(20, 100);
      
      // Update the product
      return Product.findByIdAndUpdate(
        product._id,
        { countInStock: newStock },
        { new: true }
      );
    });

    // Wait for all updates to complete
    const updatedProducts = await Promise.all(updatePromises);
    
    // Log results
    console.log('Stock update successful!');
    console.log('Updated products:');
    updatedProducts.forEach(product => {
      console.log(`${product.name}: ${product.countInStock} in stock`);
    });

    console.log('All product stocks have been updated successfully.');
  } catch (error) {
    console.error('Error updating product stock:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

// Run the update function
updateProductStock(); 