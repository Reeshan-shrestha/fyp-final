// Mock product data for the application
const mockProducts = [
  {
    _id: 'prod1',
    name: 'MacBook Pro M2',
    description: 'Latest model with improved performance and battery life',
    price: 1299.99,
    category: 'electronics',
    imageUrl: 'https://via.placeholder.com/300x300?text=Macbook',
    stock: 10,
    createdAt: '2023-08-01T08:00:00.000Z',
    isVerified: true,
    seller: 'seller1'  // TechVision
  },
  {
    _id: 'prod2',
    name: 'Sony WH-1000XM5',
    description: 'Premium noise-cancelling headphones with exceptional sound quality',
    price: 399.99,
    category: 'electronics',
    imageUrl: 'https://via.placeholder.com/300x300?text=Headphones',
    stock: 15,
    createdAt: '2023-08-02T09:30:00.000Z',
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
  },
  {
    _id: 'prod11',
    name: 'iPad Pro 2023',
    description: 'The latest iPad Pro with M2 chip and stunning display',
    price: 999.99,
    category: 'electronics',
    imageUrl: 'https://via.placeholder.com/300x300?text=iPad',
    stock: 8,
    createdAt: '2023-09-01T10:00:00.000Z',
    isVerified: true,
    seller: 'TechVision'  // Using username directly instead of ID
  },
  {
    _id: 'prod12',
    name: 'Apple Watch Series 8',
    description: 'Latest Apple Watch with advanced health monitoring',
    price: 499.99,
    category: 'electronics',
    imageUrl: 'https://via.placeholder.com/300x300?text=Watch',
    stock: 12,
    createdAt: '2023-09-02T11:15:00.000Z',
    isVerified: true,
    seller: 'TechVision'  // Using username directly instead of ID
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

// Get products for a specific seller - with enhanced filtering
export const getSellerProducts = (sellerId) => {
  console.log('Getting products for seller ID:', sellerId);
  
  // Try to match seller ID with different formats
  let normalizedSellerId = sellerId;
  let exactMatch = false;
  
  // Case 1: Direct username matching - prioritize this
  if (typeof sellerId === 'string') {
    // If the ID is actually a username (case-insensitive matching)
    if (sellerId.toLowerCase() === 'techvision' || sellerId === 'TechVision') {
      console.log('Direct username match for TechVision');
      // Will match both 'seller1' and 'TechVision' in the product data
      
      // Return products for TechVision - matching both formats
      const techVisionProducts = mockProducts.filter(product => 
        product.seller === 'seller1' || product.seller === 'TechVision'
      );
      
      console.log(`Found ${techVisionProducts.length} products for TechVision`);
      return techVisionProducts;
    }
    
    // Handle username format (e.g., "TechVision_12345")
    if (sellerId.includes('TechVision')) {
      normalizedSellerId = 'seller1';
      exactMatch = true;
    }
    else if (sellerId.includes('SportStyle')) {
      normalizedSellerId = 'seller2';
      exactMatch = true;
    }
    else if (sellerId.includes('GourmetDelights')) {
      normalizedSellerId = 'seller3';
      exactMatch = true;
    }
    else if (sellerId.includes('FashionFusion')) {
      normalizedSellerId = 'seller4';
      exactMatch = true;
    }
    else if (sellerId.includes('SmartHome')) {
      normalizedSellerId = 'seller5';
      exactMatch = true;
    }
    
    // Direct ID matching
    if (sellerId === 'seller1' || sellerId === 'seller2' || sellerId === 'seller3' ||
        sellerId === 'seller4' || sellerId === 'seller5') {
      exactMatch = true;
    }
    
    // Direct matching against usernames
    if (Object.values(sellerMapping).includes(sellerId)) {
      // The ID is a username, get the corresponding seller ID
      normalizedSellerId = usernameToSellerId[sellerId] || sellerId;
      exactMatch = true;
    }
    
    // Handle MongoDB ID formats that may come from real database
    // This is just a fallback if the username-based matching doesn't work
    if (!exactMatch) {
      if (sellerId.startsWith('6')) normalizedSellerId = 'seller1';
      else if (sellerId.startsWith('7')) normalizedSellerId = 'seller2';
      else if (sellerId.startsWith('8')) normalizedSellerId = 'seller3';
      else if (sellerId.startsWith('9')) normalizedSellerId = 'seller4';
      else if (sellerId.startsWith('5')) normalizedSellerId = 'seller5';
    }
  }
  
  console.log('Normalized seller ID:', normalizedSellerId);
  
  // Return products filtered by seller ID with extra verification
  const sellerProducts = mockProducts.filter(product => {
    // First check exact match
    const productSellerId = product.seller || '';
    
    // Ensure we're only returning products that truly belong to this seller
    // Match either by normalized ID, original ID, or seller name
    return (
      productSellerId === normalizedSellerId || 
      productSellerId === sellerId ||
      productSellerId === sellerMapping[normalizedSellerId]
    );
  });
  
  console.log(`Found ${sellerProducts.length} products for seller ${normalizedSellerId}`);
  
  return sellerProducts;
};

// Get a single product by ID
export const getProductById = (productId) => {
  return mockProducts.find(product => 
    product._id === productId || product.id === productId
  );
};

export default mockProducts; 