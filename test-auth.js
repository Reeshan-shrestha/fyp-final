const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:30061';
const TEST_USER = {
  username: 'testuser123',
  email: 'testuser123@example.com',
  password: 'password123',
  role: 'user'
};

// Test registration
async function testRegistration() {
  try {
    console.log('Testing registration...');
    const response = await axios.post(`${API_URL}/api/auth/register`, TEST_USER);
    console.log('Registration successful:', response.data);
    return response.data.token;
  } catch (error) {
    console.error('Registration failed:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Test login
async function testLogin() {
  try {
    console.log('Testing login...');
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      username: TEST_USER.username,
      password: TEST_USER.password
    });
    console.log('Login successful:', response.data);
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Main test function
async function runTests() {
  console.log('Starting authentication tests...');
  
  // Try registration
  const registrationToken = await testRegistration();
  
  // Try login
  const loginToken = await testLogin();
  
  if (registrationToken || loginToken) {
    console.log('At least one test passed successfully.');
  } else {
    console.log('All tests failed.');
  }
}

// Run the tests
runTests(); 