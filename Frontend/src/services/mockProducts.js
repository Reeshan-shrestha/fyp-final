// Mock product data for the application
const mockProducts = [
  {
    _id: 'prod1',
    name: 'Smartphone X',
    description: 'Latest model with advanced features and high-resolution camera',
    price: 799.99,
    category: 'electronics',
    imageUrl: 'https://via.placeholder.com/300x300?text=Smartphone',
    stock: 15,
    createdAt: '2023-08-01T10:00:00.000Z',
    isVerified: true
  },
  {
    _id: 'prod2',
    name: 'Leather Wallet',
    description: 'Handcrafted premium leather wallet with multiple compartments',
    price: 59.99,
    category: 'accessories',
    imageUrl: 'https://via.placeholder.com/300x300?text=Wallet',
    stock: 25,
    createdAt: '2023-08-02T11:30:00.000Z',
    isVerified: true
  },
  {
    _id: 'prod3',
    name: 'Wireless Headphones',
    description: 'Noise cancelling headphones with long battery life',
    price: 149.99,
    category: 'electronics',
    imageUrl: 'https://via.placeholder.com/300x300?text=Headphones',
    stock: 10,
    createdAt: '2023-08-03T14:20:00.000Z',
    isVerified: false
  },
  {
    _id: 'prod4',
    name: 'Smart Watch',
    description: 'Track fitness and receive notifications on your wrist',
    price: 199.99,
    category: 'electronics',
    imageUrl: 'https://via.placeholder.com/300x300?text=SmartWatch',
    stock: 8,
    createdAt: '2023-08-04T09:45:00.000Z',
    isVerified: true
  },
  {
    _id: 'prod5',
    name: 'Designer Sunglasses',
    description: 'UV protection with stylish frames',
    price: 129.99,
    category: 'accessories',
    imageUrl: 'https://via.placeholder.com/300x300?text=Sunglasses',
    stock: 12,
    createdAt: '2023-08-05T16:10:00.000Z',
    isVerified: false
  },
  {
    _id: 'prod6',
    name: 'Portable Bluetooth Speaker',
    description: 'Waterproof speaker with rich sound quality',
    price: 89.99,
    category: 'electronics',
    imageUrl: 'https://via.placeholder.com/300x300?text=Speaker',
    stock: 20,
    createdAt: '2023-08-06T13:15:00.000Z',
    isVerified: true
  }
];

// Get all products with optional filtering
export const getAllProducts = (filters = {}) => {
  let filteredProducts = [...mockProducts];
  
  // Apply category filter
  if (filters.category && filters.category !== 'all') {
    filteredProducts = filteredProducts.filter(product => 
      product.category.toLowerCase() === filters.category.toLowerCase()
    );
  }
  
  // Apply verified filter
  if (filters.verifiedOnly) {
    filteredProducts = filteredProducts.filter(product => product.isVerified);
  }
  
  // Apply sorting
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'newest':
        filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filteredProducts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'price-asc':
      case 'price_asc':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
      case 'price_desc':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }
  }
  
  return filteredProducts;
};

// Get a single product by ID
export const getProductById = (productId) => {
  return mockProducts.find(product => 
    product._id === productId || product.id === productId
  );
};

export default mockProducts; 