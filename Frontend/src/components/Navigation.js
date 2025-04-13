import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import './Navigation.css';

const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: null },
    { path: '/products', label: 'Products', icon: null },
    { 
      path: '/cart', 
      label: 'Cart', 
      icon: null,
      badge: cart.length
    },
    ...((user?.role === 'seller' || user?.role === 'admin') ? [{ path: '/add-product', label: 'Sell', icon: null }] : []),
    ...(user?.role === 'admin' ? [{ path: '/admin', label: 'Admin', icon: null }] : [])
  ];

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          ChainBazzar
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links">
          {navLinks.map(({ path, label, icon, badge }) => (
            <Link
              key={path}
              to={path}
              className={`nav-link ${location.pathname === path ? 'active' : ''} ${path === '/cart' ? 'cart-link' : ''}`}
            >
              {path === '/cart' ? (
                <Badge 
                  badgeContent={badge} 
                  color="primary"
                  sx={{ 
                    '& .MuiBadge-badge': {
                      backgroundColor: '#4361ee',
                      color: 'white',
                      fontWeight: 'bold',
                      minWidth: '18px',
                      height: '18px',
                      fontSize: '0.7rem',
                      padding: '0 4px'
                    } 
                  }}
                >
                  {label}
                </Badge>
              ) : (
                label
              )}
            </Link>
          ))}
        </div>

        {/* Authentication Buttons */}
        <div className="auth-buttons">
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-greeting">Hi, {user.username}!</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="guest-buttons">
              <Link to="/signin" className="signin-btn">
                Sign In
              </Link>
              <Link to="/signup" className="signup-btn">
                Register Now
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          {navLinks.map(({ path, label, icon, badge }) => (
            <Link
              key={path}
              to={path}
              className={`mobile-nav-link ${location.pathname === path ? 'active' : ''} ${path === '/cart' ? 'cart-link' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {path === '/cart' ? (
                <Badge 
                  badgeContent={badge} 
                  color="primary"
                  sx={{ 
                    '& .MuiBadge-badge': {
                      backgroundColor: '#4361ee',
                      color: 'white',
                      fontWeight: 'bold',
                      minWidth: '18px',
                      height: '18px',
                      fontSize: '0.7rem',
                      padding: '0 4px'
                    } 
                  }}
                >
                  {label}
                </Badge>
              ) : (
                label
              )}
            </Link>
          ))}
          
          {/* Mobile Authentication */}
          {isAuthenticated ? (
            <div className="mobile-auth-buttons">
              <span className="mobile-user-greeting">Hi, {user.username}!</span>
              <button onClick={handleLogout} className="mobile-logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="mobile-auth-buttons">
              <Link
                to="/signin"
                className="mobile-signin-btn"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="mobile-signup-btn"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Register Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;