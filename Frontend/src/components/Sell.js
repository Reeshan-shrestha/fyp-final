import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import config from '../config';
import * as apiService from '../services/api';
import mockProducts from '../services/mockProducts';
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

  useEffect(() => {
    fetchProducts();
  }, []);

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
        
        // Filter products to only show those belonging to the current user
        const userProducts = productsData.filter(product => 
          product.seller === user._id || product.seller === user.id
        );
        
        // Map database fields to frontend fields
        const mappedProducts = userProducts.map(product => ({
          ...product,
          stock: product.countInStock,
          isVerified: product.verified
        }));
        
        setProducts(mappedProducts);
      } catch (err) {
        console.error('Error fetching products from API, using mock data:', err);
        // Fallback to mock data
        const mockData = mockProducts;
        
        // Filter mock data to simulate user's products
        const userMockProducts = mockData.filter((_, index) => index % 3 === 0); // Just a simple filter for mock data
        
        setProducts(userMockProducts);
      }
    } catch (err) {
      console.error('Error in fetchProducts:', err);
      setError('Failed to load products. Using mock data instead.');
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
        verified: false, // New products are unverified by default
        seller: user._id || user.id
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
        
        setProductActionSuccess('Product added successfully (mock data - backend unavailable)');
      }
      
      closeProductModal();
      fetchProducts(); // Refresh the list
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
        verified: editingProduct.isVerified || editingProduct.verified // Preserve verification status
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
          throw new Error('Mock product, using local state update');
        }
      } catch (apiError) {
        console.warn('Backend API error or mock product, using mock functionality:', apiError);
        
        // Remove from our local product state
        setProducts(prev => prev.filter(p => p._id !== productId));
        
        setProductActionSuccess('Product removed successfully (mock data - backend unavailable)');
        setLoading(false);
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
      setError('Invalid stock quantity');
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
          
          await apiService.patch(
            `${config.API_BASE_URL}/api/products/${productId}`,
            { countInStock: parseInt(newStock) },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          throw new Error('Mock product, using local state update');
        }
      } catch (apiError) {
        console.warn('Backend API error or mock product, using mock functionality:', apiError);
        
        // Update in our local product state
        setProducts(prev => 
          prev.map(p => p._id === productId ? { ...p, stock: parseInt(newStock), countInStock: parseInt(newStock) } : p)
        );
        
        setProductActionSuccess('Stock updated successfully (mock data - backend unavailable)');
        setLoading(false);
        return;
      }
      
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
        <h1>Seller Dashboard</h1>
        <p>Manage your products and track sales</p>
      </div>

      <div className="sell-actions">
        <button className="btn-primary" onClick={openAddProductModal}>
          Add New Product
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {productActionSuccess && <div className="success-message">{productActionSuccess}</div>}

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <div className="products-section">
          <h2>Your Products</h2>
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
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={productForm.category}
                    onChange={handleProductFormChange}
                    required
                  />
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
                  <label htmlFor="imageUrl">Image URL</label>
                  <input
                    type="text"
                    id="imageUrl"
                    name="imageUrl"
                    value={productForm.imageUrl}
                    onChange={handleProductFormChange}
                  />
                </div>
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