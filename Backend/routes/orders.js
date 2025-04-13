const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

// Create a new order
router.post('/', auth, async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod, status } = req.body;

    // Validate required fields
    if (!items || !items.length || !totalAmount) {
      return res.status(400).json({ message: 'Missing required fields' });
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
        return res.status(400).json({ message: 'Invalid product reference in order items' });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${productId} not found` });
      }

      // Skip stock validation for demo purposes
      // if (product.countInStock < item.quantity) {
      //   return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      // }

      orderItems.push({
        product: productId,
        quantity: item.quantity,
        price: item.price || product.price
      });
    }

    // Create order
    const order = new Order({
      user: req.user.id,
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

    const createdOrder = await order.save();

    // Update product stock (commented out for demo purposes)
    // for (const item of items) {
    //   const productId = item.product || item.productId;
    //   await Product.findByIdAndUpdate(productId, {
    //     $inc: { countInStock: -item.quantity }
    //   });
    // }

    res.status(201).json({
      message: 'Order created successfully',
      order: createdOrder
    });
  } catch (error) {
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

module.exports = router; 