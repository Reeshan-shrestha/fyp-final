import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import config from '../config';
import api from '../services/authService';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  IconButton,
  Paper,
  Typography,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Divider,
  Tooltip,
  Badge
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setSnackbar({
        open: true,
        message: 'Your cart is empty!',
        severity: 'error'
      });
      return;
    }

    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please log in to complete your order',
        severity: 'error'
      });
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    try {
      // Set loading state
      setSnackbar({
        open: true,
        message: 'Processing your order...',
        severity: 'info'
      });

      // Create order data
      const orderData = {
        items: cart.map(item => ({
          productId: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
        shippingAddress: {
          street: '123 Demo Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'credit_card',
        status: 'pending'
      };

      console.log('Sending order data:', orderData);

      // Send order to backend
      const response = await fetch('http://localhost:3005/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const data = await response.json();
      console.log('Order created successfully:', data);

      // Clear cart and show success message
      clearCart();
      setSnackbar({
        open: true,
        message: 'Order placed successfully!',
        severity: 'success'
      });
      
      // Navigate to order confirmation page
      navigate('/order-confirmation', { 
        state: { 
          order: data.order,
          orderDate: new Date().toLocaleDateString()
        }
      });
    } catch (error) {
      console.error('Order creation error:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to place order. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      setSnackbar({
        open: true,
        message: 'Quantity cannot be less than 1',
        severity: 'error'
      });
      return;
    }
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
    setSnackbar({
      open: true,
      message: 'Item removed from cart',
      severity: 'info'
    });
  };

  const handleClearCart = () => {
    clearCart();
    setSnackbar({
      open: true,
      message: 'Cart cleared',
      severity: 'info'
    });
  };

  if (cart.length === 0) {
    return (
      <Box className="empty-cart-container">
        <Badge
          badgeContent={0}
          color="primary"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#4361ee',
              color: 'white',
              fontSize: '1.2rem',
              padding: '0.5rem',
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              transform: 'scale(1.2) translate(50%, -50%)',
            }
          }}
        >
          <ShoppingCartIcon sx={{ fontSize: 80, color: '#4361ee', opacity: 0.8 }} />
        </Badge>
        <Typography variant="h4" className="empty-cart-title">
          Your Cart is Empty
        </Typography>
        <Typography variant="body1" className="empty-cart-message">
          Looks like you haven't added any items to your cart yet. Start shopping to discover amazing products!
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/products')}
          className="empty-cart-button"
          startIcon={<ShoppingCartIcon />}
        >
          Continue Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" className="cart-container">
      <Grid container spacing={3}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} className="cart-items-container">
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Badge
                badgeContent={cart.length}
                color="primary"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#4361ee',
                    color: 'white',
                    fontSize: '1rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '12px',
                  }
                }}
              >
                <ShoppingCartIcon sx={{ fontSize: 32, color: '#4361ee' }} />
              </Badge>
              <Typography variant="h5" className="cart-title">
                Shopping Cart
              </Typography>
            </Box>
            <Divider className="cart-divider" />
            {cart.map((item) => (
              <Card key={item._id} className="cart-item-card">
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <CardMedia
                      component="img"
                      image={item.image}
                      alt={item.name}
                      className="cart-item-image"
                    />
                  </Grid>
                  <Grid item xs={12} sm={9}>
                    <CardContent className="cart-item-content">
                      <Typography variant="h6" className="cart-item-name">
                        {item.name}
                      </Typography>
                      <Typography variant="body1" className="cart-item-price">
                        ${item.price.toFixed(2)}
                      </Typography>
                      <Box className="quantity-controls">
                        <Tooltip title="Decrease quantity">
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            className="quantity-button"
                          >
                            <RemoveIcon />
                          </IconButton>
                        </Tooltip>
                        <Typography variant="body1" className="quantity-display">
                          {item.quantity}
                        </Typography>
                        <Tooltip title="Increase quantity">
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            className="quantity-button"
                          >
                            <AddIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Tooltip title="Remove item">
                        <IconButton
                          onClick={() => handleRemoveItem(item._id)}
                          className="remove-button"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </CardContent>
                  </Grid>
                </Grid>
              </Card>
            ))}
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearCart}
              className="clear-cart-button"
              startIcon={<DeleteIcon />}
            >
              Clear Cart
            </Button>
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} className="order-summary-container">
            <Typography variant="h6" className="order-summary-title">
              Order Summary
            </Typography>
            <Divider className="summary-divider" />
            <Box className="summary-details">
              <Typography variant="body1" className="summary-item">
                Subtotal: ${cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
              </Typography>
              <Typography variant="body1" className="summary-item">
                Shipping: Free
              </Typography>
              <Typography variant="body1" className="summary-item">
                Tax: ${(cart.reduce((total, item) => total + (item.price * item.quantity), 0) * 0.1).toFixed(2)}
              </Typography>
              <Divider className="summary-divider" />
              <Typography variant="h6" className="total-amount">
                Total: ${(cart.reduce((total, item) => total + (item.price * item.quantity), 0) * 1.1).toFixed(2)}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCheckout}
              className="checkout-button"
              fullWidth
              startIcon={<ShoppingCartIcon />}
            >
              Proceed to Checkout
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Cart; 