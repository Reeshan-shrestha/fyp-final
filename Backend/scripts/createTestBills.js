/**
 * Script to create 5 test bills in the database
 * Run with: node scripts/createTestBills.js
 */

const mongoose = require('mongoose');
const Bill = mongoose.model('Bill', require('../models/Bill').schema);
const Product = mongoose.model('Product', require('../models/Product').schema);
const User = mongoose.model('User', require('../models/User').schema);
const Order = mongoose.model('Order', require('../models/Order').schema);
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chainbazzar')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

const generateBillNumber = () => {
  const prefix = 'BILL';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

const generateOrderAddress = () => {
  const streets = ['123 Main St', '456 Oak Ave', '789 Pine Blvd', '101 Cedar Ln', '202 Maple Dr'];
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
  const states = ['NY', 'CA', 'IL', 'TX', 'AZ'];
  const zipCodes = ['10001', '90001', '60601', '77001', '85001'];
  const countries = ['US', 'US', 'US', 'US', 'US'];
  
  const idx = Math.floor(Math.random() * streets.length);
  
  return {
    street: streets[idx],
    city: cities[idx],
    state: states[idx],
    zipCode: zipCodes[idx],
    country: countries[idx]
  };
};

const generateTestBills = async () => {
  try {
    // First, check if there are already bills in the system
    const existingBillsCount = await Bill.countDocuments();
    if (existingBillsCount > 0) {
      console.log(`There are already ${existingBillsCount} bills in the database. Aborting to prevent duplicates.`);
      return;
    }

    // Get products and users to reference in our bills
    const products = await Product.find().limit(10);
    const users = await User.find({ role: 'user' }).limit(5);

    if (products.length === 0) {
      console.error('No products found in the database');
      return;
    }

    if (users.length === 0) {
      console.error('No users found in the database');
      return;
    }

    console.log(`Found ${products.length} products and ${users.length} users for creating bills`);

    // Create orders first (bills need to reference orders)
    const orders = [];

    for (let i = 0; i < 5; i++) {
      const user = users[i % users.length];
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
      const orderItems = [];
      let orderTotal = 0;

      // Add random products to the order
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
        const price = product.price;
        
        orderItems.push({
          product: product._id,
          quantity: quantity,
          price: price
        });
        
        orderTotal += price * quantity;
      }

      // Create a new order
      const newOrder = new Order({
        user: user._id,
        items: orderItems,
        totalAmount: orderTotal,
        shippingAddress: generateOrderAddress(),
        paymentMethod: ['credit_card', 'paypal', 'crypto'][Math.floor(Math.random() * 3)],
        status: ['pending', 'processing', 'shipped', 'delivered'][Math.floor(Math.random() * 4)],
        paymentStatus: ['pending', 'completed'][Math.floor(Math.random() * 2)]
      });

      await newOrder.save();
      orders.push(newOrder);
      console.log(`Created order ${i+1} for user ${user.username} with ${numItems} items`);
    }

    // Now create bills referencing the orders
    const bills = [];

    for (let i = 0; i < 5; i++) {
      const order = orders[i];
      const billItems = [];
      let subtotal = 0;

      // Transform order items to bill items
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        const itemSubtotal = item.price * item.quantity;
        
        billItems.push({
          itemId: item.product.toString(),
          name: product.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: itemSubtotal
        });
        
        subtotal += itemSubtotal;
      }

      // Calculate tax and final amount
      const taxRate = 0.07; // 7% tax
      const tax = subtotal * taxRate;
      const finalAmount = subtotal + tax;

      // Create a new bill
      const newBill = new Bill({
        orderId: order._id,
        userId: order.user.toString(),
        items: billItems,
        totalAmount: subtotal,
        tax: tax,
        finalAmount: finalAmount,
        billDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date in last 30 days
        billNumber: generateBillNumber(),
        paymentStatus: order.paymentStatus,
        blockchainTxHash: Math.random() > 0.6 ? `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}` : null
      });

      await newBill.save();
      bills.push(newBill);
      console.log(`Created bill ${i+1} with bill number ${newBill.billNumber} for order ${order._id}`);
    }

    console.log(`Successfully created ${bills.length} test bills`);
  } catch (error) {
    console.error('Error creating test bills:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Run the function
generateTestBills(); 