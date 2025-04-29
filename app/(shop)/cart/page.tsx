'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/hooks/useCart';
import { useAuth } from '@/app/providers';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Typography,
  Badge,
  Tooltip,
} from '@mui/material';
import { ShoppingCart, Delete, Add, Remove, ShoppingBag } from '@mui/icons-material';

export default function CartPage() {
  const { cart, total, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
  };

  const handleClearCart = () => {
    clearCart();
  };

  const handleCheckout = async () => {
    // Check if user is logged in
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      setIsProcessing(true);

      // Calculate totals
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * 0.1;
      const orderTotal = subtotal + tax;
      
      // In a real application, you would send order data to API
      console.log('Order data:', {
        items: cart,
        subtotal,
        tax,
        total: orderTotal,
        user
      });

      // Clear cart after successful checkout
      clearCart();
      
      // Navigate to thank you page
      router.push('/thank-you');
    } catch (error) {
      console.error('Error processing checkout:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <Container maxWidth="lg" className="min-h-screen py-12">
        <Box className="flex flex-col items-center justify-center space-y-4 py-16">
          <Badge
            badgeContent={0}
            color="primary"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '1rem',
                height: '1.5rem',
                minWidth: '1.5rem',
              }
            }}
          >
            <ShoppingCart sx={{ fontSize: 60, color: 'primary.main', opacity: 0.8 }} />
          </Badge>
          <Typography variant="h4" className="font-bold text-center">
            Your Cart is Empty
          </Typography>
          <Typography variant="body1" className="text-center max-w-md text-gray-600">
            Looks like you haven't added any items to your cart yet.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/products')}
            startIcon={<ShoppingBag />}
            className="mt-4"
          >
            Continue Shopping
          </Button>
        </Box>
      </Container>
    );
  }

  // Calculate cart totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const cartTotal = subtotal + tax;

  return (
    <Container maxWidth="lg" className="min-h-screen py-8">
      <Typography variant="h4" component="h1" className="mb-6 font-bold">
        Shopping Cart
      </Typography>
      
      <Grid container spacing={4}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} className="rounded-lg overflow-hidden">
            <Box p={3} bgcolor="primary.light" color="white">
              <Box display="flex" alignItems="center" gap={2}>
                <Badge
                  badgeContent={cart.length}
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.75rem',
                    }
                  }}
                >
                  <ShoppingCart sx={{ fontSize: 28 }} />
                </Badge>
                <Typography variant="h6" fontWeight="bold">
                  Cart Items
                </Typography>
              </Box>
            </Box>
            
            <Divider />
            
            <Box p={2}>
              {cart.map((item) => (
                <Card key={item.id} className="mb-3 rounded-lg overflow-hidden border border-gray-200">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/4 p-4 flex items-center justify-center bg-gray-50">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-24 w-auto object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="h-24 w-full bg-gray-200 flex items-center justify-center">
                          <Typography variant="body2" color="textSecondary">
                            No Image
                          </Typography>
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="flex-1 p-4">
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="h6" fontWeight="bold">
                          {item.name}
                        </Typography>
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                          ${item.price.toFixed(2)}
                        </Typography>
                      </Box>
                      
                      {item.seller && (
                        <Typography variant="body2" color="textSecondary" className="mt-1">
                          Seller: {item.seller}
                        </Typography>
                      )}
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                        <Box display="flex" alignItems="center" border="1px solid" borderColor="divider" borderRadius="4px">
                          <Tooltip title="Decrease quantity">
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              sx={{ borderRadius: '4px 0 0 4px' }}
                            >
                              <Remove />
                            </IconButton>
                          </Tooltip>
                          
                          <Typography variant="body2" sx={{ px: 2, py: 0.5, borderLeft: '1px solid', borderRight: '1px solid', borderColor: 'divider' }}>
                            {item.quantity}
                          </Typography>
                          
                          <Tooltip title="Increase quantity">
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              sx={{ borderRadius: '0 4px 4px 0' }}
                            >
                              <Add />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        
                        <Tooltip title="Remove item">
                          <IconButton
                            onClick={() => handleRemoveItem(item.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      
                      <Typography variant="body2" color="textSecondary" mt={1}>
                        Item Total: ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </CardContent>
                  </div>
                </Card>
              ))}
              
              <Button
                variant="outlined"
                color="error"
                onClick={handleClearCart}
                startIcon={<Delete />}
                className="mt-4"
              >
                Clear Cart
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} className="rounded-lg p-4">
            <Typography variant="h6" fontWeight="bold" mb={3}>
              Order Summary
            </Typography>
            
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="body1">Subtotal ({cart.length} items)</Typography>
              <Typography variant="body1" fontWeight="medium">${subtotal.toFixed(2)}</Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="body1">Tax (10%)</Typography>
              <Typography variant="body1" fontWeight="medium">${tax.toFixed(2)}</Typography>
            </Box>
            
            <Divider className="my-3" />
            
            <Box display="flex" justifyContent="space-between" mb={3}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" color="primary.main" fontWeight="bold">${cartTotal.toFixed(2)}</Typography>
            </Box>
            
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={handleCheckout}
              disabled={isProcessing}
              className="mt-2"
            >
              {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 