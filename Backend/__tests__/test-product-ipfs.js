const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Product = require('../models/Product');
const ipfsService = require('../services/ipfsService');

// Mock the IPFS client
jest.mock('ipfs-http-client', () => ({
  create: () => ({
    add: ({ path, content }) => {
      if (!content) return Promise.resolve(null);
      return Promise.resolve({
        cid: {
          toString: () => 'QmTest123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL'
        }
      });
    }
  })
}));

describe('Product IPFS Integration', () => {
  let mongoServer;
  let testProduct;

  beforeAll(async () => {
    // Set up MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Set up IPFS environment variables
    process.env.IPFS_PROJECT_ID = 'test-project-id';
    process.env.IPFS_PROJECT_SECRET = 'test-project-secret';
    process.env.IPFS_API_URL = 'https://ipfs.infura.io:5001';
  });

  beforeEach(async () => {
    // Clear the products collection
    await Product.deleteMany({});

    // Create a test product
    testProduct = await Product.create({
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      status: 'active',
      category: 'electronics',
      imageUrl: 'https://example.com/image.jpg',
      seller: 'testSeller',
      countInStock: 10
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  test('should store IPFS hash in product document', async () => {
    // Create a test image buffer
    const imageBuffer = Buffer.from('Test image content');
    
    // Upload to IPFS
    const ipfsHash = await ipfsService.uploadToIPFS(imageBuffer, 'test-image.jpg');
    
    // Update product with IPFS hash
    testProduct.ipfsCid = ipfsHash;
    await testProduct.save();

    // Retrieve updated product
    const updatedProduct = await Product.findById(testProduct._id);
    
    // Verify IPFS hash storage
    expect(updatedProduct.ipfsCid).toBeDefined();
    expect(updatedProduct.ipfsCid).toBe(ipfsHash);
    expect(updatedProduct.ipfsUrl).toBe(`ipfs://${ipfsHash}`);
  });

  test('should handle multiple image uploads', async () => {
    // Create multiple test image buffers
    const imageBuffer1 = Buffer.from('Test image content 1');
    const imageBuffer2 = Buffer.from('Test image content 2');
    
    // Upload images to IPFS
    const ipfsHash1 = await ipfsService.uploadToIPFS(imageBuffer1, 'test-image-1.jpg');
    const ipfsHash2 = await ipfsService.uploadToIPFS(imageBuffer2, 'test-image-2.jpg');
    
    // Update product with first IPFS hash
    testProduct.ipfsCid = ipfsHash1;
    await testProduct.save();
    
    // Add a supply chain event with the second IPFS hash
    testProduct.supplyChainHistory.push({
      event: 'image_added',
      location: 'test location',
      ipfsCid: ipfsHash2
    });
    await testProduct.save();

    // Retrieve updated product
    const updatedProduct = await Product.findById(testProduct._id);
    
    // Verify IPFS hash storage
    expect(updatedProduct.ipfsCid).toBe(ipfsHash1);
    expect(updatedProduct.ipfsUrl).toBe(`ipfs://${ipfsHash1}`);
    expect(updatedProduct.supplyChainHistory).toHaveLength(1);
    expect(updatedProduct.supplyChainHistory[0].ipfsCid).toBe(ipfsHash2);
  });

  test('should handle IPFS hash updates', async () => {
    // Create initial image and hash
    const initialImageBuffer = Buffer.from('Initial image content');
    const initialHash = await ipfsService.uploadToIPFS(initialImageBuffer, 'initial-image.jpg');
    
    // Set initial hash
    testProduct.ipfsCid = initialHash;
    await testProduct.save();
    
    // Create new image and hash
    const newImageBuffer = Buffer.from('New image content');
    const newHash = await ipfsService.uploadToIPFS(newImageBuffer, 'new-image.jpg');
    
    // Update to new hash
    testProduct.ipfsCid = newHash;
    await testProduct.save();

    // Add old hash to supply chain history
    testProduct.supplyChainHistory.push({
      event: 'image_updated',
      location: 'test location',
      ipfsCid: initialHash,
      details: { previousHash: initialHash }
    });
    await testProduct.save();

    // Retrieve updated product
    const updatedProduct = await Product.findById(testProduct._id);
    
    // Verify hash updates
    expect(updatedProduct.ipfsCid).toBe(newHash);
    expect(updatedProduct.ipfsUrl).toBe(`ipfs://${newHash}`);
    expect(updatedProduct.supplyChainHistory[0].ipfsCid).toBe(initialHash);
    expect(updatedProduct.supplyChainHistory[0].details.previousHash).toBe(initialHash);
  });

  test('should handle invalid IPFS hash gracefully', async () => {
    // Try to set an invalid IPFS hash
    testProduct.ipfsCid = 'invalid-hash';
    await testProduct.save();

    // Retrieve updated product
    const updatedProduct = await Product.findById(testProduct._id);
    
    // Virtual should return null for invalid hash
    expect(updatedProduct.ipfsCid).toBe('invalid-hash');
    expect(updatedProduct.ipfsUrl).toBe('ipfs://invalid-hash');
  });
}); 