import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import Rating from "./Rating";
import close from "../assets/close.svg";
import './Product.css';

const Product = ({ item, provider, account, chainBazzar: contract, togglePop }) => {
  const [order, setOrder] = useState(null);
  const [bill, setBill] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Fallback images based on category
  const categoryFallbacks = {
    electronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    clothing: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    food: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1160&q=80",
    default: "https://via.placeholder.com/400x400?text=Product+Image"
  };

  const getImageSrc = () => {
    if (imageError) {
      return item.category && categoryFallbacks[item.category.toLowerCase()] 
        ? categoryFallbacks[item.category.toLowerCase()] 
        : categoryFallbacks.default;
    }
    return item.image;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const fetchDetails = useCallback(async () => {
    if (!account || !contract) return;

    try {
      const events = await contract.queryFilter("Buy");
      const orders = events.filter(
        (event) =>
          event.args.buyer === account.replace('guest_', '') &&
          event.args.itemId.toString() === item.id.toString()
      );

      if (orders.length === 0) return;
      const order = await contract.orders(account.replace('guest_', ''), orders[0].args.orderId);
      setOrder(order);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  }, [account, contract, item.id]);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (item.stock || 10)) {
      setQuantity(newQuantity);
    }
  };

  const formatDeliveryDate = () => {
    // Get product category
    const category = item.category || 'other';
    
    // Base delivery times (in days) based on category
    const baseDeliveryTimes = {
      electronics: 5,
      clothing: 3,
      food: 2,
      other: 4
    };
    
    // Additional time based on shipping address (if available)
    const shippingTime = {
      'US': 0,
      'CA': 1,
      'EU': 2,
      'ASIA': 3,
      'OTHER': 4
    };
    
    // Calculate base delivery time
    const baseDays = baseDeliveryTimes[category] || baseDeliveryTimes.other;
    
    // Add shipping time based on location
    const shippingAddress = item.shippingAddress || {};
    const country = shippingAddress.country || 'US';
    const additionalDays = shippingTime[country] || shippingTime.OTHER;
    
    // Total delivery time
    const totalDays = baseDays + additionalDays;
    
    // Calculate delivery date
    const deliveryDate = new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000);
    
    return deliveryDate.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric"
    });
  };

  const buyHandler = async () => {
    if (!account) {
      alert('Please start shopping to make a purchase.');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('http://localhost:3001/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: account,
          itemId: item.id,
          quantity: quantity,
          price: item.price * quantity
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process payment');
      }

      const orderData = await response.json();
      setOrder(orderData);
      setBill(orderData.bill);

      try {
        let signer;
        if (window.ethereum) {
          signer = await provider.getSigner();
        } else {
          const wallet = ethers.Wallet.createRandom().connect(provider);
          signer = wallet;
        }

        const transaction = await contract
          .connect(signer)
          .recordPurchase(item.id, orderData._id, item.price * quantity);
        
        await transaction.wait();

        await fetch(`http://localhost:3001/orders/${orderData._id}/blockchain`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            txHash: transaction.hash
          }),
        });

        setShowSuccessAnimation(true);
        setTimeout(() => {
          alert('Order placed successfully and recorded on blockchain for tracking!');
        }, 1000);
      } catch (error) {
        console.error('Error recording on blockchain:', error);
        alert('Order placed successfully! (Blockchain recording error: ' + error.message + ')');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return (
    <div className="product">
      <div className="product__details">
        <div className="product__image-container">
          <img 
            src={getImageSrc()} 
            alt={item.name} 
            className="product__image"
            onError={handleImageError}
          />
          {item.verified && (
            <div className="verified-badge">
              <span>✓</span> Verified
            </div>
          )}
        </div>

        <div className="product__overview">
          <h2 className="product__title">{item.name}</h2>
          
          <div className="product__rating-container">
            <Rating value={item.rating} />
            <span className="product__rating-count">
              ({item.reviews ? item.reviews.length : Math.floor(Math.random() * 100) + 5} reviews)
            </span>
          </div>
          
          <div className="product__description">
            <h3>Product Description</h3>
            <p>{item.description}</p>
          </div>

          <div className="product__specs">
            <div className="spec-item">
              <span className="spec-label">Category</span>
              <span className="spec-value">{item.category}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Seller</span>
              <span className="spec-value">{item.sellerName || item.seller || 'ChainBazzar'}</span>
            </div>
            {item.condition && (
              <div className="spec-item">
                <span className="spec-label">Condition</span>
                <span className="spec-value">{item.condition}</span>
              </div>
            )}
            {item.manufactured && (
              <div className="spec-item">
                <span className="spec-label">Manufactured</span>
                <span className="spec-value">{item.manufactured}</span>
              </div>
            )}
          </div>
        </div>

        <div className="product__order">
          <div className="product__price">
            {((item.price * quantity) / 100).toFixed(2)}
          </div>

          <div className="quantity-selector">
            <button 
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="quantity-btn"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="quantity-value">{quantity}</span>
            <button 
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= (item.stock || 10)}
              className="quantity-btn"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <div className="delivery-info">
            <p className="delivery-date">
              <span>Estimated Delivery:</span>
              <strong>{formatDeliveryDate()}</strong>
            </p>
            <p className="shipping-info">FREE Delivery</p>
          </div>

          {item.stock > 0 ? (
            <p className="stock-status in-stock">
              {item.stock < 10 ? `Only ${item.stock} left in stock!` : 'In Stock'}
            </p>
          ) : (
            <p className="stock-status out-of-stock">Out of Stock</p>
          )}

          <button 
            className={`product__buy ${isProcessing ? 'processing' : ''} ${showSuccessAnimation ? 'success' : ''}`}
            onClick={buyHandler}
            disabled={!account || item.stock === 0 || isProcessing}
          >
            {!account ? 'Start Shopping to Buy' : 
             isProcessing ? 'Processing...' : 
             showSuccessAnimation ? '✓ Order Placed!' : 'Buy Now'}
          </button>

          <div className="seller-guarantee">
            <div className="guarantee-item">
              <span className="guarantee-icon">🛡️</span>
              <span>Secure Transaction</span>
            </div>
            <div className="guarantee-item">
              <span className="guarantee-icon">↩️</span>
              <span>30-Day Returns</span>
            </div>
          </div>

          {bill && (
            <div className="order-confirmation">
              <h3>Order Confirmation</h3>
              <div className="confirmation-details">
                <p><strong>Order #:</strong> {bill.billNumber}</p>
                <p><strong>Date:</strong> {new Date(bill.billDate).toLocaleString()}</p>
                <div className="order-items">
                  {bill.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <span>{item.name} × {item.quantity}</span>
                      <span>${(item.subtotal / 100).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="order-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>${(bill.totalAmount / 100).toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax (10%):</span>
                    <span>${(bill.tax / 100).toFixed(2)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>${(bill.finalAmount / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <button onClick={togglePop} className="product__close" aria-label="Close product details">
          <img src={close} alt="Close" />
        </button>
      </div>
    </div>
  );
};

export default Product;
