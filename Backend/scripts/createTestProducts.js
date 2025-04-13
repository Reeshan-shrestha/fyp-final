/**
 * Script to create test products for the 5 sellers
 * Run: node scripts/createTestProducts.js
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/VerityDB';

// The 5 sellers we want to create products for
const SELLERS = ['TechVision', 'SportStyle', 'GourmetDelights', 'FashionFusion', 'SmartHome'];

// Sample products by category/seller - balanced to have exactly 4 products per category
const productTemplates = {
  TechVision: [
    { name: 'Basic TV', description: 'Simple 32-inch television for everyday use', price: 299.99, stock: 15, category: 'electronics' },
    { name: 'Digital Camera', description: 'Standard digital camera with 12MP', price: 199.99, stock: 8, category: 'electronics' },
    { name: 'Portable Speaker', description: 'Compact wireless speaker', price: 39.99, stock: 22, category: 'electronics' }
  ],
  SportStyle: [
    { name: 'Running Shoes', description: 'Comfortable shoes for running', price: 59.99, stock: 25, category: 'clothing' },
    { name: 'Sports T-shirt', description: 'Cotton t-shirt for sports', price: 19.99, stock: 35, category: 'clothing' },
    { name: 'Yoga Mat', description: 'Standard exercise mat', price: 25.99, stock: 50, category: 'other' }
  ],
  GourmetDelights: [
    { name: 'Coffee Beans', description: 'Regular coffee beans, 500g bag', price: 15.99, stock: 35, category: 'food' },
    { name: 'Chocolate Box', description: 'Assorted chocolate pieces', price: 12.99, stock: 45, category: 'food' },
    { name: 'Spice Set', description: 'Basic cooking spices set', price: 19.99, stock: 30, category: 'food' },
    { name: 'Fresh Bread', description: 'Freshly baked artisan bread', price: 5.99, stock: 25, category: 'food' }
  ],
  FashionFusion: [
    { name: 'Handbag', description: 'Simple everyday handbag', price: 49.99, stock: 15, category: 'clothing' },
    { name: 'Wristwatch', description: 'Basic analog wristwatch', price: 39.99, stock: 10, category: 'clothing' },
    { name: 'Headphones', description: 'Basic over-ear headphones', price: 59.99, stock: 12, category: 'electronics' }
  ],
  SmartHome: [
    { name: 'Bicycle', description: 'Regular bicycle for commuting', price: 249.99, stock: 7, category: 'other' },
    { name: 'Vacuum Cleaner', description: 'Standard vacuum for home use', price: 129.99, stock: 20, category: 'other' },
    { name: 'House Plant', description: 'Small indoor plant', price: 19.99, stock: 15, category: 'other' },
    { name: 'Floor Lamp', description: 'Simple floor lamp with adjustable head', price: 39.99, stock: 12, category: 'other' }
  ]
};

// Real product images - using reliable Unsplash image URLs
const PRODUCT_IMAGES = {
  // Simple electronics
  'Basic TV': 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=500&q=60',
  'Digital Camera': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=60',
  'Portable Speaker': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=500&q=60',
  
  // Simple sports items
  'Running Shoes': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=500&q=60',
  'Sports T-shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=60',
  'Yoga Mat': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=500&q=60',
  'Bicycle': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=500&q=60',
  
  // Simple food items
  'Coffee Beans': 'https://images.unsplash.com/photo-1559525642-c7d275281760?auto=format&fit=crop&w=500&q=60',
  'Chocolate Box': 'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=500&q=60',
  'Spice Set': 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=500&q=60',
  'Kitchen Knife': 'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=500&q=60',
  
  // Simple fashion items
  'Handbag': 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=500&q=60',
  'Wristwatch': 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=500&q=60',
  'Casual Dress': 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=500&q=60',
  'Leather Shoes': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=500&q=60',
  
  // Simple home items
  'Thermostat': 'https://images.unsplash.com/photo-1546856535-04598af535dc?auto=format&fit=crop&w=500&q=60',
  'Vacuum Cleaner': 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=500&q=60',
  'House Plant': 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=500&q=60',
  'Floor Lamp': 'https://images.unsplash.com/photo-1543198126-28a4e52b7e78?auto=format&fit=crop&w=500&q=60'
};

// Default fallback images by category - using simple category representative images
const DEFAULT_IMAGES = {
  'electronics': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=500&q=60',
  'clothing': 'https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=500&q=60',
  'food': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=500&q=60',
  'other': 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=500&q=60'
};

const createTestProducts = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // First, find all the sellers in the database
    const sellers = await User.find({ 
      username: { $in: SELLERS },
      role: 'seller'
    });
    
    if (sellers.length === 0) {
      console.error('No sellers found. Please create sellers first.');
      process.exit(1);
    }
    
    console.log(`Found ${sellers.length} sellers:`);
    sellers.forEach(seller => console.log(`- ${seller.username}`));
    
    // Clear existing products
    const deleteResult = await Product.deleteMany({});
    console.log(`Cleared ${deleteResult.deletedCount} existing products`);
    
    // Create new products for each seller
    const allProducts = [];
    
    for (const seller of sellers) {
      const sellerTemplates = productTemplates[seller.username] || [];
      
      if (sellerTemplates.length === 0) {
        console.warn(`No product templates found for seller: ${seller.username}`);
        continue;
      }
      
      for (const template of sellerTemplates) {
        const product = new Product({
          name: template.name,
          description: template.description,
          price: template.price,
          category: template.category,
          imageUrl: PRODUCT_IMAGES[template.name] || DEFAULT_IMAGES[template.category],
          seller: seller.username,
          verified: Math.random() > 0.5 // 50% chance of being verified
        });
        
        allProducts.push(product);
      }
    }
    
    // Save all products
    const savedProducts = await Product.insertMany(allProducts);
    console.log(`Successfully created ${savedProducts.length} test products`);
    
    // Print distribution
    console.log('\nProduct distribution by seller:');
    for (const seller of sellers) {
      const count = await Product.countDocuments({ seller: seller.username });
      console.log(`- ${seller.username}: ${count} products`);
    }
    
    // Print distribution by category
    const categories = ['electronics', 'clothing', 'food', 'other'];
    console.log('\nProduct distribution by category:');
    for (const category of categories) {
      const count = await Product.countDocuments({ category });
      console.log(`- ${category}: ${count} products`);
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
createTestProducts(); 