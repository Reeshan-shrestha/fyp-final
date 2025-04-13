import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import config from '../config';
import * as apiService from '../services/api';
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
  Badge,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = ['Review Cart', 'Shipping', 'Payment', 'Confirmation'];

  const handleCheckout = async () => {
    // Check if user is logged in
    if (!user) {
      setSnackbar({
        open: true,
        message: 'Please sign in to checkout',
        severity: 'warning'
      });
      navigate('/signin', { state: { from: '/cart' } });
      return;
    }

    // Validate stock availability before proceeding
    try {
      // Check current stock for all items
      const stockCheckPromises = cart.map(async (item) => {
        const currentProduct = await apiService.getProduct(item._id);
        return {
          product: currentProduct,
          cartItem: item,
          hasEnoughStock: currentProduct.countInStock >= item.quantity
        };
      });
      
      const stockResults = await Promise.all(stockCheckPromises);
      
      // Filter items with insufficient stock
      const insufficientStockItems = stockResults.filter(item => !item.hasEnoughStock);
      
      // If there are items with insufficient stock, show an error and don't proceed
      if (insufficientStockItems.length > 0) {
        setSnackbar({
          open: true,
          message: `Some items have insufficient stock: ${insufficientStockItems.map(item => item.product.name).join(', ')}`,
          severity: 'error'
        });
        return;
      }
    } catch (error) {
      console.error('Error checking stock:', error);
      setSnackbar({
        open: true,
        message: 'Failed to validate stock. Please try again.',
        severity: 'error'
      });
      return;
    }

    try {
      // Set loading state
      setIsProcessing(true);
      setSnackbar({
        open: true,
        message: 'Processing your order...',
        severity: 'info'
      });

      // Calculate totals
      const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      const tax = subtotal * 0.1;
      const total = subtotal + tax;
      
      // Format numbers to 2 decimal places
      const formattedSubtotal = subtotal.toFixed(2);
      const formattedTax = tax.toFixed(2);
      const formattedTotal = total.toFixed(2);

      // Create order and bill data
      const orderData = {
        items: cart.map(item => ({
          productId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: parseFloat(formattedSubtotal),
        tax: parseFloat(formattedTax),
        totalAmount: parseFloat(formattedTotal),
        shippingAddress: {
          street: '123 Demo Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        },
        paymentMethod: 'credit_card',
        status: 'pending',
        userId: user?._id,
        email: user?.email,
        date: new Date().toISOString()
      };

      console.log('Sending order data:', orderData);

      // Create order using apiService
      const orderResponse = await apiService.createOrder(orderData);
      console.log('Order created successfully:', orderResponse);
      
      // Create bill record
      const billData = {
        orderId: orderResponse.data._id,
        userId: user?._id,
        items: orderData.items,
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        total: orderData.totalAmount,
        date: orderData.date,
        status: 'paid',
        shipping: orderData.shippingAddress
      };
      
      // Save bill to database
      const billResponse = await apiService.createBill(billData);
      console.log('Bill created successfully:', billResponse);

      // Clear cart and show success message
      clearCart();
      setSnackbar({
        open: true,
        message: 'Order placed successfully!',
        severity: 'success'
      });
      
      // Navigate to thank you page
      navigate('/thank-you', { 
        state: { 
          order: orderResponse.data,
          bill: billResponse.data,
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
    } finally {
      setIsProcessing(false);
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

  // Calculate cart totals
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = 0; // Free shipping
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <Container maxWidth="lg" className="cart-container">
      <Box mb={4}>
        <Stepper activeStep={checkoutStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      
      <Grid container spacing={3}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} className="cart-items-container" sx={{ borderRadius: '12px', overflow: 'hidden' }}>
            <Box display="flex" alignItems="center" gap={2} mb={3} p={2} bgcolor="primary.light" color="white">
              <Badge
                badgeContent={cart.length}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#ff3d00',
                    color: 'white',
                    fontSize: '0.85rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '12px',
                  }
                }}
              >
                <ShoppingCartIcon sx={{ fontSize: 32, color: 'white' }} />
              </Badge>
              <Typography variant="h5" className="cart-title" fontWeight="bold">
                Shopping Cart
              </Typography>
            </Box>
            <Divider className="cart-divider" />
            <Box sx={{ p: 2 }}>
              {cart.map((item) => (
                <Card key={item._id} className="cart-item-card" sx={{ mb: 2, borderRadius: '8px', overflow: 'hidden' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <CardMedia
                        component="img"
                        image={item.image || item.imageUrl}
                        alt={item.name}
                        className="cart-item-image"
                        sx={{ height: '120px', objectFit: 'contain', bgcolor: 'grey.100', p: 1 }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150x150?text=No+Image';
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={9}>
                      <CardContent className="cart-item-content">
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Typography variant="h6" className="cart-item-name" fontWeight="bold">
                            {item.name}
                          </Typography>
                          <Typography variant="h6" className="cart-item-price" color="primary.main" fontWeight="bold">
                            ${item.price.toFixed(2)}
                          </Typography>
                        </Box>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                          <Box className="quantity-controls" sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'grey.300', borderRadius: '4px', width: 'fit-content' }}>
                            <Tooltip title="Decrease quantity">
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                className="quantity-button"
                                sx={{ borderRadius: '4px 0 0 4px' }}
                              >
                                <RemoveIcon />
                              </IconButton>
                            </Tooltip>
                            <Typography variant="body1" className="quantity-display" sx={{ px: 2, py: 0.5, borderLeft: '1px solid', borderRight: '1px solid', borderColor: 'grey.300' }}>
                              {item.quantity}
                            </Typography>
                            <Tooltip title="Increase quantity">
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                className="quantity-button"
                                sx={{ borderRadius: '0 4px 4px 0' }}
                              >
                                <AddIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          <Tooltip title="Remove item">
                            <IconButton
                              onClick={() => handleRemoveItem(item._id)}
                              className="remove-button"
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Typography variant="body2" color="text.secondary" mt={1}>
                          Item Total: ${(item.price * item.quantity).toFixed(2)}
                        </Typography>
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
                sx={{ mt: 2 }}
              >
                Clear Cart
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} className="order-summary-container" sx={{ borderRadius: '12px', overflow: 'hidden' }}>
            <Box bgcolor="primary.light" color="white" p={2} display="flex" alignItems="center" gap={1}>
              <ReceiptIcon />
              <Typography variant="h6" className="order-summary-title" fontWeight="bold">
                Order Summary
              </Typography>
            </Box>
            <Divider className="summary-divider" />
            <Box className="summary-details" p={3}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body1">Subtotal:</Typography>
                <Typography variant="body1" fontWeight="medium">${subtotal.toFixed(2)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body1">Shipping:</Typography>
                <Typography variant="body1" fontWeight="medium" color="success.main">Free</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body1">Tax (10%):</Typography>
                <Typography variant="body1" fontWeight="medium">${tax.toFixed(2)}</Typography>
              </Box>
              <Divider className="summary-divider" sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between" mb={3}>
                <Typography variant="h6" fontWeight="bold">Total:</Typography>
                <Typography variant="h6" color="primary.main" fontWeight="bold">${total.toFixed(2)}</Typography>
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleCheckout}
                className="checkout-button"
                fullWidth
                startIcon={<ShoppingCartIcon />}
                disabled={isProcessing}
                sx={{ 
                  py: 1.5, 
                  fontSize: '1rem',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                  }
                }}
              >
                {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
              </Button>
              
              <Box mt={3} p={2} bgcolor="grey.100" borderRadius={1}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <CheckCircleIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5, color: 'success.main' }} />
                  Secure Checkout
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <LocalShippingIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  Free Shipping on All Orders
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <PaymentIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  Multiple Payment Options
                </Typography>
              </Box>
            </Box>
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