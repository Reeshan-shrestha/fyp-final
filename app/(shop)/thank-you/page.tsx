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
  Chip,
  List,
  ListItem,
  ListItemText,
  Grid
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import StorefrontIcon from '@mui/icons-material/Storefront';

interface OrderInfo {
  orderNumber: string;
  date: string;
  email: string;
  orders: Array<{
    _id: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      seller: string;
    }>;
    totalAmount: number;
    sellerId: string;
    seller: string;
  }>;
  bills: Array<{
    billNumber: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    total: number;
    sellerId: string;
  }>;
}

export default function ThankYouPage() {
  const router = useRouter();
  const [orderInfo, setOrderInfo] = useState<OrderInfo>({
    orderNumber: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
    date: new Date().toLocaleDateString(),
    email: 'customer@example.com',
    orders: [],
    bills: []
  });

  useEffect(() => {
    // Get order data from localStorage
    const orderData = localStorage.getItem('lastOrder');
    if (orderData) {
      try {
        const parsedData = JSON.parse(orderData);
        setOrderInfo({
          ...parsedData,
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

  const calculateTotalAmount = () => {
    return orderInfo.orders.reduce((total, order) => total + order.totalAmount, 0);
  };

  return (
    <Container maxWidth="md" className="min-h-screen py-12">
      <Paper elevation={3} className="p-8 rounded-lg">
        <Box className="flex flex-col items-center text-center mb-8 space-y-4">
          <CheckCircleIcon
            color="success"
            sx={{ fontSize: 64, mb: 2 }}
          />
          <Typography variant="h4" component="h1" className="font-bold">
            Thank You for Your Orders!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your orders have been placed successfully. We've sent confirmation emails with all the details.
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

        <Box className="my-8">
          <Typography variant="h6" className="font-bold mb-4">
            Orders by Seller
          </Typography>

          {orderInfo.orders.map((order, index) => (
            <Paper key={order._id} elevation={1} className="p-4 mb-4 rounded-lg">
              <Box className="flex items-center mb-3">
                <StorefrontIcon className="mr-2" />
                <Typography variant="subtitle1" className="font-medium">
                  {order.seller || `Seller ${index + 1}`}
                </Typography>
              </Box>

              <List>
                {order.items.map((item, itemIndex) => (
                  <ListItem key={itemIndex} className="px-0">
                    <ListItemText
                      primary={item.name}
                      secondary={`Quantity: ${item.quantity} | Price: $${item.price.toFixed(2)}`}
                    />
                    <Typography variant="body1" className="font-medium">
                      ${(item.quantity * item.price).toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>

              <Divider className="my-3" />

              <Box className="flex justify-end">
                <Typography variant="subtitle1" className="font-bold">
                  Seller Total: ${order.totalAmount.toFixed(2)}
                </Typography>
              </Box>
            </Paper>
          ))}

          <Box className="bg-gray-50 p-4 rounded-md mt-6">
            <Typography variant="h6" className="font-bold text-right">
              Total Order Amount: ${calculateTotalAmount().toFixed(2)}
            </Typography>
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