const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Product = require('../models/Product');
const express = require('express');
const productRoutes = require('../routes/productRoutes');

let mongoServer;
let app;

beforeAll(async () => {
  // Create an in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Close any existing connections
  await mongoose.disconnect();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
  
  // Create a new Express app instance for testing
  app = express();
  app.use(express.json());
  app.use('/api/products', productRoutes);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear the products collection before each test
  await Product.deleteMany({});
});

describe('Product Listing Tests', () => {
  test('Only active products should be returned in listings', async () => {
    // Create test products with different statuses
    const testProducts = [
      {
        name: 'Active Product 1',
        description: 'Test product 1',
        price: 99.99,
        status: 'active',
        category: 'electronics',
        seller: 'testSeller1',
        imageUrl: 'https://example.com/image1.jpg',
        countInStock: 10
      },
      {
        name: 'Active Product 2',
        description: 'Test product 2',
        price: 149.99,
        status: 'active',
        category: 'clothing',
        seller: 'testSeller1',
        imageUrl: 'https://example.com/image2.jpg',
        countInStock: 5
      },
      {
        name: 'Inactive Product',
        description: 'Test product 3',
        price: 199.99,
        status: 'inactive',
        category: 'electronics',
        seller: 'testSeller2',
        imageUrl: 'https://example.com/image3.jpg',
        countInStock: 0
      }
    ];

    // Insert test products into the database
    await Product.insertMany(testProducts);

    // Make request to get products
    const response = await request(app)
      .get('/api/products')
      .expect(200);

    // Verify response
    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBeTruthy();
    
    // Check that only active products are returned
    expect(response.body.length).toBe(2);
    response.body.forEach(product => {
      expect(product.status).toBe('active');
    });

    // Verify specific products
    const productNames = response.body.map(p => p.name);
    expect(productNames).toContain('Active Product 1');
    expect(productNames).toContain('Active Product 2');
    expect(productNames).not.toContain('Inactive Product');
  });
}); 