import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import config from '../config';
import * as apiService from '../services/api';
import './AdminDashboard.css';

function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    lowStockItems: 0,
    pendingOrders: 0,
    totalBills: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  
  // Product management states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    stock: '',
    isVerified: false
  });
  const [productFormError, setProductFormError] = useState(null);
  const [productActionSuccess, setProductActionSuccess] = useState(null);

  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'billing') {
      fetchTransactions();
      fetchBills();
    }
    if (activeTab === 'overview' || activeTab === 'products') {
      fetchProducts();
    }
  }, [activeTab, dateFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProducts();
      setProducts(response);
      
      // Calculate stats
      const lowStock = response.filter(p => p.stock && p.stock < 5).length;
      setStats(prev => ({
        ...prev,
        totalProducts: response.length,
        lowStockItems: lowStock
      }));
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // Use apiService here when added
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
      const response = await apiService.get(url, { headers });
      
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

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllBills();
      setBills(response.data || []);
      
      // Calculate stats
      const totalBillsAmount = response.data.reduce((sum, bill) => sum + (bill.total || 0), 0);
      
      setStats(prev => ({
        ...prev,
        totalBills: response.data.length,
        totalSales: totalBillsAmount
      }));
      
      setError(null);
    } catch (err) {
      setError('Error fetching bills');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTransaction = async (transactionId) => {
    try {
      const token = localStorage.getItem('chainbazzar_auth_token');
      const response = await apiService.get(`${config.API_BASE_URL}/api/billing/${transactionId}`, {
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
      await apiService.patch(
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
      
      await apiService.post(
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
    // Clear any success messages when changing tabs
    setProductActionSuccess(null);
  };

  // Product management functions
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: '',
      imageUrl: '',
      stock: '',
      isVerified: false
    });
    setProductModalOpen(true);
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      imageUrl: product.imageUrl || '',
      stock: product.stock || '',
      isVerified: product.isVerified || false
    });
    setProductModalOpen(true);
  };

  const closeProductModal = () => {
    setProductModalOpen(false);
    setEditingProduct(null);
    setProductFormError(null);
  };

  const handleProductFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateProductForm = () => {
    if (!productForm.name.trim()) {
      setProductFormError('Product name is required');
      return false;
    }
    if (!productForm.price || isNaN(productForm.price) || parseFloat(productForm.price) <= 0) {
      setProductFormError('Valid price is required');
      return false;
    }
    if (!productForm.category.trim()) {
      setProductFormError('Category is required');
      return false;
    }
    if (!productForm.stock || isNaN(productForm.stock) || parseInt(productForm.stock) < 0) {
      setProductFormError('Valid stock quantity is required');
      return false;
    }
    return true;
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setProductFormError(null);
    
    if (!validateProductForm()) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('chainbazzar_auth_token');
      
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock)
      };
      
      await apiService.post(
        `${config.API_BASE_URL}/api/products`,
        productData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setProductActionSuccess('Product added successfully');
      closeProductModal();
      fetchProducts();
    } catch (err) {
      console.error('Error adding product:', err);
      setProductFormError('Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    setProductFormError(null);
    
    if (!validateProductForm()) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('chainbazzar_auth_token');
      
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock)
      };
      
      await apiService.patch(
        `${config.API_BASE_URL}/api/products/${editingProduct._id}`,
        productData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setProductActionSuccess('Product updated successfully');
      closeProductModal();
      fetchProducts();
    } catch (err) {
      console.error('Error updating product:', err);
      setProductFormError('Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('chainbazzar_auth_token');
      await apiService.delete_(
        `${config.API_BASE_URL}/api/products/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProductActionSuccess('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      console.error('Error removing product:', err);
      setError('Failed to delete product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (productId, newStock) => {
    if (isNaN(newStock) || parseInt(newStock) < 0) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('chainbazzar_auth_token');
      await apiService.patch(
        `${config.API_BASE_URL}/api/products/${productId}`,
        { stock: parseInt(newStock) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProducts();
    } catch (err) {
      console.error('Error updating stock:', err);
      setError('Failed to update stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (productId, currentVerifiedStatus) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('chainbazzar_auth_token');
      await apiService.patch(
        `${config.API_BASE_URL}/api/products/${productId}/verify`,
        { isVerified: !currentVerifiedStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProductActionSuccess(`Product ${!currentVerifiedStatus ? 'verified' : 'unverified'} successfully`);
      fetchProducts();
    } catch (err) {
      console.error('Error toggling verification:', err);
      setError('Failed to update verification status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
  };

  const handleCloseBillDetails = () => {
    setSelectedBill(null);
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
                <h3>Total Bills</h3>
                <p className="stat-number">{stats.totalBills}</p>
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
              <button className="add-product-btn" onClick={openAddProductModal}>Add New Product</button>
            </div>
            
            {productActionSuccess && (
              <div className="success-message">
                {productActionSuccess}
                <button className="close-message" onClick={() => setProductActionSuccess(null)}>×</button>
              </div>
            )}
            
            {error && (
              <div className="error-message">
                {error}
                <button className="close-message" onClick={() => setError(null)}>×</button>
              </div>
            )}
            
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
                        <td>${(product.price || 0).toFixed(2)}</td>
                        <td>
                          <input 
                            type="number" 
                            value={product.stock || 0}
                            onChange={(e) => handleUpdateStock(product._id, e.target.value)}
                            min="0"
                            className={product.stock < 5 ? "low-stock" : ""}
                          />
                        </td>
                        <td>
                          <span 
                            className={`status-badge ${product.isVerified ? 'verified' : 'not-verified'}`}
                            onClick={() => handleToggleVerification(product._id, product.isVerified)}
                            style={{ cursor: 'pointer' }}
                          >
                            {product.isVerified ? 'Verified' : 'Not Verified'}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="action-btn edit"
                            onClick={() => openEditProductModal(product)}
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
            
            {/* Product Modal */}
            {productModalOpen && (
              <div className="modal-overlay">
                <div className="product-modal">
                  <div className="modal-header">
                    <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                    <button className="close-btn" onClick={closeProductModal}>×</button>
                  </div>
                  
                  {productFormError && (
                    <div className="error-message">{productFormError}</div>
                  )}
                  
                  <form onSubmit={editingProduct ? handleEditProduct : handleAddProduct}>
                    <div className="form-group">
                      <label htmlFor="name">Product Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={productForm.name}
                        onChange={handleProductFormChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="description">Description</label>
                      <textarea
                        id="description"
                        name="description"
                        value={productForm.description}
                        onChange={handleProductFormChange}
                        rows="3"
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="price">Price ($) *</label>
                        <input
                          type="number"
                          id="price"
                          name="price"
                          value={productForm.price}
                          onChange={handleProductFormChange}
                          min="0.01"
                          step="0.01"
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="stock">Stock *</label>
                        <input
                          type="number"
                          id="stock"
                          name="stock"
                          value={productForm.stock}
                          onChange={handleProductFormChange}
                          min="0"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="category">Category *</label>
                      <input
                        type="text"
                        id="category"
                        name="category"
                        value={productForm.category}
                        onChange={handleProductFormChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="imageUrl">Image URL</label>
                      <input
                        type="text"
                        id="imageUrl"
                        name="imageUrl"
                        value={productForm.imageUrl}
                        onChange={handleProductFormChange}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    
                    <div className="form-group checkbox">
                      <label>
                        <input
                          type="checkbox"
                          name="isVerified"
                          checked={productForm.isVerified}
                          onChange={handleProductFormChange}
                        />
                        Verified Product
                      </label>
                    </div>
                    
                    <div className="form-actions">
                      <button type="button" className="cancel-btn" onClick={closeProductModal}>
                        Cancel
                      </button>
                      <button type="submit" className="submit-btn">
                        {editingProduct ? 'Update Product' : 'Add Product'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="admin-section billing-section">
            <div className="section-header">
              <h2>Billing & Invoices</h2>
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
              <div className="loading">Loading billing data...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : bills.length === 0 ? (
              <div className="no-data">No bills found for the selected period.</div>
            ) : (
              <div className="bills-table-container">
                <table className="billing-table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Subtotal</th>
                      <th>Tax</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map(bill => (
                      <tr key={bill._id}>
                        <td>{bill.invoiceNumber || `INV-${bill._id.substr(-6)}`}</td>
                        <td>{new Date(bill.date || bill.createdAt).toLocaleDateString()}</td>
                        <td>{bill.userId || 'Anonymous'}</td>
                        <td>{bill.items?.length || 0} items</td>
                        <td>${bill.subtotal?.toFixed(2) || '0.00'}</td>
                        <td>${bill.tax?.toFixed(2) || '0.00'}</td>
                        <td className="amount-cell">${bill.total?.toFixed(2) || '0.00'}</td>
                        <td>
                          <span className={`status-badge status-${bill.status?.toLowerCase() || 'pending'}`}>
                            {bill.status || 'Pending'}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="action-btn view-btn"
                            onClick={() => handleViewBill(bill)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {selectedBill && (
              <div className="modal-overlay">
                <div className="bill-details-modal">
                  <div className="modal-header">
                    <h3>Invoice #{selectedBill.invoiceNumber || `INV-${selectedBill._id.substr(-6)}`}</h3>
                    <button className="close-btn" onClick={handleCloseBillDetails}>×</button>
                  </div>
                  <div className="bill-details">
                    <div className="bill-summary">
                      <div className="bill-info">
                        <p><strong>Date:</strong> {new Date(selectedBill.date || selectedBill.createdAt).toLocaleDateString()}</p>
                        <p><strong>Order ID:</strong> {selectedBill.orderId}</p>
                        <p><strong>Status:</strong> {selectedBill.status}</p>
                      </div>
                      
                      <div className="bill-customer">
                        <h4>Customer Information</h4>
                        <p>User ID: {selectedBill.userId}</p>
                        {selectedBill.shipping && (
                          <div>
                            <p>
                              {selectedBill.shipping.street}, {selectedBill.shipping.city}<br />
                              {selectedBill.shipping.state}, {selectedBill.shipping.zipCode}<br />
                              {selectedBill.shipping.country}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bill-items">
                      <h4>Items</h4>
                      <table className="items-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedBill.items?.map((item, index) => (
                            <tr key={index}>
                              <td>{item.name}</td>
                              <td>${item.price?.toFixed(2)}</td>
                              <td>{item.quantity}</td>
                              <td>${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="bill-totals">
                      <div className="total-line">
                        <span>Subtotal:</span>
                        <span>${selectedBill.subtotal?.toFixed(2)}</span>
                      </div>
                      <div className="total-line">
                        <span>Tax:</span>
                        <span>${selectedBill.tax?.toFixed(2)}</span>
                      </div>
                      <div className="total-line total-amount">
                        <span>Total:</span>
                        <span>${selectedBill.total?.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="bill-actions">
                      <button className="action-btn print-btn" onClick={() => window.print()}>
                        Print Invoice
                      </button>
                    </div>
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