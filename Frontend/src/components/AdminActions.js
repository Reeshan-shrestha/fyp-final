import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as apiService from '../services/api';
import config from '../config';
import './AdminActions.css';

const AdminActions = ({ onDistributionComplete }) => {
  const { user, isAuthenticated } = useAuth();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [distributionStats, setDistributionStats] = useState({
    totalDistributed: 0,
    sellersAssigned: 0,
    lastDistributionTime: null
  });
  
  // Check if the user is an admin
  const isAdmin = user?.isAdmin || user?.role === 'admin';
  
  // Fetch distribution history when component mounts
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchDistributionHistory();
    }
  }, [isAuthenticated, isAdmin]);
  
  // Fetch distribution history from local storage (in a real app, this would come from the backend)
  const fetchDistributionHistory = () => {
    try {
      const history = localStorage.getItem('distribution_history');
      if (history) {
        const parsedHistory = JSON.parse(history);
        setDistributionStats(parsedHistory);
      }
    } catch (e) {
      console.error("Could not load distribution history", e);
    }
  };
  
  // Save distribution history to local storage
  const saveDistributionHistory = (stats) => {
    try {
      localStorage.setItem('distribution_history', JSON.stringify(stats));
      setDistributionStats(stats);
    } catch (e) {
      console.error("Could not save distribution history", e);
    }
  };
  
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
      
      // Extract distribution results from the response
      const resultDetails = response.data.details || '';
      const totalDistributed = extractDistributionCount(resultDetails);
      const sellersCount = extractSellersCount(resultDetails);
      
      // Update distribution stats
      const newStats = {
        totalDistributed: distributionStats.totalDistributed + totalDistributed,
        sellersAssigned: sellersCount || distributionStats.sellersAssigned,
        lastDistributionTime: new Date().toISOString()
      };
      
      saveDistributionHistory(newStats);
      setStatus(`Success: ${response.data.message}`);
      
      // Notify parent component that distribution is complete
      if (onDistributionComplete) {
        onDistributionComplete();
      }
    } catch (error) {
      console.error('Error distributing products:', error);
      setStatus(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to extract distribution count from response details
  const extractDistributionCount = (details) => {
    const match = details.match(/distributed (\d+) products/i);
    return match ? parseInt(match[1], 10) : 0;
  };
  
  // Helper function to extract seller count from response details
  const extractSellersCount = (details) => {
    const match = details.match(/Found (\d+) sellers/i);
    return match ? parseInt(match[1], 10) : 0;
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  return (
    <div className="admin-actions">
      <div className="admin-actions-header">
        <h2>Product Distribution Center</h2>
        <div className="distribution-history">
          <p>Last Distribution: <span className="highlight">{formatDate(distributionStats.lastDistributionTime)}</span></p>
          <p>Total Products Distributed: <span className="highlight">{distributionStats.totalDistributed}</span></p>
          <p>Active Sellers: <span className="highlight">{distributionStats.sellersAssigned}</span></p>
        </div>
      </div>
      
      <div className="admin-action-buttons">
        <button 
          onClick={handleDistributeProducts}
          disabled={loading}
          className="admin-action-button"
        >
          {loading ? 'Distributing...' : 'Distribute Products to Sellers'}
        </button>
      </div>
      
      {status && (
        <div className={`status-message ${status.startsWith('Error') ? 'error' : 'success'}`}>
          {status}
        </div>
      )}
      
      <div className="distribution-info">
        <h3>What This Does</h3>
        <p>The distribution process will:</p>
        <ul>
          <li>Find all unassigned products in the database</li>
          <li>Identify all active sellers in the system</li>
          <li>Assigns products to respective sellers</li>
          <li>Update the product records with seller username information</li>
        </ul>
        <p className="note">This action cannot be undone. Only run when you have unassigned products to distribute.</p>
      </div>
    </div>
  );
};

export default AdminActions; 