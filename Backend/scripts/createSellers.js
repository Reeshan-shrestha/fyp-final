/**
 * Script to create 5 seller accounts and distribute products to them
 * Run: node scripts/createSellers.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
require('dotenv').config();

// Seller accounts data
const sellers = [
  {
    username: 'TechVision',
    email: 'tech@vision.com',
    password: 'seller123',
    products: [
      { name: 'MacBook Pro M2', price: 1299.99, category: 'electronics', stock: 10 },
      { name: 'Sony WH-1000XM5', price: 399.99, category: 'electronics', stock: 15 }
    ]
  },
  {
    username: 'SportStyle',
    email: 'sport@style.com',
    password: 'seller123',
    products: [
      { name: 'Nike Air Max 2023', price: 179.99, category: 'clothing', stock: 25 },
      { name: 'Adidas Pro Training Set', price: 89.99, category: 'clothing', stock: 20 }
    ]
  },
  {
    username: 'GourmetDelights',
    email: 'gourmet@delights.com',
    password: 'seller123',
    products: [
      { name: 'Artisanal Coffee Collection', price: 49.99, category: 'food', stock: 30 },
      { name: 'Luxury Chocolate Box', price: 39.99, category: 'food', stock: 25 }
    ]
  },
  {
    username: 'FashionFusion',
    email: 'fashion@fusion.com',
    password: 'seller123',
    products: [
      { name: 'Designer Sunglasses Collection', price: 159.99, category: 'clothing', stock: 15 },
      { name: 'Leather Weekend Bag', price: 199.99, category: 'clothing', stock: 10 }
    ]
  },
  {
    username: 'SmartHome',
    email: 'smart@home.com',
    password: 'seller123',
    products: [
      { name: 'Smart Home Hub Pro', price: 299.99, category: 'electronics', stock: 20 },
      { name: 'Security Camera System', price: 449.99, category: 'electronics', stock: 12 }
    ]
  }
];

// Function to create sellers and their products
const createSellersWithProducts = async () => {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/VerityDB';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Keep track of results
    const results = {
      sellersCreated: 0,
      sellersSkipped: 0,
      productsCreated: 0
    };
    
    // Create each seller and their products
    for (const sellerData of sellers) {
      // Check if seller already exists
      const existingSeller = await User.findOne({ username: sellerData.username });
      
      let sellerId;
      
      if (existingSeller) {
        console.log(`Seller ${sellerData.username} already exists with role: ${existingSeller.role}`);
        
        // If user exists but is not a seller, update role
        if (existingSeller.role !== 'seller') {
          existingSeller.role = 'seller';
          await existingSeller.save();
          console.log(`Updated ${sellerData.username}'s role to seller`);
        }
        
        sellerId = existingSeller._id;
        results.sellersSkipped++;
      } else {
        // Create new seller account
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(sellerData.password, salt);
        
        // Generate wallet address
        const walletAddress = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        
        const newSeller = new User({
          username: sellerData.username,
          email: sellerData.email,
          password: hashedPassword,
          role: 'seller',
          walletAddress,
          isVerified: true,
          createdAt: new Date()
        });
        
        const savedSeller = await newSeller.save();
        console.log(`Created seller: ${savedSeller.username}`);
        
        sellerId = savedSeller._id;
        results.sellersCreated++;
      }
      
      // Create products for this seller
      for (const productData of sellerData.products) {
        // Check if product already exists
        const existingProduct = await Product.findOne({ 
          name: productData.name,
          seller: sellerId 
        });
        
        if (existingProduct) {
          console.log(`Product '${productData.name}' already exists for seller ${sellerData.username}`);
          continue;
        }
        
        // Generate image URLs based on category
        let imageUrl;
        if (productData.category === 'electronics') {
          imageUrl = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80';
        } else if (productData.category === 'clothing') {
          imageUrl = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80';
        } else {
          imageUrl = 'https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=800&q=80';
        }
        
        // Create the product
        const newProduct = new Product({
          name: productData.name,
          description: `Premium quality ${productData.name} from ${sellerData.username}`,
          price: productData.price,
          category: productData.category,
          imageUrl,
          seller: sellerId,
          stock: productData.stock,
          verified: Math.random() > 0.3, // 70% chance to be verified
          createdAt: new Date()
        });
        
        await newProduct.save();
        console.log(`Created product: ${productData.name} for seller ${sellerData.username}`);
        results.productsCreated++;
      }
    }
    
    // Print summary
    console.log('\nOperation completed:');
    console.log(`Sellers created: ${results.sellersCreated}`);
    console.log(`Sellers already existing: ${results.sellersSkipped}`);
    console.log(`Products created: ${results.productsCreated}`);
    
    // Close database connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error creating sellers with products:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
createSellersWithProducts(); 