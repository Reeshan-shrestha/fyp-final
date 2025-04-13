import React from 'react';
import { Alert } from 'react-bootstrap';

const DevelopmentBanner = () => {
  // Only show in development environment
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <Alert 
      variant="info" 
      className="mb-0 text-center" 
      style={{ 
        borderRadius: 0, 
        fontSize: '0.85rem', 
        padding: '0.25rem',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1030
      }}
    >
      <strong>Development Mode:</strong> Using mock data if API calls fail
    </Alert>
  );
};

export default DevelopmentBanner; 