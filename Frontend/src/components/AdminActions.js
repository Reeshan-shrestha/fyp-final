import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as apiService from '../services/api';
import config from '../config';
import './AdminActions.css';

const AdminActions = () => {
  const { user, isAuthenticated } = useAuth();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Check if the user is an admin
  const isAdmin = user?.isAdmin || user?.role === 'admin';
  
  if (!isAuthenticated || !isAdmin) {
    return null; // Only show for admin users
  }
  
  // Handle running the distribute products action
  const handleDistributeProducts = async () => {
    if (!window.confirm('Are you sure you want to distribute products to sellers? This will modify the database.')) {
      return;
    }
    
    setLoading(true);
    setStatus('Distributing products to sellers...');
    
    try {
      const response = await apiService.post(
        `${config.API_BASE_URL}/api/admin/distribute-products`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('chainbazzar_auth_token')}` } }
      );
      
      setStatus(`Success: ${response.data.message}`);
    } catch (error) {
      console.error('Error distributing products:', error);
      setStatus(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="admin-actions">
      <h2>Admin Actions</h2>
      
      <div className="admin-action-buttons">
        <button 
          onClick={handleDistributeProducts}
          disabled={loading}
          className="admin-action-button"
        >
          Distribute Products to Sellers
        </button>
      </div>
      
      {status && (
        <div className={`status-message ${status.startsWith('Error') ? 'error' : 'success'}`}>
          {status}
        </div>
      )}
    </div>
  );
};

export default AdminActions; 