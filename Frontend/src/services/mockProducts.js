// Mock product data for the application
const mockProducts = [
  {
    _id: 'prod1',
    name: 'MacBook Pro M2',
    description: 'Latest model with advanced features and high-resolution display',
    price: 1299.99,
    category: 'electronics',
    imageUrl: 'https://via.placeholder.com/300x300?text=Laptop',
    stock: 10,
    createdAt: '2023-08-01T10:00:00.000Z',
    isVerified: true,
    seller: 'seller1'  // TechVision
  },
  {
    _id: 'prod2',
    name: 'Sony WH-1000XM5',
    description: 'Noise cancelling headphones with premium sound quality',
    price: 399.99,
    category: 'electronics',
    imageUrl: 'https://via.placeholder.com/300x300?text=Headphones',
    stock: 15,
    createdAt: '2023-08-02T11:30:00.000Z',
    isVerified: true,
    seller: 'seller1'  // TechVision
  },
  {
    _id: 'prod3',
    name: 'Nike Air Max 2023',
    description: 'Latest athletic shoes with advanced comfort technology',
    price: 179.99,
    category: 'clothing',
    imageUrl: 'https://via.placeholder.com/300x300?text=Shoes',
    stock: 25,
    createdAt: '2023-08-03T14:20:00.000Z',
    isVerified: false,
    seller: 'seller2'  // SportStyle
  },
  {
    _id: 'prod4',
    name: 'Adidas Pro Training Set',
    description: 'Complete training gear for professional athletes',
    price: 89.99,
    category: 'clothing',
    imageUrl: 'https://via.placeholder.com/300x300?text=Training',
    stock: 20,
    createdAt: '2023-08-04T09:45:00.000Z',
    isVerified: true,
    seller: 'seller2'  // SportStyle
  },
  {
    _id: 'prod5',
    name: 'Artisanal Coffee Collection',
    description: 'Premium coffee beans sourced from around the world',
    price: 49.99,
    category: 'food',
    imageUrl: 'https://via.placeholder.com/300x300?text=Coffee',
    stock: 30,
    createdAt: '2023-08-05T16:10:00.000Z',
    isVerified: false,
    seller: 'seller3'  // GourmetDelights
  },
  {
    _id: 'prod6',
    name: 'Luxury Chocolate Box',
    description: 'Handcrafted chocolate assortment from master chocolatiers',
    price: 39.99,
    category: 'food',
    imageUrl: 'https://via.placeholder.com/300x300?text=Chocolate',
    stock: 25,
    createdAt: '2023-08-06T13:15:00.000Z',
    isVerified: true,
    seller: 'seller3'  // GourmetDelights
  },
  {
    _id: 'prod7',
    name: 'Designer Sunglasses Collection',
    description: 'Premium sunglasses with UV protection and stylish design',
    price: 159.99,
    category: 'clothing',
    imageUrl: 'https://via.placeholder.com/300x300?text=Sunglasses',
    stock: 15,
    createdAt: '2023-08-07T11:25:00.000Z',
    isVerified: true,
    seller: 'seller4'  // FashionFusion
  },
  {
    _id: 'prod8',
    name: 'Leather Weekend Bag',
    description: 'Handcrafted leather bag perfect for short trips',
    price: 199.99,
    category: 'clothing',
    imageUrl: 'https://via.placeholder.com/300x300?text=Bag',
    stock: 10,
    createdAt: '2023-08-08T08:50:00.000Z',
    isVerified: false,
    seller: 'seller4'  // FashionFusion
  },
  {
    _id: 'prod9',
    name: 'Smart Home Hub Pro',
    description: 'Central control for all your smart home devices',
    price: 299.99,
    category: 'electronics',
    imageUrl: 'https://via.placeholder.com/300x300?text=SmartHub',
    stock: 20,
    createdAt: '2023-08-09T14:30:00.000Z',
    isVerified: true,
    seller: 'seller5'  // SmartHome
  },
  {
    _id: 'prod10',
    name: 'Security Camera System',
    description: 'Advanced security cameras with motion detection',
    price: 449.99,
    category: 'electronics',
    imageUrl: 'https://via.placeholder.com/300x300?text=Camera',
    stock: 12,
    createdAt: '2023-08-10T10:15:00.000Z',
    isVerified: false,
    seller: 'seller5'  // SmartHome
  }
];

// Seller ID to username mapping
const sellerMapping = {
  'seller1': 'TechVision',
  'seller2': 'SportStyle',
  'seller3': 'GourmetDelights',
  'seller4': 'FashionFusion',
  'seller5': 'SmartHome'
};

// Username to seller ID mapping
const usernameToSellerId = {
  'TechVision': 'seller1',
  'SportStyle': 'seller2',
  'GourmetDelights': 'seller3',
  'FashionFusion': 'seller4',
  'SmartHome': 'seller5'
};

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

// Get products for a specific seller
export const getSellerProducts = (sellerId) => {
  // If sellerId looks like a username instead of an ID, convert it
  if (sellerId.startsWith('TechVision') || 
      sellerId.startsWith('SportStyle') || 
      sellerId.startsWith('GourmetDelights') || 
      sellerId.startsWith('FashionFusion') || 
      sellerId.startsWith('SmartHome')) {
    // Extract the username part
    const username = sellerId.split('_')[0];
    sellerId = usernameToSellerId[username] || sellerId;
  }
  
  // Return products filtered by seller ID
  return mockProducts.filter(product => product.seller === sellerId);
};

// Get a single product by ID
export const getProductById = (productId) => {
  return mockProducts.find(product => 
    product._id === productId || product.id === productId
  );
};

export default mockProducts; 