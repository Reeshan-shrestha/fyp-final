/**
 * Script to create example products and distribute them to sellers
 * Usage: node scripts/seedProducts.js
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

// Sample products to create
const sampleProducts = [
  {
    name: 'MacBook Pro M2',
    description: 'Latest model with improved performance and battery life',
    price: 1299.99,
    category: 'electronics',
    imageUrl: 'https://via.placeholder.com/300x300?text=Macbook',
    countInStock: 10,
    verified: true
  },
  {
    name: 'Sony WH-1000XM5',
    description: 'Premium noise-cancelling headphones with exceptional sound quality',
    price: 399.99,
    category: 'electronics',
    imageUrl: 'https://via.placeholder.com/300x300?text=Headphones',
    countInStock: 15,
    verified: true
  },
  {
    name: 'iPad Pro 2023',
    description: 'The latest iPad Pro with M2 chip and stunning display',
    price: 999.99,
    category: 'electronics',
    imageUrl: 'https://via.placeholder.com/300x300?text=iPad',
    countInStock: 8,
    verified: true
  },
  {
    name: 'Nike Air Max 2023',
    description: 'Latest athletic shoes with advanced comfort technology',
    price: 179.99,
    category: 'clothing',
    imageUrl: 'https://via.placeholder.com/300x300?text=Shoes',
    countInStock: 25,
    verified: false
  },
  {
    name: 'Adidas Pro Training Set',
    description: 'Complete training gear for professional athletes',
    price: 89.99,
    category: 'clothing',
    imageUrl: 'https://via.placeholder.com/300x300?text=Training',
    countInStock: 20,
    verified: true
  },
  {
    name: 'Artisanal Coffee Collection',
    description: 'Premium coffee beans sourced from around the world',
    price: 49.99,
    category: 'food',
    imageUrl: 'https://via.placeholder.com/300x300?text=Coffee',
    countInStock: 30,
    verified: false
  },
  {
    name: 'Luxury Chocolate Box',
    description: 'Handcrafted chocolate assortment from master chocolatiers',
    price: 39.99,
    category: 'food',
    imageUrl: 'https://via.placeholder.com/300x300?text=Chocolate',
    countInStock: 25,
    verified: true
  },
  {
    name: 'Designer Sunglasses Collection',
    description: 'Premium sunglasses with UV protection and stylish design',
    price: 159.99,
    category: 'clothing',
    imageUrl: 'https://via.placeholder.com/300x300?text=Sunglasses',
    countInStock: 15,
    verified: true
  },
  {
    name: 'Smart Home Hub Pro',
    description: 'Central control for all your smart home devices',
    price: 299.99,
    category: 'electronics',
    imageUrl: 'https://via.placeholder.com/300x300?text=SmartHub',
    countInStock: 20,
    verified: true
  },
  {
    name: 'Security Camera System',
    description: 'Advanced security cameras with motion detection',
    price: 449.99,
    category: 'electronics',
    imageUrl: 'https://via.placeholder.com/300x300?text=Camera',
    countInStock: 12,
    verified: false
  }
];

// Seller to product allocation (indices in the array)
const sellerAllocations = {
  'TechVision': [0, 1, 2],  // Electronics
  'SportStyle': [3, 4],     // Clothing
  'GourmetDelights': [5, 6], // Food
  'FashionFusion': [7],      // Fashion
  'SmartHome': [8, 9]        // Smart home electronics
};

/**
 * Seed products and assign to sellers
 */
async function seedProducts() {
  try {
    // Check if products already exist
    const productCount = await Product.countDocuments();
    
    if (productCount > 0) {
      console.log(`Database already has ${productCount} products. Skipping seed.`);
      process.exit(0);
    }
    
    console.log('No products found. Creating seed products...');
    
    // Get all sellers
    const sellers = await User.find({ role: 'seller' });
    
    if (sellers.length === 0) {
      console.log('No sellers found. Please run createSellers.js first.');
      process.exit(1);
    }
    
    console.log(`Found ${sellers.length} sellers for product distribution`);
    
    // Organize sellers by username for easier allocation
    const sellersByUsername = {};
    sellers.forEach(seller => {
      sellersByUsername[seller.username] = seller;
    });
    
    // Create products and assign to appropriate sellers
    const productPromises = [];
    
    // First, create products for specific sellers based on allocations
    for (const [sellerUsername, productIndices] of Object.entries(sellerAllocations)) {
      const seller = sellersByUsername[sellerUsername];
      
      if (!seller) {
        console.log(`Seller "${sellerUsername}" not found in database. Skipping allocation.`);
        continue;
      }
      
      for (const index of productIndices) {
        if (index >= sampleProducts.length) continue;
        
        const productData = {
          ...sampleProducts[index],
          seller: seller.username,
          sellerId: seller._id.toString(),
          sellerName: seller.username
        };
        
        const newProduct = new Product(productData);
        productPromises.push(newProduct.save());
      }
    }
    
    // Add any remaining unallocated products with random sellers
    const allocated = Object.values(sellerAllocations).flat();
    const unallocated = Array.from({ length: sampleProducts.length }, (_, i) => i)
      .filter(i => !allocated.includes(i));
    
    for (const index of unallocated) {
      const randomSellerIndex = Math.floor(Math.random() * sellers.length);
      const seller = sellers[randomSellerIndex];
      
      const productData = {
        ...sampleProducts[index],
        seller: seller.username,
        sellerId: seller._id.toString(),
        sellerName: seller.username
      };
      
      const newProduct = new Product(productData);
      productPromises.push(newProduct.save());
    }
    
    // Save all products to database
    const results = await Promise.all(productPromises);
    
    console.log(`Successfully created ${results.length} products`);
    process.exit(0);
    
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

// Start the seeding process
seedProducts(); 