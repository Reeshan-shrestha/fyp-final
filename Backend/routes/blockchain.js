const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');

// Get blockchain statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total verified transactions
    const verifiedTransactions = await Transaction.countDocuments({ blockchainVerified: true });
    
    // Get total pending transactions
    const pendingTransactions = await Transaction.countDocuments({ 
      $or: [
        { blockchainVerified: false },
        { blockchainVerified: { $exists: false } }
      ]
    });
    
    // Get unique wallets
    const uniqueWallets = await Transaction.distinct('user').length;
    
    // Calculate total transactions
    const totalTransactions = verifiedTransactions + pendingTransactions;
    
    res.json({
      totalTransactions,
      verifiedTransactions,
      pendingTransactions,
      uniqueWallets
    });
  } catch (error) {
    console.error('Error fetching blockchain stats:', error);
    res.status(500).json({ message: 'Error fetching blockchain stats', error: error.message });
  }
});

// Get daily transaction statistics
router.get('/daily-stats', async (req, res) => {
  try {
    // Get transactions from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const transactions = await Transaction.find({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    // Group transactions by day
    const dailyStats = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    transactions.forEach(tx => {
      const date = new Date(tx.createdAt);
      const dayName = days[date.getDay()];
      
      if (!dailyStats[dayName]) {
        dailyStats[dayName] = {
          transactions: 0,
          verified: 0
        };
      }
      
      dailyStats[dayName].transactions++;
      if (tx.blockchainVerified) {
        dailyStats[dayName].verified++;
      }
    });
    
    // Convert to array for frontend
    const result = Object.keys(dailyStats).map(day => ({
      name: day,
      transactions: dailyStats[day].transactions,
      verified: dailyStats[day].verified
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    res.status(500).json({ message: 'Error fetching daily stats', error: error.message });
  }
});

// Get recent blockchain transactions
router.get('/transactions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Get the most recent transactions with blockchain data
    const transactions = await Transaction.find({
      blockchainTxId: { $exists: true, $ne: null }
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'name email')
    .lean();
    
    // Format transactions for the frontend
    const formattedTransactions = transactions.map(tx => ({
      id: tx.blockchainTxId,
      type: tx.items?.length > 0 ? 'Purchase' : 'Verification',
      walletAddress: tx.user?.walletAddress || 'Unknown',
      timestamp: tx.createdAt,
      amount: `${tx.totalAmount || 0} ETH`,
      status: tx.blockchainVerified ? 'Verified' : 'Pending',
      blockNumber: tx.blockNumber || null
    }));
    
    res.json(formattedTransactions);
  } catch (error) {
    console.error('Error fetching blockchain transactions:', error);
    res.status(500).json({ message: 'Error fetching blockchain transactions', error: error.message });
  }
});

module.exports = router; 