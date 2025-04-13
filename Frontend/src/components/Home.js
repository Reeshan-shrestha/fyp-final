import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { authenticated, guestMode } = useAuth();

  const handleSellClick = (e) => {
    // If not authenticated or in guest mode, prevent default and redirect to login
    if (!authenticated || guestMode) {
      e.preventDefault();
      navigate('/signin?returnTo=/add-product');
    }
  };

  return (
    <div className="home">
      <div className="hero">
        <h1>Welcome to ChainBazzar</h1>
        <p>Your trusted marketplace for verified products</p>
        <div className="hero-buttons">
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
          
          {authenticated && !guestMode ? (
            // Show Sell Product button if user is logged in
            <Link to="/add-product" className="btn btn-secondary">
              Sell Product
            </Link>
          ) : (
            // Show Register button for guests
            <Link to="/signup" className="btn btn-secondary">
              Register Now
            </Link>
          )}
        </div>
      </div>

      <section className="features">
        <h2>Why Choose ChainBazzar?</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Transactions</h3>
            <p>Every purchase is protected with secure payment processing</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3>Quality Assurance</h3>
            <p>Rigorous verification process ensures product quality</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Global Marketplace</h3>
            <p>Access quality products from sellers worldwide</p>
          </div>
        </div>
      </section>

      <section className="testimonials">
        <h2>What Our Users Say</h2>
        <div className="testimonial-grid">
          <div className="testimonial-card">
            <p className="testimonial-text">
              "ChainBazzar has transformed my online shopping experience. I can find unique products with confidence knowing they're verified for quality."
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">JD</div>
              <div className="author-info">
                <h4>John Doe</h4>
                <p>Regular Shopper</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-text">
              "Selling on ChainBazzar has been incredibly easy. The platform's simplicity helps me reach more customers than ever before."
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">SJ</div>
              <div className="author-info">
                <h4>Sarah Johnson</h4>
                <p>Boutique Owner</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p className="testimonial-text">
              "Customer service is outstanding. Any issues I've had were quickly resolved, making shopping here worry-free."
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">RK</div>
              <div className="author-info">
                <h4>Robert Kim</h4>
                <p>Tech Enthusiast</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to start?</h2>
        {authenticated && !guestMode ? (
          <p>You're logged in and ready to go. Explore our marketplace!</p>
        ) : (
          <p>Create an account today to start buying and selling products.</p>
        )}
        
        {authenticated && !guestMode ? (
          <Link to="/products" className="btn btn-primary">
            Explore Products
          </Link>
        ) : (
          <div className="cta-buttons">
            <Link to="/signup" className="btn btn-primary">
              Create Account
            </Link>
            <Link to="/signin" className="btn btn-secondary">
              Sign In
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home; 