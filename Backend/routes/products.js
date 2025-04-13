const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const { Web3 } = require('web3');
const IPFS = require('ipfs-http-client');
const multer = require('multer');
const path = require('path');

// Configure Web3
const web3 = new Web3('http://localhost:8545'); // Replace with your blockchain network
const contractABI = require('../contracts/ProductVerification.json').abi;
const contractAddress = process.env.PRODUCT_CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Configure IPFS
const ipfs = IPFS.create({ host: 'localhost', port: '5001', protocol: 'http' });

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).array('images', 5); // Allow up to 5 images

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Create a new product
router.post('/', auth, upload, async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const images = req.files.map(file => `/uploads/${file.filename}`);

    // Upload images to IPFS
    const ipfsResults = await Promise.all(
      images.map(image => ipfs.add(Buffer.from(image)))
    );
    const ipfsHashes = ipfsResults.map(result => result.path);

    // Create product on blockchain
    const result = await contract.methods.addProduct(
      name,
      description,
      web3.utils.toWei(price.toString(), 'ether'),
      ipfsHashes[0] // Use first image hash as main product hash
    ).send({ from: req.user.walletAddress });

    // Create product in database
    const product = new Product({
      name,
      description,
      price,
      category,
      seller: req.user._id,
      sellerAddress: req.user.walletAddress,
      images,
      blockchainData: {
        contractAddress,
        tokenId: result.events.ProductAdded.returnValues.id,
        transactionHash: result.transactionHash,
        ipfsHash: ipfsHashes[0],
        isVerified: false
      }
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const query = {};
    
    // Apply category filter if provided
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Apply verified filter if needed
    if (req.query.verified === 'true') {
      query.verified = true;
    }
    
    // Find products with seller populated
    const products = await Product.find(query)
      .populate('seller', 'username email')
      .sort({ createdAt: -1 });
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'username email');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get blockchain data
    const blockchainProduct = await contract.methods.getProduct(product.blockchainData.tokenId).call();
    
    res.json({
      ...product.toObject(),
      blockchainData: {
        ...product.blockchainData,
        blockchainDetails: blockchainProduct
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

// Update a product
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (key !== 'blockchainData' && key !== 'seller' && key !== 'sellerAddress') {
        product[key] = updates[key];
      }
    });

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// Delete a product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await product.remove();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

// Verify a product
router.post('/:id/verify', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify on blockchain
    await contract.methods.verifyProduct(product.blockchainData.tokenId)
      .send({ from: req.user.walletAddress });

    // Update in database
    product.blockchainData.isVerified = true;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error verifying product', error: error.message });
  }
});

module.exports = router; 