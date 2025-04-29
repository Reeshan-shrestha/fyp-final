'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Divider,
  Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

export default function ThankYouPage() {
  const router = useRouter();
  const [orderInfo, setOrderInfo] = useState({
    orderNumber: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
    date: new Date().toLocaleDateString(),
    email: 'customer@example.com'
  });

  useEffect(() => {
    // Redirect to home if user came directly to this page without checkout
    // In a real app, this would check session storage or context for order data
    const orderData = localStorage.getItem('lastOrder');
    if (orderData) {
      try {
        setOrderInfo({
          ...JSON.parse(orderData),
          orderNumber: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
          date: new Date().toLocaleDateString()
        });
        // Clear after using
        localStorage.removeItem('lastOrder');
      } catch (error) {
        console.error('Error parsing order data', error);
      }
    }
  }, []);

  return (
    <Container maxWidth="md" className="min-h-screen py-12">
      <Paper elevation={3} className="p-8 rounded-lg">
        <Box className="flex flex-col items-center text-center mb-8 space-y-4">
          <CheckCircleIcon
            color="success"
            sx={{ fontSize: 64, mb: 2 }}
          />
          <Typography variant="h4" component="h1" className="font-bold">
            Thank You for Your Order!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your order has been placed successfully. We've sent a confirmation email with all the details.
          </Typography>
        </Box>

        <Divider className="my-6" />

        <Box className="my-8">
          <Typography variant="h6" className="font-bold mb-4">
            Order Details
          </Typography>
          
          <Box className="bg-gray-50 p-4 rounded-md space-y-3">
            <Box className="flex flex-wrap justify-between items-center">
              <Typography variant="body1" className="font-medium">
                Order Number:
              </Typography>
              <Chip 
                label={orderInfo.orderNumber} 
                color="primary" 
                variant="outlined" 
                className="font-mono"
              />
            </Box>
            
            <Box className="flex flex-wrap justify-between items-center">
              <Typography variant="body1" className="font-medium">
                Order Date:
              </Typography>
              <Typography variant="body1">
                {orderInfo.date}
              </Typography>
            </Box>
            
            <Box className="flex flex-wrap justify-between items-center">
              <Typography variant="body1" className="font-medium">
                Email:
              </Typography>
              <Typography variant="body1">
                {orderInfo.email}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider className="my-6" />

        <Box className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button 
            variant="outlined"
            onClick={() => router.push('/orders')}
            className="px-6"
          >
            View My Orders
          </Button>
          
          <Button 
            variant="contained"
            onClick={() => router.push('/products')}
            startIcon={<ShoppingBagIcon />}
            className="px-6"
          >
            Continue Shopping
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 