/**
 * Database Seed Script for ChainBazzar
 * Populates the database with initial test data
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chainbazzar';

// Test users data
const users = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    walletAddress: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4',
    role: 'admin',
    isVerified: true
  },
  {
    username: 'user1',
    email: 'user1@example.com',
    password: 'user123',
    walletAddress: '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2',
    role: 'user',
    isVerified: true
  },
  {
    username: 'seller1',
    email: 'seller1@example.com',
    password: 'seller123',
    walletAddress: '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db',
    role: 'user',
    isVerified: true
  }
];

// Test products data
const products = [
  {
    name: 'Premium Leather Wallet',
    description: 'Handcrafted genuine leather wallet with multiple card slots and coin pocket.',
    price: 89.99,
    category: 'clothing',
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    seller: 'seller1',
    verified: true,
    verifiedAt: new Date(),
    stock: 15,
    createdAt: new Date()
  },
  {
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'High-quality wireless headphones with active noise cancellation and 20-hour battery life.',
    price: 199.99,
    category: 'electronics',
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    seller: 'seller1',
    verified: true,
    verifiedAt: new Date(),
    stock: 8,
    createdAt: new Date()
  },
  {
    name: 'Smartphone X Pro',
    description: 'Latest flagship smartphone with 6.7" OLED display, 5G, and professional camera system.',
    price: 999.99,
    category: 'electronics',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    seller: 'seller1',
    verified: false,
    stock: 5,
    createdAt: new Date()
  },
  {
    name: 'Artisan Coffee Gift Set',
    description: 'Premium coffee beans selection from around the world, packaged in a beautiful gift box.',
    price: 49.99,
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1589396575653-c82c5a724e7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    seller: 'seller1',
    verified: true,
    verifiedAt: new Date(),
    stock: 20,
    createdAt: new Date()
  }
];

// Function to seed the database
async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Transaction.deleteMany({});
    console.log('Database cleared');

    // Create users
    console.log('Creating users...');
    const createdUsers = [];
    for (const user of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      const newUser = new User({
        ...user,
        password: hashedPassword
      });
      
      const savedUser = await newUser.save();
      createdUsers.push(savedUser);
      console.log(`Created user: ${user.username}`);
    }

    // Create products
    console.log('Creating products...');
    const createdProducts = [];
    for (const product of products) {
      // Find seller
      const seller = createdUsers.find(u => u.username === product.seller);
      
      const newProduct = new Product({
        ...product,
        seller: seller ? seller.username : 'Unknown'
      });
      
      const savedProduct = await newProduct.save();
      createdProducts.push(savedProduct);
      console.log(`Created product: ${product.name}`);
    }

    // Create some orders
    console.log('Creating orders...');
    const orders = [
      {
        userId: createdUsers[1]._id, // user1
        itemId: createdProducts[0]._id, // Leather Wallet
        quantity: 1,
        price: createdProducts[0].price,
        status: 'completed',
        orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        blockchainTxId: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        blockchainVerified: true,
        blockchainTimestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000), // 1 hour after order
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        }
      },
      {
        userId: createdUsers[1]._id, // user1
        itemId: createdProducts[1]._id, // Headphones
        quantity: 1,
        price: createdProducts[1].price,
        status: 'processing',
        orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        blockchainTxId: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        blockchainVerified: true,
        blockchainTimestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // 30 min after order
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        }
      },
      {
        userId: createdUsers[2]._id, // seller1
        itemId: createdProducts[2]._id, // Smartphone
        quantity: 1,
        price: createdProducts[2].price,
        status: 'pending',
        orderDate: new Date(), // Today
        blockchainVerified: false,
        shippingAddress: {
          street: '456 Oak Ave',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94103',
          country: 'USA'
        }
      }
    ];

    for (const order of orders) {
      const newOrder = new Order(order);
      await newOrder.save();
      console.log(`Created order for product: ${order.itemId}`);
    }

    // Create transactions (more advanced data for admin dashboard)
    console.log('Creating transactions...');
    
    const transactions = [
      {
        user: createdUsers[1]._id, // user1
        items: [
          {
            product: createdProducts[0]._id,
            quantity: 1,
            price: createdProducts[0].price
          }
        ],
        totalAmount: createdProducts[0].price,
        status: 'completed',
        paymentMethod: 'Credit Card',
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
      },
      {
        user: createdUsers[1]._id, // user1
        items: [
          {
            product: createdProducts[1]._id,
            quantity: 1,
            price: createdProducts[1].price
          },
          {
            product: createdProducts[3]._id,
            quantity: 2,
            price: createdProducts[3].price
          }
        ],
        totalAmount: createdProducts[1].price + (createdProducts[3].price * 2),
        status: 'processing',
        paymentMethod: 'PayPal',
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }
    ];

    for (const transaction of transactions) {
      const newTransaction = new Transaction(transaction);
      await newTransaction.save();
      console.log(`Created transaction with total: $${transaction.totalAmount}`);
    }

    console.log('Database seeding completed successfully!');
    mongoose.connection.close();
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase(); 