const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');
const blockchainInventoryService = require('../services/blockchainInventoryService');
const mongoose = require('mongoose');

// Add this function to handle blockchain inventory reservation
const reserveBlockchainInventory = async (product, quantity) => {
  if (!product.blockchainManaged) {
    return { success: true, message: 'Product not managed on blockchain' };
  }
  
  try {
    const result = await blockchainInventoryService.reserveProductStock(
      product._id.toString(),
      quantity
    );
    
    if (result.success) {
      // Update product with the new stock and transaction details
      const updatedStock = await blockchainInventoryService.getProductStock(product._id.toString());
      if (updatedStock.success) {
        product.countInStock = updatedStock.stock;
        product.blockchainTxHash = result.transactionHash;
        product.blockchainInventoryLastSync = new Date();
        
        // Add to stock history
        product.stockHistory.push({
          previousStock: product.countInStock + quantity,
          newStock: product.countInStock,
          transactionHash: result.transactionHash,
          timestamp: new Date()
        });
        
        await product.save();
      }
    }
    
    return result;
  } catch (error) {
    console.error(`Error reserving blockchain inventory for product ${product._id}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Create a new order
router.post('/', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, totalAmount, shippingAddress, paymentMethod, status, sellerId } = req.body;

    // Validate required fields
    if (!items || !items.length || !totalAmount || !sellerId) {
      return res.status(400).json({ message: 'Missing required fields (items, totalAmount, or sellerId)' });
    }

    // Set default values if missing
    const orderShippingAddress = shippingAddress || {
      street: '123 Default Street',
      city: 'Default City',
      state: 'Default State',
      zipCode: '12345',
      country: 'Default Country'
    };

    const orderPaymentMethod = paymentMethod || 'credit_card';

    // Check product stock and prepare order items
    const orderItems = [];
    for (const item of items) {
      // Handle both formats: item.product or item.productId
      const productId = item.product || item.productId;
      
      if (!productId) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: 'Invalid product reference in order items' });
      }

      const product = await Product.findById(productId);
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: `Product ${productId} not found` });
      }

      // Verify product belongs to the specified seller
      if (product.sellerId.toString() !== sellerId) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Product ${product.name} does not belong to the specified seller` });
      }

      // Validate stock availability
      if (product.countInStock < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      orderItems.push({
        product: productId,
        quantity: item.quantity,
        price: item.price || product.price
      });
    }

    // Create order
    const order = new Order({
      user: req.user.id,
      sellerId: sellerId,
      items: orderItems,
      totalAmount,
      shippingAddress: orderShippingAddress,
      paymentMethod: orderPaymentMethod,
      status: status || 'pending',
      statusHistory: [{
        status: status || 'pending',
        timestamp: new Date(),
        notes: 'Order created'
      }]
    });

    const createdOrder = await order.save({ session });

    // Update product stock
    for (const item of items) {
      const productId = item.product || item.productId;
      await Product.findByIdAndUpdate(
        productId,
        { $inc: { countInStock: -item.quantity } },
        { session }
      );
    }

    // For each item in the order, check if it's managed on blockchain
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      
      if (product && product.blockchainManaged) {
        // Reserve stock on blockchain
        const reserveResult = await reserveBlockchainInventory(product, item.quantity);
        
        if (!reserveResult.success) {
          await session.abortTransaction();
          session.endSession();
          
          return res.status(400).json({
            error: 'Failed to reserve blockchain inventory',
            details: reserveResult.error,
            product: product.name
          });
        }
        
        item.blockchainManaged = true;
        item.blockchainTxHash = reserveResult.transactionHash;
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Order created successfully',
      order: createdOrder
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's orders
router.get('/myorders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name image price');
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name image price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Make sure the user is authorized to view this order
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// User cancels their order
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Make sure the user is authorized to cancel this order
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    // Check if order is in a cancellable state
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({ 
        message: 'Cannot cancel order in current status',
        currentStatus: order.status 
      });
    }

    // Update order status to cancelled
    order.status = 'cancelled';
    
    // Save the order with updated status
    const updatedOrder = await order.save();

    // Restore product stock for each item in the order
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { countInStock: item.quantity }
      });
    }

    res.json({
      message: 'Order cancelled successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 