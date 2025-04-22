'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../Frontend/src/context/AuthContext';
import styles from './sell.module.css';

// Import AddProduct component after moving it
import AddProductForm from '../../Frontend/src/components/AddProduct';

export default function SellPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Check if user is logged in and is a seller or admin
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'seller' && user.role !== 'admin') {
        // User doesn't have permission
        setAuthorized(false);
      } else {
        setAuthorized(true);
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!authorized && !loading) {
    return (
      <div className={styles.accessDenied}>
        <div className={styles.container}>
          <h1>Access Denied</h1>
          <p>You must be a seller or admin to access this page.</p>
          <button 
            className={styles.button}
            onClick={() => router.push('/')}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sellPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Sell on ChainBazzar</h1>
          <p>Add your products to our marketplace</p>
        </div>

        <AddProductForm />
      </div>
    </div>
  );
} 