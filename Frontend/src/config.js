// Dynamic backend port detection mechanism
const detectBackendPort = () => {
  // Default ports to try in order
  const possiblePorts = [3006, 30061, 3005, 30051, 3007];
  const hostname = 'localhost';
  let currentPort = sessionStorage.getItem('detected_backend_port');
  
  // If we already found a working port in this session, use it
  if (currentPort) {
    console.log(`Using previously detected backend port: ${currentPort}`);
    return `http://${hostname}:${currentPort}`;
  }
  
  // Otherwise, set to first port and let the API service handle fallbacks
  const initialPort = possiblePorts[0];
  
  // Setup detection logic - this runs after initial render
  const detectPort = async () => {
    // Test each port sequentially
    for (const port of possiblePorts) {
      try {
        console.log(`Testing backend on port ${port}...`);
        // We'll use fetch directly here to avoid circular dependency with the API service
        const response = await fetch(`http://${hostname}:${port}/api/auth/test`, { method: 'GET' });
        
        if (response.ok) {
          console.log(`Backend detected on port ${port}`);
          sessionStorage.setItem('detected_backend_port', port);
          return;
        }
      } catch (error) {
        console.log(`Port ${port} not available: ${error.message}`);
      }
    }
    console.warn('Could not detect backend port. Using mock data fallback.');
  };
  
  // Run the detection in the background after a slight delay
  setTimeout(detectPort, 500);
  
  // Return the initial port for now
  return `http://${hostname}:${initialPort}`;
};

const config = {
  API_BASE_URL: detectBackendPort(),
  IPFS_GATEWAY: 'https://ipfs.io/ipfs',
  SUPPORTED_CATEGORIES: [
    { id: 'electronics', name: 'Electronics', icon: '🔌' },
    { id: 'clothing', name: 'Clothing', icon: '👕' },
    { id: 'food', name: 'Food', icon: '🍽️' },
    { id: 'other', name: 'Other', icon: '📦' }
  ],
  SORT_OPTIONS: [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'verified', label: 'Verified First' }
  ],
  PRICE_RANGE: {
    min: 0,
    max: 1000000
  },
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  MAX_IMAGES_PER_PRODUCT: 5,
  
  // Authentication settings
  AUTH: {
    TOKEN_KEY: 'chainbazzar_auth_token',
    USER_KEY: 'chainbazzar_user'
  },
  
  // Set to true to use mock data if API fails
  USE_MOCK_API: true
};

export default config; 