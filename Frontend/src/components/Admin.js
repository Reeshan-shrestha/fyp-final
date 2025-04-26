import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as apiService from '../services/api';
import './Admin.css';

function Admin() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Check if user is admin
  const isAdmin = user?.isAdmin || user?.role === 'admin';
  
  useEffect(() => {
    document.title = 'Admin Dashboard - ChainBazzar';
  }, []);

  if (!isAdmin) {
    return (
      <div className="admin-container">
        <h1>Access Denied</h1>
        <p>You must be an admin to view this page.</p>
      </div>
    );
  }
  
  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.username || 'Admin'}! Manage your store settings and perform administrative tasks here.</p>
      
      <div className="admin-sections">
        <section className="admin-section">
          <h2>Admin Controls</h2>
          <p>Manage products, users, and other administrative tasks from the admin dashboard.</p>
        </section>
      </div>
    </div>
  );
}

export default Admin; 