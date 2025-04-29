/**
 * JWT Validation Test Script
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const API_URL = 'http://localhost:3006/api/auth';

const testJWTValidation = async () => {
  console.log('\n==== JWT Validation Test Suite ====\n');

  try {
    console.log('Test Case: JWT Validation');
    console.log('Objective: To test that a valid JWT is correctly decoded and validated');
    console.log('Action: Validating a freshly issued token\n');

    // Step 1: Get a fresh token by logging in
    console.log('Step 1: Obtaining fresh JWT token through login...');
    const loginResponse = await axios.post(`${API_URL}/login`, {
      username: 'admin',
      password: 'admin123'
    });

    if (!loginResponse.data.token) {
      throw new Error('No token received from login');
    }

    const token = loginResponse.data.token;
    console.log(`Token received: ${token.substring(0, 15)}...\n`);

    // Step 2: Validate the token by making an authenticated request
    console.log('Step 2: Validating token with protected endpoint...');
    try {
      const validationResponse = await axios.get(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (validationResponse.status === 200) {
        // Step 3: Decode token to verify payload
        console.log('Step 3: Decoding token payload...');
        const decodedToken = jwt.decode(token);
        
        console.log('\n✅ Test Passed:');
        console.log('Expected Result: Token payload is returned and no errors thrown');
        console.log('Actual Result: Token was decoded successfully');
        console.log('\nToken Verification:');
        console.log('- Token is valid: Yes');
        console.log('- User ID present:', !!decodedToken.id);
        console.log('- Username matches:', decodedToken.username === validationResponse.data.username);
        console.log('\nDecoded Payload:');
        console.log(JSON.stringify({
          id: decodedToken.id,
          username: decodedToken.username,
          iat: new Date(decodedToken.iat * 1000).toISOString(),
          exp: new Date(decodedToken.exp * 1000).toISOString()
        }, null, 2));
      }
    } catch (error) {
      console.log('❌ Test Failed:');
      if (error.response) {
        console.log(`Error: HTTP ${error.response.status} - ${error.response.data.message || 'Token validation failed'}`);
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
  }

  console.log('\nTest suite completed.');
};

// Run the test suite
console.log('Starting JWT Validation Test Suite...');
testJWTValidation().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
}); 