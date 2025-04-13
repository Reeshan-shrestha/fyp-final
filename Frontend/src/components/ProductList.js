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
      let productsData = await apiService.getProducts(filters);
      
      // Filter products based on category if not 'all'
      if (filters.category !== 'all') {
        productsData = productsData.filter(product => 
          product.category.toLowerCase() === filters.category.toLowerCase()
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
      setError('Failed to fetch products. Please try again later.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
  
  const handleImageError = (productId) => {
    console.log(`Image failed to load for product ${productId}, using fallback`);
    setImageErrors(prev => ({
      ...prev,
      [productId]: true
    }));
  };
  
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
            All Categories
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => handleFilterChange({ target: { name: 'category', value: category.id } })}
            >
              <span className="category-icon">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
        
        <div className="filter-controls">
          <div className="filter-item">
            <label htmlFor="sortBy">Sort by:</label>
            <select 
              id="sortBy" 
              name="sortBy" 
              value={filters.sortBy} 
              onChange={handleFilterChange}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
          
          <div className="filter-item checkbox">
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
      
      {products.length === 0 && !loading ? (
        <div className="no-products">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 5H4C2.9 5 2 5.9 2 7V17C2 18.1 2.9 19 4 19H20C21.1 19 22 18.1 22 17V7C22 5.9 21.1 5 20 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>No products found in {activeCategory === 'all' ? 'any category' : `the ${activeCategory} category`}.</p>
          <button className="btn btn-primary mt-4" onClick={() => {
            setFilters({ category: 'all', sortBy: 'newest', verifiedOnly: false });
            setActiveCategory('all');
          }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => {
            const productId = product._id || product.id;
            const isAnimated = animatedProducts.includes(productId);
            
            return (
              <div 
                key={productId} 
                className={`product-card ${isAnimated ? 'animated' : ''} ${processingPurchase === productId ? 'processing' : ''}`}
              >
                <Link to={`/product/${productId}`} className="product-image-container">
                  <img 
                    src={getImageSource(product)} 
                    alt={product.name} 
                    className="product-image"
                    onError={() => handleImageError(productId)}
                    loading="lazy"
                  />
                  {product.verified && (
                    <div className="verified-badge" title="Blockchain Verified">
                      <span className="verified-icon">✓</span>
                    </div>
                  )}
                </Link>
                
                <div className="product-details">
                  <Link to={`/product/${productId}`} className="product-title">
                    {product.name}
                  </Link>
                  
                  <div className="product-seller">
                    Seller: {product.sellerName || (typeof product.seller === 'string' ? product.seller : product.seller?.username) || 'Unknown'}
                  </div>
                  
                  <div className="product-price">${formatPrice(product.price)}</div>
                  
                  <p className="product-description">{product.description}</p>
                </div>
                
                <div className="product-actions">
                  {purchaseErrors[productId] && (
                    <div className="purchase-error">{purchaseErrors[productId]}</div>
                  )}
                  
                  <button 
                    className={`buy-now-btn ${processingPurchase === productId ? 'processing' : ''}`}
                    onClick={(e) => handleBuyNow(e, productId)}
                    disabled={processingPurchase !== null}
                  >
                    {processingPurchase === productId ? 'Processing...' : 'Buy Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductList; 