const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require('dotenv');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/auth');
const billingRoutes = require('./routes/billing');
const orderRoutes = require('./routes/orders');
const reviewsRoutes = require('./routes/reviewsRoutes');
const adminRoutes = require('./routes/admin');
const supplyChainRoutes = require('./routes/supplyChain');
const blockchainRoutes = require('./routes/blockchain');
// Import IPFS service
const ipfsService = require('./services/ipfsService');

// Import models
const Item = require("./models/Item");
const Order = require("./models/Order");
const Bill = require("./models/Bill");
const Transaction = require("./models/Transaction");

// Load environment variables
dotenv.config();

let server;

// MongoDB connection options
const mongoOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
};

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/supply-chain', supplyChainRoutes);
app.use('/api/blockchain', blockchainRoutes);

// Serve static files from the public directory
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Get all items
app.get("/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: "Error fetching items" });
  }
});

// Get item by ID
app.get("/items/:id", async (req, res) => {
  try {
    const item = await Item.findOne({ id: req.params.id });
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: "Error fetching item" });
  }
});

// Add new item (admin only)
app.post("/items", async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: "Error creating item" });
  }
});

// Create order and generate bill
app.post("/orders", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, itemId, quantity, totalAmount, shippingAddress } = req.body;
    
    if (!userId || !itemId || !quantity) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if item exists and has enough stock
    const item = await Item.findOne({ id: itemId });
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    if (item.stock < quantity) {
      return res.status(400).json({ error: "Not enough stock" });
    }

    // Calculate amounts
    const subtotal = item.price * quantity;
    const tax = Math.round(subtotal * 0.1); // 10% tax
    const finalAmount = totalAmount || (subtotal + tax);

    // Generate blockchain transaction ID (would be handled by actual blockchain in production)
    const blockchainTxId = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');

    // Create order with blockchain data
    const order = new Order({
      userId,
      itemId,
      quantity,
      price: item.price,
      status: 'pending',
      blockchainTxId,
      blockchainVerified: true,
      blockchainTimestamp: new Date(),
      shippingAddress: shippingAddress || {
        street: '123 Default St',
        city: 'Default City',
        state: 'Default State',
        zipCode: '00000',
        country: 'Default Country'
      }
    });
    await order.save();

    // Update stock
    item.stock -= quantity;
    await item.save();

    // Create a transaction record for the admin dashboard
    const transaction = new Transaction({
      user: userId,
      items: [{
        product: itemId,
        quantity: quantity,
        price: item.price
      }],
      totalAmount: finalAmount,
      status: 'completed',
      paymentMethod: 'Blockchain Payment',
      shippingAddress: order.shippingAddress,
      blockchainTxId,
      blockchainVerified: true
    });
    await transaction.save();

    await session.commitTransaction();
    session.endSession();

    // Return both order and transaction data
    res.status(201).json({
      order,
      transaction,
      blockchainData: {
        txId: blockchainTxId,
        verified: true,
        timestamp: new Date()
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating order:', error);
    res.status(500).json({ error: "Error creating order" });
  }
});

// Get user's orders
app.get("/orders/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: "Error fetching orders" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: "Internal server error" });
});

// Set the port
const PORT = process.env.PORT || 3005;

// Function to find an available port
const findAvailablePort = async (startPort) => {
  let port = startPort;
  const maxPort = startPort + 10; // Try up to 10 ports
  
  while (port < maxPort) {
    try {
      const server = await new Promise((resolve, reject) => {
        const srv = require('http').createServer().listen(port, () => {
          srv.close(() => resolve(port));
        });
        srv.on('error', reject);
      });
      return port;
    } catch (error) {
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${port} is in use, trying ${port + 1}`);
        port += 1;
      } else {
        throw error;
      }
    }
  }
  throw new Error(`Could not find an available port in range ${startPort}-${maxPort-1}`);
};

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI, mongoOptions)
  .then(async () => {
    console.log("DB Connected!");
    try {
      const availablePort = await findAvailablePort(PORT);
      server = app.listen(availablePort, () => {
        console.log(`Server started on port ${availablePort}`);
      });
    } catch (err) {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Starting graceful shutdown...');
  gracefulShutdown();
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Starting graceful shutdown...');
  gracefulShutdown();
});

// Graceful shutdown function
async function gracefulShutdown() {
  try {
    console.log('Starting graceful shutdown...');
    
    // Close the HTTP server
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
      console.log('HTTP server closed');
    }

    // Close MongoDB connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }

    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}
