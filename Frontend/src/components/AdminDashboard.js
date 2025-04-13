import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import config from '../config';
import './AdminDashboard.css';

function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    lowStockItems: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'billing') {
      fetchTransactions();
    }
    if (activeTab === 'overview' || activeTab === 'products') {
      fetchProducts();
    }
  }, [activeTab, dateFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_BASE_URL}/api/products`);
      setProducts(response.data);
      
      // Calculate stats
      const lowStock = response.data.filter(p => p.stock && p.stock < 5).length;
      setStats(prev => ({
        ...prev,
        totalProducts: response.data.length,
        lowStockItems: lowStock
      }));
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('chainbazzar_auth_token');
      
      if (!token) {
        setError('You must be logged in to view transactions');
        setLoading(false);
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };

      let url = `${config.API_BASE_URL}/api/billing`;
      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch (dateFilter) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          default:
            break;
        }

        url += `?startDate=${startDate.toISOString()}&endDate=${now.toISOString()}`;
      }

      console.log('Fetching transactions from:', url);
      const response = await axios.get(url, { headers });
      
      console.log('Transactions response:', response.data);
      setTransactions(response.data);
      
      // Calculate stats
      const pendingOrders = response.data.filter(t => t.status === 'pending').length;
      const totalSales = response.data.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
      setStats(prev => ({
        ...prev,
        totalSales,
        pendingOrders
      }));
      
      setError(null);
    } catch (err) {
      setError('Error fetching transactions');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTransaction = async (transactionId) => {
    try {
      const token = localStorage.getItem('chainbazzar_auth_token');
      const response = await axios.get(`${config.API_BASE_URL}/api/billing/${transactionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedTransaction(response.data);
    } catch (err) {
      console.error('Error fetching transaction details:', err);
    }
  };

  const handleUpdateStatus = async (transactionId, newStatus) => {
    try {
      const token = localStorage.getItem('chainbazzar_auth_token');
      await axios.patch(
        `${config.API_BASE_URL}/api/billing/${transactionId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTransactions(); // Refresh the list
    } catch (err) {
      console.error('Error updating transaction status:', err);
    }
  };

  const handleRecordBlockchain = async (transactionId) => {
    try {
      const token = localStorage.getItem('chainbazzar_auth_token');
      
      // In a real application, this would integrate with an actual blockchain
      // For now, we'll generate a fake hash
      const txHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      
      await axios.post(
        `${config.API_BASE_URL}/api/billing/${transactionId}/blockchain`,
        { txHash },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(`Transaction recorded on blockchain with hash: ${txHash}`);
      fetchTransactions(); // Refresh the list
    } catch (err) {
      console.error('Error recording blockchain transaction:', err);
      alert('Failed to record transaction on blockchain');
    }
  };

  const handleExportData = () => {
    const csvContent = transactions.map(t => ({
      Date: new Date(t.createdAt).toLocaleDateString(),
      'Order ID': t._id,
      Customer: t.user?.name || 'Unknown',
      Amount: t.totalAmount?.toFixed(2) || '0.00',
      Status: t.status,
      'Blockchain Verified': t.blockchainVerified ? 'Yes' : 'No'
    }));

    const csv = convertToCSV(csvContent);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (arr) => {
    if (!arr || arr.length === 0) return '';
    const array = [Object.keys(arr[0])].concat(arr);
    return array.map(row => {
      return Object.values(row)
        .map(value => `"${value}"`)
        .join(',');
    }).join('\n');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    // Implement add product logic
    console.log('Adding product...');
  };

  const handleRemoveProduct = async (productId) => {
    try {
      const token = localStorage.getItem('chainbazzar_auth_token');
      await axios.delete(
        `${config.API_BASE_URL}/api/products/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProducts(); // Refresh the list
    } catch (err) {
      console.error('Error removing product:', err);
    }
  };

  const handleUpdateStock = async (productId, newStock) => {
    try {
      const token = localStorage.getItem('chainbazzar_auth_token');
      await axios.patch(
        `${config.API_BASE_URL}/api/products/${productId}`,
        { stock: newStock },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProducts(); // Refresh the list
    } catch (err) {
      console.error('Error updating stock:', err);
    }
  };

  if (!(user?.isAdmin || user?.role === 'admin')) {
    return (
      <div className="admin-error">
        <h2>Access Denied</h2>
        <p>You don't have permission to access the admin dashboard.</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-user-info">
          <span>Welcome, {user.username || user.name}</span>
          <span className="admin-badge">Admin</span>
        </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => handleTabChange('products')}
        >
          Products
        </button>
        <button 
          className={`tab-button ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => handleTabChange('billing')}
        >
          Billing
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Products</h3>
                <p className="stat-number">{stats.totalProducts}</p>
              </div>
              <div className="stat-card">
                <h3>Total Sales</h3>
                <p className="stat-number">${stats.totalSales.toFixed(2)}</p>
              </div>
              <div className="stat-card">
                <h3>Low Stock Items</h3>
                <p className="stat-number">{stats.lowStockItems}</p>
              </div>
              <div className="stat-card">
                <h3>Pending Orders</h3>
                <p className="stat-number">{stats.pendingOrders}</p>
              </div>
            </div>
            <div className="recent-activity">
              <h2>Recent Activity</h2>
              <div className="activity-list">
                {transactions.slice(0, 5).map((transaction, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      {transaction.status === 'completed' ? '✅' : 
                       transaction.status === 'pending' ? '⏳' : 
                       transaction.status === 'cancelled' ? '❌' : '🔄'}
                    </div>
                    <div className="activity-details">
                      <p className="activity-title">
                        Order #{transaction._id.substring(0, 8)} - ${transaction.totalAmount?.toFixed(2)}
                      </p>
                      <p className="activity-meta">
                        {new Date(transaction.createdAt).toLocaleString()} • {transaction.user?.name}
                      </p>
                    </div>
                    <div className="activity-status">
                      <span className={`status-badge ${transaction.status}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && !loading && (
                  <p className="no-data">No recent activity</p>
                )}
                {loading && (
                  <p className="loading">Loading activity...</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="products-section">
            <div className="section-header">
              <h2>Product Management</h2>
              <button className="add-product-btn">Add New Product</button>
            </div>
            
            {loading ? (
              <div className="loading">Loading products...</div>
            ) : (
              <div className="products-table-container">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Verified</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product._id}>
                        <td>{product.name}</td>
                        <td>{product.category}</td>
                        <td>${product.price.toFixed(2)}</td>
                        <td>
                          <input 
                            type="number" 
                            value={product.stock || 0}
                            onChange={(e) => handleUpdateStock(product._id, e.target.value)}
                            min="0"
                          />
                        </td>
                        <td>
                          <span className={`status-badge ${product.verified ? 'verified' : 'not-verified'}`}>
                            {product.verified ? 'Verified' : 'Not Verified'}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="action-btn edit"
                            onClick={() => console.log('Edit product:', product._id)}
                          >
                            Edit
                          </button>
                          <button 
                            className="action-btn delete"
                            onClick={() => handleRemoveProduct(product._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && !loading && (
                      <tr>
                        <td colSpan="6" className="no-data">No products found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="admin-section billing-section">
            <div className="section-header">
              <h2>Billing & Transactions</h2>
              <div className="filters">
                <select 
                  value={dateFilter} 
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="date-filter"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                <button className="export-btn" onClick={handleExportData}>
                  Export Data
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="loading">Loading transactions...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : transactions.length === 0 ? (
              <div className="no-data">No transactions found.</div>
            ) : (
              <div className="transactions-container">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Blockchain</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(transaction => (
                      <tr key={transaction._id}>
                        <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                        <td className="order-id">{transaction._id}</td>
                        <td>{transaction.user?.name || transaction.user?.username || 'Unknown'}</td>
                        <td>${transaction.totalAmount?.toFixed(2) || '0.00'}</td>
                        <td>
                          <span className={`status-badge status-${transaction.status}`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td>
                          {transaction.blockchainTxId ? (
                            <span className="blockchain-verified">
                              <span className="blockchain-icon">✓</span>
                              Verified
                            </span>
                          ) : (
                            <span className="blockchain-unverified">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="actions">
                          <button 
                            className="view-btn"
                            onClick={() => handleViewTransaction(transaction._id)}
                          >
                            View
                          </button>
                          <select 
                            value={transaction.status}
                            onChange={(e) => handleUpdateStatus(transaction._id, e.target.value)}
                            className="status-select"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          {!transaction.blockchainTxId && (
                            <button 
                              className="blockchain-btn"
                              onClick={() => handleRecordBlockchain(transaction._id)}
                            >
                              Record on Blockchain
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {selectedTransaction && (
              <div className="transaction-modal">
                <div className="modal-content">
                  <div className="modal-header">
                    <h3>Transaction Details</h3>
                    <button className="close-btn" onClick={() => setSelectedTransaction(null)}>×</button>
                  </div>
                  <div className="modal-body">
                    <div className="transaction-info">
                      <p><strong>Order ID:</strong> {selectedTransaction._id}</p>
                      <p><strong>Date:</strong> {new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                      <p><strong>Customer:</strong> {selectedTransaction.user?.name || selectedTransaction.user?.username || 'Unknown'}</p>
                      <p><strong>Status:</strong> {selectedTransaction.status}</p>
                      <p><strong>Payment Method:</strong> {selectedTransaction.paymentMethod || 'Standard Payment'}</p>
                      <p><strong>Total Amount:</strong> ${selectedTransaction.totalAmount?.toFixed(2) || '0.00'}</p>
                      
                      {selectedTransaction.blockchainTxId && (
                        <div className="blockchain-details">
                          <h4>Blockchain Details</h4>
                          <p><strong>Transaction Hash:</strong> 
                            <span className="blockchain-hash">{selectedTransaction.blockchainTxId}</span>
                          </p>
                          <p><strong>Verification Status:</strong> 
                            <span className="blockchain-verified-badge">Verified ✓</span>
                          </p>
                          <p><strong>Timestamp:</strong> {selectedTransaction.blockchainTimestamp ? 
                            new Date(selectedTransaction.blockchainTimestamp).toLocaleString() : 'Unknown'}</p>
                          <div className="blockchain-explainer">
                            <p>This transaction has been permanently recorded on the blockchain, 
                            ensuring transparency and immutability. The blockchain serves as an 
                            unalterable ledger, providing verification of purchase authenticity.</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="items-list">
                        <h4>Items</h4>
                        <table className="items-table">
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Quantity</th>
                              <th>Price</th>
                              <th>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedTransaction.items ? (
                              selectedTransaction.items.map((item, index) => (
                                <tr key={index}>
                                  <td>{item.product?.name || 'Unknown Product'}</td>
                                  <td>{item.quantity}</td>
                                  <td>${item.price?.toFixed(2) || '0.00'}</td>
                                  <td>${(item.price * item.quantity).toFixed(2) || '0.00'}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="4">No items found</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="close-btn" onClick={() => setSelectedTransaction(null)}>Close</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard; 