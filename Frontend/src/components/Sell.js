import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import config from '../config';
import * as apiService from '../services/api';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Sell.css';

function Sell() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is logged in
      if (!user?._id) {
        setError('You must be logged in as a seller to view your products');
        setLoading(false);
        return;
      }
      
      // Get products for the current seller
      const token = localStorage.getItem('chainbazzar_auth_token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      // Filter products by seller ID and username
      const baseUrl = config.API_BASE_URL;
      const response = await apiService.get(`${baseUrl}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          sellerId: user._id,
          seller: user.username
        }
      });
      
      if (response && response.data) {
        // Filter out products that don't match the seller
        const filteredProducts = response.data.filter(product => 
          product.sellerId === user._id || 
          product.seller === user.username
        );
        
        console.log('Seller products retrieved:', filteredProducts);
        setProducts(filteredProducts);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(`Failed to fetch products: ${err.message}`);
      setProducts([]); // Still set empty array in case of error
    } finally {
      setLoading(false);
    }
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
      setProductFormError('Only JPEG, PNG, and GIF images are allowed');
      return;
    }
    
    if (file.size > maxSize) {
      setProductFormError('File size must be less than 5MB');
      return;
    }
    
    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
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
    
    // Validate category is one of the allowed values
    const validCategories = ['electronics', 'clothing', 'food', 'other'];
    if (!validCategories.includes(productForm.category.toLowerCase())) {
      setProductFormError(`Category must be one of: ${validCategories.join(', ')}`);
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
      
      // Get current seller ID and username
      const sellerId = user?._id || user?.id;
      const sellerUsername = user?.username;
      
      if (!sellerId || !sellerUsername) {
        setProductFormError('You must be logged in as a seller to add products');
        setProductActionInProgress(false);
        return;
      }
      
      // Check if user is a seller
      if (user?.role !== 'seller' && !user?.isSeller) {
        setProductFormError('Only seller accounts can add products');
        setProductActionInProgress(false);
        return;
      }
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description || '');
      formData.append('price', productForm.price);
      formData.append('category', productForm.category.toLowerCase());
      formData.append('countInStock', productForm.stock);
      formData.append('seller', sellerUsername);
      formData.append('sellerId', sellerId.toString());
      formData.append('sellerName', sellerUsername);
      
      // If there's a selected file, add it to form data
      if (selectedFile) {
        formData.append('image', selectedFile);
      } else if (productForm.imageUrl) {
        // If no file but imageUrl is provided
        formData.append('imageUrl', productForm.imageUrl);
      }
      
      console.log('Adding new product for seller:', sellerUsername);
      
      // Get authentication token
      const token = localStorage.getItem('chainbazzar_auth_token');
      if (!token) {
        setProductFormError('Authentication token not found. Please log in again.');
        setProductActionInProgress(false);
        return;
      }
      
      // Use the API to create the product
      const baseUrl = config.API_BASE_URL;
      const response = await apiService.post(
        `${baseUrl}/api/products`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      
      if (response && response.data) {
        console.log('Product added successfully:', response.data);
        setProductActionSuccess('Product added successfully');
        closeProductModal();
        fetchProducts(); // Refresh the list
      } else {
        throw new Error('Failed to add product - no data returned from server');
      }
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
      
      // Get current seller ID
      const sellerId = user?._id || user?.id;
      const sellerUsername = user?.username;
      
      if (!sellerId || !sellerUsername) {
        setProductFormError('You must be logged in as a seller to update products');
        setProductActionInProgress(false);
        return;
      }
      
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        // Map frontend fields to database fields
        countInStock: parseInt(productForm.stock),
        verified: editingProduct.isVerified || editingProduct.verified, // Preserve verification status
        seller: sellerUsername, // Use username instead of ID
        sellerId: sellerId.toString(), // Store the ID as a reference
        sellerName: sellerUsername // Add seller name for display
      };
      
      console.log(`Updating product ${editingProduct._id} for seller ${sellerId}:`, productData);
      
      // Try to use the API
      const token = localStorage.getItem('chainbazzar_auth_token');
      if (!token) {
        setProductFormError('Authentication token not found. Please log in again.');
        setProductActionInProgress(false);
        return;
      }
      
      await apiService.patch(
        `${config.API_BASE_URL}/api/products/${editingProduct._id}`,
        productData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
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
      
      // Try to use the API
      const token = localStorage.getItem('chainbazzar_auth_token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      await apiService.delete_(
        `${config.API_BASE_URL}/api/products/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
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
      setError('Invalid stock quantity');
      return;
    }
    
    try {
      setLoading(true);
      
      // Try to use the API
      const token = localStorage.getItem('chainbazzar_auth_token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      await apiService.patch(
        `${config.API_BASE_URL}/api/products/${productId}`,
        { countInStock: parseInt(newStock) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setProductActionSuccess('Stock updated successfully');
      fetchProducts(); // Refresh the list
    } catch (err) {
      console.error('Error updating stock:', err);
      setError(`Failed to update stock: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sell-container">
      <div className="sell-header">
        <h1>Seller Dashboard: {user?.username || 'Seller'}</h1>
        <p>Manage your products and track sales for your store</p>
        <div className="seller-id-badge">
          <span>Logged in as:</span> <strong>{user?.username}</strong> (Seller ID: {user?._id || user?.id})
        </div>
      </div>

      <div className="sell-stats">
        <div className="stat-card">
          <h3>Your Store Statistics</h3>
          <div className="stat-item">
            <span className="stat-label">Your Products:</span>
            <span className="stat-value">{products.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Verified Products:</span>
            <span className="stat-value">
              {products.filter(p => p.isVerified || p.verified).length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Account Type:</span>
            <span className="stat-value" title={user?.role}>
              Seller Account
            </span>
          </div>
        </div>
      </div>

      <div className="sell-actions">
        <button className="btn-primary" onClick={openAddProductModal}>
          Add New Product
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {productActionSuccess && <div className="success-message">{productActionSuccess}</div>}

      {loading ? (
        <div className="loading">Loading your products...</div>
      ) : (
        <div className="products-section">
          <h2>Products owned by {user?.username}</h2>
          <div className="products-section-note">
            <p>Note: Only products that belong to your seller account are displayed here.</p>
          </div>
          {products.length === 0 ? (
            <div className="no-products">
              <p>You don't have any products yet. Start selling by adding a product.</p>
            </div>
          ) : (
            <div className="product-list">
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product._id} className="product-row">
                      <td>
                        <img 
                          src={product.imageUrl || 'https://via.placeholder.com/50'} 
                          alt={product.name} 
                          className="product-thumbnail"
                        />
                      </td>
                      <td className="product-name">
                        <Link to={`/product/${product._id}`}>{product.name}</Link>
                      </td>
                      <td>${parseFloat(product.price).toFixed(2)}</td>
                      <td>
                        <div className="stock-control">
                          <input 
                            type="number" 
                            min="0" 
                            defaultValue={product.stock || product.countInStock || 0}
                            onBlur={(e) => handleUpdateStock(product._id, e.target.value)}
                            className="stock-input"
                          />
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${(product.isVerified || product.verified) ? 'verified' : 'unverified'}`}>
                          {(product.isVerified || product.verified) ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="product-actions">
                        <button 
                          onClick={() => openEditProductModal(product)}
                          className="btn-edit"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleRemoveProduct(product._id)}
                          className="btn-delete"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Product Modal */}
      {productModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="close-btn" onClick={closeProductModal}>×</button>
            </div>
            <form onSubmit={editingProduct ? handleEditProduct : handleAddProduct}>
              {productFormError && <div className="error-message">{productFormError}</div>}
              
              <div className="form-group">
                <label htmlFor="name">Product Name*</label>
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
                  <label htmlFor="price">Price ($)*</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0.01"
                    step="0.01"
                    value={productForm.price}
                    onChange={handleProductFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="category">Category*</label>
                  <select
                    id="category"
                    name="category"
                    value={productForm.category}
                    onChange={handleProductFormChange}
                    required
                    className="form-select"
                  >
                    <option value="" disabled>Select a category</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="food">Food</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="stock">Stock Quantity*</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    min="0"
                    value={productForm.stock}
                    onChange={handleProductFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="imageUpload">Product Image</label>
                  <div className="image-upload-container">
                    {imagePreview && (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                      </div>
                    )}
                    <input
                      type="file"
                      id="imageUpload"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/jpeg, image/png, image/gif"
                      className="file-input"
                    />
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => fileInputRef.current.click()}
                    >
                      Choose File
                    </button>
                    <span className="file-name">
                      {selectedFile ? selectedFile.name : 'No file chosen'}
                    </span>
                  </div>
                  <p className="form-hint">Max size: 5MB. Allowed types: JPEG, PNG, GIF</p>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="imageUrl">Or Image URL</label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={productForm.imageUrl}
                  onChange={handleProductFormChange}
                  placeholder="Enter image URL if not uploading a file"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeProductModal}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={productActionInProgress}
                >
                  {productActionInProgress ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sell; 