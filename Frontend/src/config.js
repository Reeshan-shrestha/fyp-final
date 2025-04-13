const config = {
  API_BASE_URL: 'http://localhost:3005',
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
  
  // Set to always try API first, but API service has fallback built-in
  USE_MOCK_API: false
};

export default config; 