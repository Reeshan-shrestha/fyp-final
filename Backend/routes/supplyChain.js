const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { auth, admin } = require('../middleware/auth');
const ipfsService = require('../services/ipfsService');

// Record a supply chain event
router.post('/record', auth, async (req, res) => {
  try {
    const { productId, event, location, details } = req.body;
    
    if (!productId || !event) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Create supply chain event
    const supplyChainEvent = {
      productId,
      event,
      location: location || 'Unknown',
      timestamp: new Date(),
      details: details || {},
      recordedBy: req.user.id
    };
    
    // Upload to IPFS and get the CID
    const ipfsCid = await ipfsService.uploadToIPFS(supplyChainEvent);
    
    // Save event reference to product history
    if (!product.supplyChainHistory) {
      product.supplyChainHistory = [];
    }
    
    product.supplyChainHistory.push({
      event,
      location,
      timestamp: new Date(),
      ipfsCid,
      details
    });
    
    await product.save();
    
    res.status(201).json({
      success: true,
      data: {
        event: supplyChainEvent,
        ipfsCid
      }
    });
  } catch (error) {
    console.error('Error recording supply chain event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get supply chain history for a product
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // If no history exists yet, provide mock data
    if (!product.supplyChainHistory || product.supplyChainHistory.length === 0) {
      // Get product category
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Define supply chain timelines based on product category
      const timelines = {
        electronics: {
          manufacturing: 45, // days
          packaging: 2,
          shipping: 30,
          storage: 7,
          retail: 3
        },
        clothing: {
          manufacturing: 30,
          packaging: 1,
          shipping: 25,
          storage: 5,
          retail: 2
        },
        food: {
          manufacturing: 7,
          packaging: 1,
          shipping: 5,
          storage: 2,
          retail: 1
        },
        other: {
          manufacturing: 20,
          packaging: 2,
          shipping: 15,
          storage: 5,
          retail: 3
        }
      };

      const timeline = timelines[product.category] || timelines.other;
      const now = Date.now();
      const msPerDay = 24 * 60 * 60 * 1000;

      // Mock supply chain data with realistic timelines
      const events = [
        {
          eventType: 'MANUFACTURED',
          timestamp: new Date(now - timeline.manufacturing * msPerDay).toISOString(),
          location: getManufacturingLocation(product.category),
          details: 'Product assembled and tested for quality assurance',
          transactionHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
        },
        {
          eventType: 'PACKAGED',
          timestamp: new Date(now - (timeline.manufacturing - timeline.packaging) * msPerDay).toISOString(),
          location: getPackagingLocation(product.category),
          details: 'Product packaged for international shipping',
          transactionHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
        },
        {
          eventType: 'SHIPPED',
          timestamp: new Date(now - (timeline.manufacturing - timeline.packaging - timeline.shipping) * msPerDay).toISOString(),
          location: getShippingLocation(product.category),
          details: 'Product shipped via ocean freight',
          transactionHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
        },
        {
          eventType: 'STORED',
          timestamp: new Date(now - (timeline.manufacturing - timeline.packaging - timeline.shipping - timeline.storage) * msPerDay).toISOString(),
          location: getStorageLocation(product.category),
          details: 'Product received and stored in warehouse',
          transactionHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
        },
        {
          eventType: 'RETAIL',
          timestamp: new Date(now - (timeline.manufacturing - timeline.packaging - timeline.shipping - timeline.storage - timeline.retail) * msPerDay).toISOString(),
          location: getRetailLocation(product.category),
          details: 'Product prepared for retail distribution',
          transactionHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')
        }
      ];
      
      return res.json({
        productId,
        events,
        verified: true,
        isMockData: true
      });
    }
    
    // Return actual product history
    res.json({
      productId,
      events: product.supplyChainHistory,
      verified: true,
      isMockData: false
    });
  } catch (error) {
    console.error('Error fetching supply chain history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify a supply chain event via IPFS
router.get('/verify/:ipfsCid', async (req, res) => {
  try {
    const { ipfsCid } = req.params;
    
    // Get data from IPFS
    const ipfsData = await ipfsService.getFromIPFS(ipfsCid);
    
    if (!ipfsData) {
      return res.status(404).json({ message: 'IPFS data not found' });
    }
    
    res.json({
      verified: true,
      data: ipfsData
    });
  } catch (error) {
    console.error('Error verifying from IPFS:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper functions for location generation
function getManufacturingLocation(category) {
  const locations = {
    electronics: 'Shenzhen Electronics Manufacturing Hub, China',
    clothing: 'Dhaka Garment Factory, Bangladesh',
    food: 'Local Food Processing Plant, USA',
    other: 'Manufacturing Facility, China'
  };
  return locations[category] || locations.other;
}

function getPackagingLocation(category) {
  const locations = {
    electronics: 'Quality Control & Packaging Center, Shenzhen, China',
    clothing: 'Quality Control & Packaging Center, Dhaka, Bangladesh',
    food: 'Food Safety & Packaging Center, USA',
    other: 'Packaging Center, China'
  };
  return locations[category] || locations.other;
}

function getShippingLocation(category) {
  const locations = {
    electronics: 'Shenzhen Port, China',
    clothing: 'Chittagong Port, Bangladesh',
    food: 'Local Distribution Center, USA',
    other: 'Shanghai Port, China'
  };
  return locations[category] || locations.other;
}

function getStorageLocation(category) {
  const locations = {
    electronics: 'Electronics Distribution Center, Los Angeles, USA',
    clothing: 'Fashion Distribution Center, New York, USA',
    food: 'Food Distribution Center, Chicago, USA',
    other: 'Central Warehouse, Los Angeles, USA'
  };
  return locations[category] || locations.other;
}

function getRetailLocation(category) {
  const locations = {
    electronics: 'Electronics Retail Center, San Francisco, USA',
    clothing: 'Fashion Retail Center, New York, USA',
    food: 'Local Supermarket, Chicago, USA',
    other: 'Retail Distribution Center, Chicago, USA'
  };
  return locations[category] || locations.other;
}

module.exports = router; 