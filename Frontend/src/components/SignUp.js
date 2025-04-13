import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SignIn.css'; // Reusing the same CSS

const SignUp = () => {
  const navigate = useNavigate();
  const { register, authenticated } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' // Default role is user/buyer
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (authenticated) {
      navigate('/products');
    }
  }, [authenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Simple validation
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!formData.password.trim()) {
      setError('Password is required');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      
      console.log('Attempting registration with:', {
        username: formData.username,
        email: formData.email,
        role: formData.role
      });
      
      // Use the auth context register method
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role  // Include role in registration
      });
      
      if (result) {
        console.log('Registration successful, redirecting to products page');
        navigate('/products');
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-header">
          <h2>Create Account</h2>
          <p>Join ChainBazzar marketplace today</p>
        </div>
        
        <form onSubmit={handleSubmit} className="signin-form">
          {error && <div className="signin-error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
            />
          </div>
          
          <div className="form-group role-selection">
            <label>Account Type</label>
            <div className="role-options">
              <label className={`role-option ${formData.role === 'user' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={formData.role === 'user'}
                  onChange={handleChange}
                />
                <div className="role-icon">👤</div>
                <div className="role-label">
                  <strong>Buyer</strong>
                  <span>Shop products from sellers</span>
                </div>
              </label>
              
              <label className={`role-option ${formData.role === 'seller' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="seller"
                  checked={formData.role === 'seller'}
                  onChange={handleChange}
                />
                <div className="role-icon">🏪</div>
                <div className="role-label">
                  <strong>Seller</strong>
                  <span>List and sell your products</span>
                </div>
              </label>
            </div>
          </div>
          
          <button 
            type="submit" 
            className={`signin-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="signin-footer">
          <p>By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
          <p>Already have an account? <Link to="/signin">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignUp; 