/**
 * Product Creation Test Script - Testing both valid and invalid cases
 */

const axios = require('axios');
const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const API_URL = 'http://localhost:3006/api';

const testProductCreation = async () => {
  console.log('\n==== Product Creation Test Suite ====\n');
  
  let testProduct = null;
  let authToken = null;

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    console.log('Connected to MongoDB for testing\n');

    // Step 1: Login to get auth token
    console.log('Step 1: Obtaining authentication token...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    authToken = loginResponse.data.token;
    console.log('Authentication successful\n');

    // Test Case 1: Missing Required Field
    console.log('Test Case 1: Missing Required Field');
    console.log('Objective: To confirm missing required fields cause a ValidationError');
    console.log('Action: Creating product without the name field...\n');

    const invalidProduct = {
      description: 'A test product created by automated testing',
      price: 99.99,
      category: 'electronics',
      countInStock: 100,
      seller: 'admin',
      sellerName: 'admin',
      sellerId: loginResponse.data.user._id,
      imageUrl: 'https://example.com/test-image.jpg',
      manufacturer: 'Test Manufacturer',
      brand: 'Test Brand',
      model: 'Test Model'
    };

    console.log('Invalid Product Payload (Missing name):');
    console.log(JSON.stringify(invalidProduct, null, 2));
    console.log();

    try {
      await axios.post(`${API_URL}/products`, invalidProduct, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Test Case 1 Failed: Expected validation error but got success');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Test Case 1 Passed:');
        console.log('Expected Result: HTTP 400 Bad Request with ValidationError');
        console.log(`Actual Result: HTTP ${error.response.status} - ${error.response.data.error}`);
      } else {
        console.log('❌ Test Case 1 Failed: Unexpected error');
        console.log('Error:', error.message);
      }
    }

    // Test Case 2: Valid Product Creation
    console.log('\nTest Case 2: Valid Product Creation');
    console.log('Objective: To verify that a valid payload creates a new product document');
    console.log('Action: Creating new product with all required fields...\n');

    testProduct = {
      name: `Test Product ${Date.now()}`,
      description: 'A test product created by automated testing',
      price: 99.99,
      category: 'electronics',
      countInStock: 100,
      seller: 'admin',
      sellerName: 'admin',
      sellerId: loginResponse.data.user._id,
      imageUrl: 'https://example.com/test-image.jpg',
      manufacturer: 'Test Manufacturer',
      brand: 'Test Brand',
      model: 'Test Model'
    };

    console.log('Valid Product Payload:');
    console.log(JSON.stringify(testProduct, null, 2));
    console.log();

    try {
      const response = await axios.post(`${API_URL}/products`, testProduct, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 201) {
        // Verify product exists in database
        const productId = response.data.id || response.data._id;
        const dbProduct = await Product.findById(productId);

        if (dbProduct) {
          console.log('✅ Test Case 2 Passed:');
          console.log('Expected Result: HTTP 201 Created + New product in database');
          console.log(`Actual Result: HTTP ${response.status} - Product created with ID: ${dbProduct._id}`);
          console.log('\nDatabase Verification:');
          console.log(`- Name matches: ${dbProduct.name === testProduct.name}`);
          console.log(`- Price matches: ${dbProduct.price === testProduct.price}`);
          console.log(`- Category matches: ${dbProduct.category === testProduct.category}`);
          console.log(`- Seller matches: ${dbProduct.seller === testProduct.seller}`);
          
          // Store the product ID for cleanup
          testProduct = dbProduct;
        } else {
          console.log('❌ Test Case 2 Failed: Product not found in database');
        }
      } else {
        console.log('❌ Test Case 2 Failed: Unexpected status code');
        console.log(`Received: HTTP ${response.status}`);
      }
    } catch (error) {
      console.log('❌ Test Case 2 Failed:');
      if (error.response) {
        console.log(`Error: HTTP ${error.response.status} - ${error.response.data.message || 'Product creation failed'}`);
        console.log('Error details:', error.response.data);
      } else {
        console.log('Error:', error.message);
      }
    }

  } catch (error) {
    console.error('Error during test suite:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  } finally {
    // Clean up test product if it was created
    if (testProduct && testProduct._id) {
      try {
        await Product.findByIdAndDelete(testProduct._id);
        console.log('\nTest cleanup: Test product removed from database');
      } catch (err) {
        console.error('Error cleaning up test product:', err.message);
      }
    }

    // Disconnect from MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('Test suite completed. Disconnected from MongoDB');
    }
  }
};

// Run the test suite
console.log('Starting Product Creation Test Suite...');
testProductCreation().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
}); 