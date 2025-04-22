import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import config from '../config';
import * as apiService from '../services/api';
import mockProducts from '../services/mockProducts';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';
import AdminActions from './AdminActions';

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
  const [productActionInProgress, setProductActionInProgress] = useState(false);

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
      setError(null);
      
      // Try to get products from API with authentication
      try {
        const token = localStorage.getItem('chainbazzar_auth_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        // Use the apiService.getProducts method which has mock fallback built in
        const productsData = await apiService.getProducts();
        
        console.log('Products fetched:', productsData);
        
        // Map database fields to frontend fields
        const mappedProducts = productsData.map(product => ({
          ...product,
          stock: product.countInStock,
          isVerified: product.verified
        }));
        
        setProducts(mappedProducts);
        
        // Calculate stats using the mapped field names
        const lowStock = mappedProducts.filter(p => p.stock && p.stock < 5).length;
        setStats(prev => ({
          ...prev,
          totalProducts: mappedProducts.length,
          lowStockItems: lowStock
        }));
      } catch (err) {
        console.error('Error fetching products from API, using mock data:', err);
        // Fallback to mock data
        const mockData = mockProducts;
        setProducts(mockData);
        
        const lowStock = mockData.filter(p => p.stock && p.stock < 5).length;
        setStats(prev => ({
          ...prev,
          totalProducts: mockData.length,
          lowStockItems: lowStock
        }));
      }
    } catch (err) {
      console.error('Error in fetchProducts:', err);
      setError('Failed to load products. Using mock data instead.');
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
    setSelectedTransaction(null);
    setSelectedBill(null);
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
    setProductFormError(null);
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
      stock: product.stock || product.countInStock || '', // Accept either field name
      isVerified: product.isVerified || product.verified || false // Accept either field name
    });
    setProductFormError(null);
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
      setProductActionInProgress(true);
      
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        // Map frontend fields to database fields
        countInStock: parseInt(productForm.stock),
        verified: productForm.isVerified
      };
      
      console.log('Adding new product:', productData);
      
      try {
        // Try to use the real API
        const token = localStorage.getItem('chainbazzar_auth_token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        // Use the wrapped API call that has mock fallback
        await apiService.createProduct(productData);
        
        setProductActionSuccess('Product added successfully');
      } catch (apiError) {
        console.warn('Backend API error, using mock functionality:', apiError);
        
        // Manually add to our local product state with a mock ID
        const newProduct = {
          ...productData,
          _id: 'mock_' + Date.now(),
          createdAt: new Date().toISOString()
        };
        
        setProducts(prev => [...prev, newProduct]);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalProducts: prev.totalProducts + 1,
          lowStockItems: newProduct.stock < 5 ? prev.lowStockItems + 1 : prev.lowStockItems
        }));
        
        setProductActionSuccess('Product added successfully (mock data - backend unavailable)');
      }
      
      closeProductModal();
    } catch (err) {
      console.error('Error adding product:', err);
      setProductFormError(`Failed to add product: ${err.message}`);
    } finally {
      setProductActionInProgress(false);
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    setProductFormError(null);
    
    if (!validateProductForm()) {
      return;
    }
    
    if (!editingProduct?._id) {
      setProductFormError('Cannot edit product: Missing product ID');
      return;
    }
    
    try {
      setProductActionInProgress(true);
      
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        // Map frontend fields to database fields
        countInStock: parseInt(productForm.stock),
        verified: productForm.isVerified
      };
      
      console.log(`Updating product ${editingProduct._id}:`, productData);
      
      try {
        // Try to use the real API
        const token = localStorage.getItem('chainbazzar_auth_token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        // First check if the product ID is a mock one
        if (editingProduct._id.startsWith('mock_')) {
          throw new Error('Cannot update mock product with real API');
        }
        
        await apiService.patch(
          `${config.API_BASE_URL}/api/products/${editingProduct._id}`,
          productData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (apiError) {
        console.warn('Backend API error, using mock functionality:', apiError);
        
        // Update in our local product state
        setProducts(prev => 
          prev.map(p => p._id === editingProduct._id ? { ...p, ...productData } : p)
        );
        
        // Update low stock count if needed
        if ((editingProduct.stock < 5 && productData.stock >= 5) || 
            (editingProduct.stock >= 5 && productData.stock < 5)) {
          setStats(prev => ({
            ...prev,
            lowStockItems: productData.stock < 5 
              ? prev.lowStockItems + 1 
              : prev.lowStockItems - 1
          }));
        }
        
        setProductActionSuccess('Product updated successfully (mock data - backend unavailable)');
        closeProductModal();
        return;
      }
      
      setProductActionSuccess('Product updated successfully');
      closeProductModal();
      fetchProducts(); // Refresh the list
    } catch (err) {
      console.error('Error updating product:', err);
      setProductFormError(`Failed to update product: ${err.message}`);
    } finally {
      setProductActionInProgress(false);
    }
  };

  const handleRemoveProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Check if it's a mock product
      const isMockProduct = productId.startsWith('mock_');
      
      try {
        // Try to use the real API if not a mock product
        if (!isMockProduct) {
          const token = localStorage.getItem('chainbazzar_auth_token');
          if (!token) {
            throw new Error('No authentication token found');
          }
          
          await apiService.delete_(
            `${config.API_BASE_URL}/api/products/${productId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          throw new Error('Mock product - using local deletion');
        }
      } catch (apiError) {
        console.warn('Backend API error or mock product, using local deletion:', apiError);
        
        // Get the product before removal to check if it was low stock
        const productToRemove = products.find(p => p._id === productId);
        const wasLowStock = productToRemove && productToRemove.stock < 5;
        
        // Remove from our local product state
        setProducts(prev => prev.filter(p => p._id !== productId));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalProducts: prev.totalProducts - 1,
          lowStockItems: wasLowStock ? prev.lowStockItems - 1 : prev.lowStockItems
        }));
        
        setProductActionSuccess('Product removed successfully (mock data - backend unavailable)');
        return;
      }
      
      setProductActionSuccess('Product removed successfully');
      fetchProducts(); // Refresh the list
    } catch (err) {
      console.error('Error removing product:', err);
      setError(`Failed to remove product: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (productId, newStock) => {
    if (isNaN(newStock) || parseInt(newStock) < 0) {
      setError('Invalid stock value. Please enter a valid number.');
      return;
    }
    
    try {
      setLoading(true);
      
      const stockValue = parseInt(newStock);
      
      // Check if it's a mock product
      const isMockProduct = productId.startsWith('mock_');
      
      try {
        // Try to use the real API if not a mock product
        if (!isMockProduct) {
          const token = localStorage.getItem('chainbazzar_auth_token');
          if (!token) {
            throw new Error('No authentication token found');
          }
          
          await apiService.patch(
            `${config.API_BASE_URL}/api/products/${productId}`,
            { countInStock: stockValue }, // Map to database field name
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          throw new Error('Mock product - using local update');
        }
      } catch (apiError) {
        console.warn('Backend API error or mock product, using local update:', apiError);
        
        // Get current stock value to determine if low stock status changed
        const product = products.find(p => p._id === productId);
        const wasLowStock = product && product.stock < 5;
        const isLowStock = stockValue < 5;
        
        // Update in our local product state
        setProducts(prev => 
          prev.map(p => p._id === productId ? { ...p, stock: stockValue } : p)
        );
        
        // Update low stock count if needed
        if (wasLowStock !== isLowStock) {
          setStats(prev => ({
            ...prev,
            lowStockItems: isLowStock 
              ? prev.lowStockItems + 1 
              : prev.lowStockItems - 1
          }));
        }
        
        setProductActionSuccess(`Stock updated to ${stockValue} (mock data - backend unavailable)`);
        return;
      }
      
      // Update the local state immediately for better UX
      setProducts(prev => 
        prev.map(p => p._id === productId ? { ...p, stock: stockValue } : p)
      );
      
      // Update low stock count in stats
      const product = products.find(p => p._id === productId);
      if (product) {
        const wasLowStock = product.stock < 5;
        const isLowStock = stockValue < 5;
        
        if (wasLowStock !== isLowStock) {
          setStats(prev => ({
            ...prev,
            lowStockItems: isLowStock ? prev.lowStockItems + 1 : prev.lowStockItems - 1
          }));
        }
      }
      
      setProductActionSuccess(`Stock updated to ${stockValue}`);
    } catch (err) {
      console.error('Error updating stock:', err);
      setError(`Failed to update stock: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (productId, currentVerifiedStatus) => {
    try {
      setLoading(true);
      
      const newStatus = !currentVerifiedStatus;
      
      // Check if it's a mock product
      const isMockProduct = productId.startsWith('mock_');
      
      try {
        // Try to use the real API if not a mock product
        if (!isMockProduct) {
          const token = localStorage.getItem('chainbazzar_auth_token');
          if (!token) {
            throw new Error('No authentication token found');
          }
          
          await apiService.patch(
            `${config.API_BASE_URL}/api/products/${productId}`,
            { verified: newStatus }, // Map to database field name
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          throw new Error('Mock product - using local update');
        }
      } catch (apiError) {
        console.warn('Backend API error or mock product, using local update:', apiError);
        
        // Update in our local product state
        setProducts(prev => 
          prev.map(p => p._id === productId ? { ...p, isVerified: newStatus } : p)
        );
        
        setProductActionSuccess(`Product ${newStatus ? 'verified' : 'unverified'} successfully (mock data - backend unavailable)`);
        return;
      }
      
      // Update the local state immediately for better UX
      setProducts(prev => 
        prev.map(p => p._id === productId ? { ...p, isVerified: newStatus } : p)
      );
      
      setProductActionSuccess(`Product ${newStatus ? 'verified' : 'unverified'} successfully`);
    } catch (err) {
      console.error('Error toggling verification:', err);
      setError(`Failed to update verification status: ${err.message}`);
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

  // Check if user is admin
  const isAdmin = user?.isAdmin || user?.role === 'admin';
  
  if (!isAdmin) {
    return (
      <div className="admin-container">
        <h1>Access Denied</h1>
        <p>You must be an admin to view this page.</p>
      </div>
    );
  }
  
  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user?.username || 'Admin'}</p>
      </header>
      
      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`} 
          onClick={() => handleTabChange('overview')}
        >
          Overview
        </button>
        <button 
          className={`admin-tab ${activeTab === 'distribution' ? 'active' : ''}`} 
          onClick={() => handleTabChange('distribution')}
        >
          Product Distribution
        </button>
        <button 
          className={`admin-tab ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => handleTabChange('billing')}
        >
          Billing
        </button>
        <button 
          className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => handleTabChange('products')}
        >
          Products
        </button>
      </div>
      
      <div className="admin-content">
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="overview-container">
                <div className="stat-cards">
                  <div className="stat-card">
                    <h3>Products</h3>
                    <p className="stat-value">{stats.totalProducts}</p>
                    <p className="stat-detail">Low Stock: {stats.lowStockItems}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Revenue</h3>
                    <p className="stat-value">${(stats.totalSales || 0).toFixed(2)}</p>
                    <p className="stat-detail">Orders: {transactions.length}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Orders</h3>
                    <p className="stat-value">{transactions.length}</p>
                    <p className="stat-detail">Pending: {stats.pendingOrders}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Bills</h3>
                    <p className="stat-value">{stats.totalBills}</p>
                    <p className="stat-detail">Billing System</p>
                  </div>
                </div>
                
                <h2>Recent Transactions</h2>
                <div className="filter-controls">
                  <select 
                    value={dateFilter} 
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="date-filter"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                  </select>
                </div>
                
                <div className="recent-transactions">
                  <table className="transaction-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 5).map(transaction => (
                        <tr key={transaction._id}>
                          <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                          <td>{transaction._id.substring(0, 8)}...</td>
                          <td>{transaction.user?.name || 'Unknown'}</td>
                          <td>${transaction.totalAmount?.toFixed(2) || '0.00'}</td>
                          <td>
                            <span className={`status-badge status-${transaction.status}`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="action-button view-button"
                              onClick={() => handleViewTransaction(transaction._id)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'distribution' && (
              <div className="distribution-container">
                <h2>Product Distribution</h2>
                <p>Distribute unassigned products to sellers in the system. This operation will randomly assign products to sellers.</p>
                
                <AdminActions />
                
                <h3>Product Distribution Stats</h3>
                <div className="distribution-stats">
                  <div className="stat-panel">
                    <h4>Total Products</h4>
                    <p>{stats.totalProducts}</p>
                  </div>
                  <div className="stat-panel">
                    <h4>Assigned Products</h4>
                    <p>{products.filter(p => p.seller).length}</p>
                  </div>
                  <div className="stat-panel">
                    <h4>Unassigned Products</h4>
                    <p>{products.filter(p => !p.seller).length}</p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'billing' && (
              <div className="billing-container">
                <h2>Billing System</h2>
                
                <div className="filter-controls">
                  <select 
                    value={dateFilter} 
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="date-filter"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                  </select>
                  <button 
                    className="export-button"
                    onClick={handleExportData}
                  >
                    Export CSV
                  </button>
                </div>

                {selectedBill ? (
                  // Bill detail view
                  <div className="bill-details">
                    <button 
                      className="back-button"
                      onClick={() => setSelectedBill(null)}
                    >
                      Back to Bills List
                    </button>
                    
                    <div className="detail-panel">
                      <div className="detail-section">
                        <h4>Bill Information</h4>
                        <div className="bill-info-grid">
                          <div>
                            <strong>Bill Number:</strong> {selectedBill.billNumber || selectedBill.invoiceNumber}
                          </div>
                          <div>
                            <strong>Date:</strong> {new Date(selectedBill.billDate || selectedBill.createdAt).toLocaleDateString()}
                          </div>
                          <div>
                            <strong>Payment Status:</strong> 
                            <span className={`status-badge ${selectedBill.paymentStatus}`}>
                              {selectedBill.paymentStatus}
                            </span>
                          </div>
                          <div>
                            <strong>Total Amount:</strong> ${selectedBill.finalAmount || selectedBill.total}
                          </div>
                        </div>
                      </div>
                      
                      <div className="detail-section">
                        <h4>Items</h4>
                        <table className="items-table">
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th>Quantity</th>
                              <th>Price</th>
                              <th>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedBill.items && selectedBill.items.map((item, idx) => (
                              <tr key={idx}>
                                <td>{item.name}</td>
                                <td>{item.quantity}</td>
                                <td>${item.price ? item.price.toFixed(2) : '0.00'}</td>
                                <td>${item.subtotal ? item.subtotal.toFixed(2) : '0.00'}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan="3" style={{textAlign: 'right'}}><strong>Subtotal:</strong></td>
                              <td>${selectedBill.totalAmount ? selectedBill.totalAmount.toFixed(2) : '0.00'}</td>
                            </tr>
                            <tr>
                              <td colSpan="3" style={{textAlign: 'right'}}><strong>Tax:</strong></td>
                              <td>${selectedBill.tax ? selectedBill.tax.toFixed(2) : '0.00'}</td>
                            </tr>
                            <tr>
                              <td colSpan="3" style={{textAlign: 'right'}}><strong>Total:</strong></td>
                              <td>${((selectedBill.finalAmount || selectedBill.total) || 0).toFixed(2)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      
                      <div className="detail-section">
                        <h4>Customer Information</h4>
                        <div>
                          <strong>User ID:</strong> {selectedBill.userId}
                        </div>
                        {/* Add more customer info if available */}
                      </div>
                      
                      <div className="action-buttons">
                        <button 
                          className="print-bill-button"
                          onClick={() => {
                            // Open in print view
                            const printWindow = window.open('', '_blank');
                            const styles = `
                              body { font-family: Arial, sans-serif; padding: 20px; }
                              .bill-header { text-align: center; margin-bottom: 20px; }
                              .bill-header h1 { margin-bottom: 5px; }
                              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                              th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                              th { background-color: #f9f9f9; }
                              .bill-footer { margin-top: 30px; text-align: center; font-size: 12px; }
                              .bill-total { margin-top: 20px; text-align: right; }
                            `;
                            
                            const content = `
                              <!DOCTYPE html>
                              <html>
                              <head>
                                <title>Bill #${selectedBill.billNumber || selectedBill.invoiceNumber}</title>
                                <style>${styles}</style>
                              </head>
                              <body>
                                <div class="bill-header">
                                  <h1>ChainBazzar</h1>
                                  <p>Invoice #${selectedBill.billNumber || selectedBill.invoiceNumber}</p>
                                  <p>Date: ${new Date(selectedBill.billDate || selectedBill.createdAt).toLocaleDateString()}</p>
                                </div>
                                
                                <h3>Bill Information</h3>
                                <div>Order ID: ${selectedBill.orderId}</div>
                                <div>Payment Status: ${selectedBill.paymentStatus}</div>
                                
                                <h3>Items</h3>
                                <table>
                                  <thead>
                                    <tr>
                                      <th>Item</th>
                                      <th>Quantity</th>
                                      <th>Price</th>
                                      <th>Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    ${selectedBill.items ? selectedBill.items.map(item => `
                                      <tr>
                                        <td>${item.name}</td>
                                        <td>${item.quantity}</td>
                                        <td>$${item.price ? item.price.toFixed(2) : '0.00'}</td>
                                        <td>$${item.subtotal ? item.subtotal.toFixed(2) : '0.00'}</td>
                                      </tr>
                                    `).join('') : ''}
                                  </tbody>
                                </table>
                                
                                <div class="bill-total">
                                  <div><strong>Subtotal:</strong> $${selectedBill.totalAmount ? selectedBill.totalAmount.toFixed(2) : '0.00'}</div>
                                  <div><strong>Tax:</strong> $${selectedBill.tax ? selectedBill.tax.toFixed(2) : '0.00'}</div>
                                  <div><strong>Total:</strong> $${((selectedBill.finalAmount || selectedBill.total) || 0).toFixed(2)}</div>
                                </div>
                                
                                <div class="bill-footer">
                                  <p>Thank you for shopping with ChainBazzar!</p>
                                </div>
                              </body>
                              </html>
                            `;
                            
                            printWindow.document.open();
                            printWindow.document.write(content);
                            printWindow.document.close();
                            setTimeout(() => printWindow.print(), 250);
                          }}
                        >
                          Print Bill
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Bills list view
                  <>
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Bill Number</th>
                            <th>Date</th>
                            <th>Customer ID</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bills.length > 0 ? bills.map(bill => (
                            <tr key={bill._id || bill.id}>
                              <td>{bill.billNumber || bill.invoiceNumber}</td>
                              <td>{new Date(bill.billDate || bill.createdAt).toLocaleDateString()}</td>
                              <td>{bill.userId}</td>
                              <td>${((bill.finalAmount || bill.total) || 0).toFixed(2)}</td>
                              <td>
                                <span className={`status-badge ${bill.paymentStatus}`}>
                                  {bill.paymentStatus}
                                </span>
                              </td>
                              <td>
                                <button 
                                  className="action-button view"
                                  onClick={() => setSelectedBill(bill)}
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan="6" className="no-data">No bills found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {activeTab === 'products' && (
              <div className="products-container">
                <h2>Product Management</h2>
                
                <button 
                  className="add-product-button"
                  onClick={openAddProductModal}
                >
                  Add New Product
                </button>
                
                <div className="products-list">
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Seller</th>
                        <th>Verified</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product._id || product.id}>
                          <td>
                            <img 
                              src={product.imageUrl || 'https://via.placeholder.com/50'} 
                              alt={product.name}
                              className="product-thumbnail"
                            />
                          </td>
                          <td>{product.name}</td>
                          <td>${parseFloat(product.price || 0).toFixed(2)}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              value={product.stock || 0}
                              onChange={(e) => handleUpdateStock(product._id || product.id, e.target.value)}
                              className="stock-input"
                            />
                          </td>
                          <td>{product.sellerName || product.seller || 'Unassigned'}</td>
                          <td>
                            <button
                              className={`verification-button ${product.isVerified ? 'verified' : 'unverified'}`}
                              onClick={() => handleToggleVerification(product._id || product.id, product.isVerified)}
                            >
                              {product.isVerified ? 'Verified' : 'Unverified'}
                            </button>
                          </td>
                          <td>
                            <button
                              className="action-button edit-button"
                              onClick={() => openEditProductModal(product)}
                            >
                              Edit
                            </button>
                            <button
                              className="action-button delete-button"
                              onClick={() => handleRemoveProduct(product._id || product.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {productModalOpen && (
        <div className="product-modal-overlay">
          <div className="product-modal">
            <h2>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            
            {productFormError && (
              <div className="form-error-message">{productFormError}</div>
            )}
            
            {productActionSuccess && (
              <div className="form-success-message">{productActionSuccess}</div>
            )}
            
            <form onSubmit={editingProduct ? handleEditProduct : handleAddProduct}>
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={productForm.name}
                  onChange={handleProductFormChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleProductFormChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    min="0.01"
                    step="0.01"
                    value={productForm.price}
                    onChange={handleProductFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    name="stock"
                    min="0"
                    value={productForm.stock}
                    onChange={handleProductFormChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={productForm.category}
                  onChange={handleProductFormChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="home">Home & Kitchen</option>
                  <option value="books">Books</option>
                  <option value="toys">Toys & Games</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={productForm.imageUrl}
                  onChange={handleProductFormChange}
                  required
                />
              </div>
              
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isVerified"
                    checked={productForm.isVerified}
                    onChange={(e) => setProductForm(prev => ({
                      ...prev,
                      isVerified: e.target.checked
                    }))}
                  />
                  Mark as Verified
                </label>
              </div>
              
              <div className="form-buttons">
                <button
                  type="button"
                  onClick={closeProductModal}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={productActionInProgress}
                  className="submit-button"
                >
                  {productActionInProgress 
                    ? 'Processing...' 
                    : editingProduct 
                      ? 'Update Product' 
                      : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard; 