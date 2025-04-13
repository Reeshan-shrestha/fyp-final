import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

function ProductDetails() {
  const { productId } = useParams();
  const { authenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
          const mockProduct = {
            id: productId,
            name: 'Premium Leather Wallet',
            description: 'Handcrafted premium leather wallet with multiple card slots and coin pocket. Made from genuine leather, this wallet offers durability and elegant style for everyday use.',
            price: 79.99,
            image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
            seller: 'LeatherCrafts Co.',
            sellerId: 'seller123',
            category: 'Accessories',
            condition: 'New',
            manufactureDate: '2023-01-15',
            verified: false,
            inStock: true
          };
          setProduct(mockProduct);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load product details. Please try again later.');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleVerify = () => {
    if (!authenticated) {
      setPurchaseError('Please sign in to verify this product');
      return;
    }

    setVerifying(true);
    setPurchaseError(null);

    // Simulate blockchain verification
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
      // Update product state to include verification
      setProduct(prev => ({
        ...prev,
        verified: true
      }));
    }, 2000);
  };

  const handlePurchase = () => {
    if (!authenticated) {
      setPurchaseError('Please sign in to purchase this product');
      return;
    }

    if (!verified) {
      setPurchaseError('Please verify the product before purchasing');
      return;
    }

    setPurchasing(true);
    setPurchaseError(null);

    // Simulate purchase transaction
    setTimeout(() => {
      setPurchasing(false);
      setPurchased(true);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="product-detail">
        <div className="loading">Loading product details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail">
        <div className="error-message">{error}</div>
        <Link to="/products" className="back-link">Return to Products</Link>
      </div>
    );
  }

  if (purchased) {
    return (
      <div className="product-detail">
        <h2 className="product-title">Order Complete</h2>
        <div className="order-success">
          <div className="success-icon">✓</div>
          <h3>Thank you for your purchase!</h3>
          <p>Your transaction has been processed successfully.</p>
          
          <div className="order-summary">
            <h4>Order Summary</h4>
            <div className="order-item">
              <span>Product:</span>
              <span>{product.name}</span>
            </div>
            <div className="order-item">
              <span>Price:</span>
              <span>${product.price.toFixed(2)}</span>
            </div>
            <div className="order-item total">
              <span>Total:</span>
              <span>${product.price.toFixed(2)}</span>
            </div>
          </div>
          
          <Link to="/products" className="back-link">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <h1 className="product-title">{product.name}</h1>
      
      <div className="product-content">
        <div className="product-image-container">
          <img src={product.image} alt={product.name} className="product-image" />
        </div>
        
        <div className="product-info">
          {product.verified && (
            <div className="verified-badge">
              <span>✓</span> Verified on Blockchain
            </div>
          )}
          
          <div className="product-price">
            <span className="product-price-currency">$</span>{product.price.toFixed(2)}
          </div>
          
          <div className="product-meta">
            <div className="meta-item">
              <span className="meta-label">Seller</span>
              <span className="meta-value">{product.seller}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Category</span>
              <span className="meta-value">{product.category}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Condition</span>
              <span className="meta-value">{product.condition}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Date</span>
              <span className="meta-value">{product.manufactureDate}</span>
            </div>
          </div>
          
          <p className="product-description">{product.description}</p>
          
          {product.inStock ? (
            <div className="status-badge in-stock">In Stock</div>
          ) : (
            <div className="status-badge out-of-stock">Out of Stock</div>
          )}
          
          {purchaseError && (
            <div className="error-message">{purchaseError}</div>
          )}
          
          <div className="product-actions">
            <button 
              className="verify-button" 
              onClick={handleVerify} 
              disabled={verifying || verified || !product.inStock}
            >
              {verifying ? 'Verifying...' : verified ? 'Verified ✓' : 'Verify Product'}
            </button>
            
            <button 
              className="buy-button" 
              onClick={handlePurchase} 
              disabled={purchasing || !verified || !product.inStock}
            >
              {purchasing ? 'Processing...' : 'Buy Now'}
            </button>
          </div>
          
          <div className="seller-info">
            <div className="seller-avatar">
              {product.seller.charAt(0)}
            </div>
            <div className="seller-details">
              <div className="seller-name">{product.seller}</div>
              <div className="seller-reputation">Trusted Seller</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails; 