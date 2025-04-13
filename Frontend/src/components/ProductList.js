import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as apiService from '../services/api';
import config from '../config';
import './ProductList.css';
import SupplyChainTracker from '../components/SupplyChainTracker';
import ProductReviews from '../components/ProductReviews';

const ProductList = () => {
  const navigate = useNavigate();
  const { userId, authenticated, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPurchase, setProcessingPurchase] = useState(null);
  const [purchaseErrors, setPurchaseErrors] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const [filters, setFilters] = useState({
    category: 'all',
    sortBy: 'newest',
    verifiedOnly: false
  });
  const [animatedProducts, setAnimatedProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');

  // Import categories from config
  const categories = config.SUPPORTED_CATEGORIES;

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching products with filters:', filters);
      let productsData = await apiService.getProducts(filters);
      console.log('Received products:', productsData);
      
      // Filter products based on category if not 'all'
      if (filters.category !== 'all') {
        productsData = productsData.filter(product => 
          product.category?.toLowerCase() === filters.category.toLowerCase()
        );
      }
      
      setProducts(productsData);
      
      // Animate products appearing one by one
      const animationDelay = 100;
      setAnimatedProducts([]);
      
      productsData.forEach((product, index) => {
        setTimeout(() => {
          setAnimatedProducts(prev => [...prev, product._id || product.id]);
        }, index * animationDelay);
      });
      
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Get image source with fallback handling
  const getImageSource = (product) => {
    const productId = product._id || product.id;
    if (imageErrors[productId] || !product.imageUrl) {
      // Use category-specific fallback images with better Unsplash photos
      const categoryFallbacks = {
        'electronics': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=500&q=60',
        'clothing': 'https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=500&q=60',
        'food': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=500&q=60',
        'other': 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=500&q=60'
      };
      return categoryFallbacks[product.category?.toLowerCase()] || 
        'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=500&q=60';
    }
    return product.imageUrl;
  };

  // Render products section
  const renderProducts = () => {
    if (products.length === 0 && !loading) {
      return (
        <div className="no-products">
          <p>No products found matching your criteria.</p>
          <button 
            onClick={() => setFilters({
              category: 'all',
              sortBy: 'newest',
              verifiedOnly: false
            })}
            className="reset-filters-btn"
          >
            Reset Filters
          </button>
        </div>
      );
    }

    return (
      <div className="products-grid">
        {products.map((product) => {
          const productId = product._id || product.id;
          const isAnimated = animatedProducts.includes(productId);
          
          return (
            <div 
              key={productId}
              className={`product-card ${isAnimated ? 'show' : ''}`}
            >
              <div className="product-image-container">
                <Link to={`/product/${productId}`}>
                  <img 
                    src={getImageSource(product)} 
                    alt={product.name}
                    className="product-image"
                    onError={() => handleImageError(productId)}
                  />
                  {product.verified && (
                    <div className="verified-badge">
                      <span>✓</span> Verified
                    </div>
                  )}
                </Link>
              </div>
              
              <div className="product-details">
                <Link to={`/product/${productId}`} className="product-name">
                  {product.name}
                </Link>
                
                <div className="product-meta">
                  <span className="product-category">{product.category}</span>
                  <span className="product-seller">by {product.seller}</span>
                </div>
                
                <div className="product-price">
                  ${product.price?.toFixed(2)}
                </div>
                
                <div className="product-actions">
                  <Link to={`/product/${productId}`} className="view-details-btn">
                    View Details
                  </Link>
                  
                  <button 
                    className="buy-btn"
                    onClick={(e) => handleBuyNow(e, productId)}
                    disabled={processingPurchase === productId}
                  >
                    {processingPurchase === productId ? 'Processing...' : 'Buy Now'}
                  </button>
                </div>
                
                {purchaseErrors[productId] && (
                  <div className="error-message">
                    {purchaseErrors[productId]}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  const handleImageError = (productId) => {
    console.log(`Image failed to load for product ${productId}, using fallback`);
    setImageErrors(prev => ({
      ...prev,
      [productId]: true
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (name === 'category') {
      setActiveCategory(value);
    }
  };

  const handleBuyNow = async (e, productId) => {
    e.preventDefault(); // Prevent navigation to product detail
    
    // Clear any previous errors for this product
    setPurchaseErrors(prev => ({
      ...prev,
      [productId]: null
    }));
    
    try {
      // Check if user is logged in and not in guest mode
      if (!authenticated || user?.username === 'Guest User') {
        // Redirect to sign-in page with return URL
        navigate(`/signin?returnTo=/products`);
        return;
      }
      
      // Start purchase process
      setProcessingPurchase(productId);
      
      // Find product in our state
      const product = products.find(p => p._id === productId || p.id === productId);
      if (!product) {
        throw new Error('Product not found');
      }
      
      // Create order data
      const orderData = {
        productId: productId,
        userId: userId,
        quantity: 1,
        totalAmount: product.price,
        shippingAddress: '123 Demo Street, Test City, TS 12345'
      };
      
      // Use API service to create order
      const orderResponse = await apiService.createOrder(orderData);
      
      // Handle success - redirect to product page with success message
      window.location.href = `/product/${productId}?orderSuccess=true&orderId=${orderResponse.orderId || 'ORD' + Math.random().toString(36).substring(2, 10)}`;
      
    } catch (error) {
      console.error("Error making purchase:", error);
      setPurchaseErrors(prev => ({
        ...prev,
        [productId]: "Failed to complete purchase. Please try again."
      }));
    } finally {
      setProcessingPurchase(null);
    }
  };

  // Format price with commas for thousands
  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Render loading skeleton
  if (loading && products.length === 0) {
    return (
      <div className="products-container">
        <h1>Available Products</h1>
        
        <div className="filters">
          <div className="filter-item skeleton"></div>
          <div className="filter-item skeleton"></div>
          <div className="filter-item skeleton"></div>
        </div>
        
        <div className="products-grid">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="product-card skeleton-card">
              <div className="skeleton-image"></div>
              <div className="skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-price"></div>
                <div className="skeleton-text"></div>
              </div>
              <div className="skeleton-actions">
                <div className="skeleton-button"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="products-container">
      <h1>Available Products</h1>
      
      <div className="filters">
        <div className="category-filters">
          <button
            className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange({ target: { name: 'category', value: 'all' } })}
          >
            All
          </button>
          
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => handleFilterChange({ target: { name: 'category', value: category.id } })}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
        
        <div className="secondary-filters">
          <div className="sort-filter">
            <label htmlFor="sortBy">Sort by</label>
            <select 
              id="sortBy" 
              name="sortBy" 
              value={filters.sortBy}
              onChange={handleFilterChange}
            >
              {config.SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="verified-filter">
            <input
              type="checkbox"
              id="verifiedOnly"
              name="verifiedOnly"
              checked={filters.verifiedOnly}
              onChange={handleFilterChange}
            />
            <label htmlFor="verifiedOnly">Verified Products Only</label>
          </div>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {renderProducts()}
    </div>
  );
};

export default ProductList; 