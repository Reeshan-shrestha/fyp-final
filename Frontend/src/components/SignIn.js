import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SignIn.css';

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authenticated } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get return URL from query parameters
  const searchParams = new URLSearchParams(location.search);
  const returnTo = searchParams.get('returnTo') || '/products';

  // Redirect if already logged in
  useEffect(() => {
    if (authenticated) {
      navigate(returnTo);
    }
  }, [authenticated, navigate, returnTo]);

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
    
    if (!formData.password.trim()) {
      setError('Password is required');
      return;
    }
    
    try {
      setLoading(true);
      
      // Log credential information for debugging
      console.log('Attempting login with:', {
        username: formData.username,
        password: formData.password
      });
      
      // Use the auth context login method instead of direct fetch
      const result = await login(formData);
      
      if (result) {
        console.log('Login successful, redirecting to:', returnTo);
        navigate(returnTo);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-header">
          <h2>Welcome back</h2>
          <p>Sign in to your ChainBazzar account</p>
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
              placeholder="Enter your username"
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
              placeholder="Enter your password"
            />
          </div>
          
          <button 
            type="submit" 
            className={`signin-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="signin-footer">
          <p>New to ChainBazzar? <Link to="/signup">Create an account</Link> to start shopping.</p>
        </div>
      </div>
    </div>
  );
};

export default SignIn; 