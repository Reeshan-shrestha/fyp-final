const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// Get all transactions with filtering
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    let query = {};

    // Apply date filters if provided
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Apply status filter if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    // First try to get real transaction data
    let transactions = await Transaction.find(query)
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .lean();
    
    // If no transactions found, try to get order data
    if (!transactions || transactions.length === 0) {
      const orders = await Order.find(query).sort({ orderDate: -1 }).lean();
      
      // Map orders to a transaction-like format
      if (orders && orders.length > 0) {
        transactions = await Promise.all(orders.map(async (order) => {
          try {
            // Find user info
            const user = await User.findOne({ _id: order.userId }).lean();
            // Format to match transaction schema
            return {
              _id: order._id,
              createdAt: order.orderDate,
              user: { 
                name: user ? user.username : 'Unknown User', 
                email: user ? user.email : 'unknown@example.com'
              },
              totalAmount: order.price * order.quantity,
              status: order.status,
              blockchainTxId: order.blockchainTxId || null
            };
          } catch (err) {
            console.error('Error mapping order to transaction:', err);
            return null;
          }
        }));
        
        // Filter out any null values
        transactions = transactions.filter(t => t !== null);
      }
    }

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
});

// Get transaction details by ID
router.get('/:id', async (req, res) => {
  try {
    // First try to get transaction
    let transaction = await Transaction.findById(req.params.id)
      .populate('user', 'username email')
      .populate('items.product')
      .lean();
    
    // If no transaction found, try to get order
    if (!transaction) {
      const order = await Order.findById(req.params.id).lean();
      
      if (order) {
        // Get user info
        const user = await User.findOne({ _id: order.userId }).lean();
        // Get product info
        const product = await Product.findOne({ _id: order.itemId }).lean();
        
        // Format to match transaction schema
        transaction = {
          _id: order._id,
          createdAt: order.orderDate,
          user: { 
            name: user ? user.username : 'Unknown User', 
            email: user ? user.email : 'unknown@example.com'
          },
          totalAmount: order.price * order.quantity,
          status: order.status,
          paymentMethod: 'Standard Payment',
          blockchainTxId: order.blockchainTxId || null,
          blockchainVerified: order.blockchainVerified || false,
          shippingAddress: order.shippingAddress || {
            street: 'Default Address',
            city: 'Default City',
            state: 'Default State',
            zipCode: '00000',
            country: 'Default Country'
          },
          items: [{
            product: product || { name: 'Unknown Product' },
            quantity: order.quantity,
            price: order.price
          }]
        };
      } else {
        return res.status(404).json({ message: 'Transaction not found' });
      }
    }

    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    res.status(500).json({ message: 'Error fetching transaction details', error: error.message });
  }
});

// Update transaction status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    // First try to update transaction
    let updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    // If no transaction found, try to update order
    if (!updatedTransaction) {
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
      
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      updatedTransaction = {
        _id: updatedOrder._id,
        status: updatedOrder.status
      };
    }
    
    res.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction status:', error);
    res.status(500).json({ message: 'Error updating transaction status', error: error.message });
  }
});

// Record blockchain transaction for an order or transaction
router.post('/:id/blockchain', async (req, res) => {
  try {
    const { txId, txHash } = req.body;
    
    if (!txId && !txHash) {
      return res.status(400).json({ message: 'Transaction ID or hash is required' });
    }
    
    // First try to update transaction
    let updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { 
        blockchainTxId: txId || txHash,
        blockchainVerified: true,
        status: 'completed'
      },
      { new: true }
    );
    
    // If no transaction found, try to update order
    if (!updatedTransaction) {
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        { 
          blockchainTxId: txId || txHash,
          blockchainVerified: true,
          status: 'completed'
        },
        { new: true }
      );
      
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      updatedTransaction = {
        _id: updatedOrder._id,
        blockchainTxId: updatedOrder.blockchainTxId,
        blockchainVerified: true,
        status: updatedOrder.status
      };
    }
    
    res.json(updatedTransaction);
  } catch (error) {
    console.error('Error recording blockchain transaction:', error);
    res.status(500).json({ message: 'Error recording blockchain transaction', error: error.message });
  }
});

// Create a new order (purchase)
router.post('/purchase', async (req, res) => {
  try {
    const { userId, itemId, quantity = 1, price, shippingAddress } = req.body;
    
    if (!userId || !itemId || !price) {
      return res.status(400).json({ message: 'User ID, Item ID, and price are required' });
    }
    
    // Create a new order
    const newOrder = new Order({
      userId,
      itemId,
      quantity,
      price,
      orderDate: new Date(),
      status: 'pending',
      shippingAddress: shippingAddress || {
        street: 'Default Address',
        city: 'Default City',
        state: 'Default State',
        zipCode: '00000',
        country: 'Default Country'
      }
    });
    
    const savedOrder = await newOrder.save();
    
    // Log the purchase for tracking
    console.log(`New purchase recorded: User ${userId} bought item ${itemId} - $${price * quantity}`);
    
    res.status(201).json({
      message: 'Order created successfully',
      order: savedOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

module.exports = router; 