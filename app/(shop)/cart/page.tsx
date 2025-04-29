'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart, CartItem } from '../../hooks/useCart';
import { useAuth } from '../../providers';
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

interface OrderResponse {
  order: {
    _id: string;
    items: Array<{
      product: string;
      quantity: number;
      price: number;
    }>;
    totalAmount: number;
    sellerId: string;
  };
}

interface SellerItems {
  items: CartItem[];
  subtotal: number;
}

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

      // Group items by seller
      const itemsBySeller = cart.reduce<Record<string, SellerItems>>((acc, item) => {
        const sellerId = item.seller || 'unknown';
        if (!acc[sellerId]) {
          acc[sellerId] = {
            items: [],
            subtotal: 0
          };
        }
        acc[sellerId].items.push(item);
        acc[sellerId].subtotal += item.price * item.quantity;
        return acc;
      }, {} as Record<string, SellerItems>);

      // Create orders for each seller
      const orderPromises = Object.entries(itemsBySeller).map(async ([sellerId, { items, subtotal }]) => {
        const tax = subtotal * 0.1;
        const total = subtotal + tax;

        const orderData = {
          items: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          totalAmount: total,
          sellerId,
          shippingAddress: {
            street: '123 Demo Street',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'Test Country'
          },
          paymentMethod: 'credit_card'
        };

        try {
          const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(orderData)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to create order for seller ${sellerId}`);
          }

          return await response.json() as OrderResponse;
        } catch (error) {
          console.error(`Error creating order for seller ${sellerId}:`, error);
          throw error;
        }
      });

      // Wait for all orders to be created
      const results = await Promise.all(orderPromises);

      // Store order information for the thank you page
      localStorage.setItem('lastOrder', JSON.stringify({
        orderNumber: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleDateString(),
        email: user?.email,
        orders: results.map(result => result.order)
      }));

      // Clear cart after successful checkout
      clearCart();
      
      // Navigate to thank you page
      router.push('/thank-you');
    } catch (error: any) {
      console.error('Error processing checkout:', error);
      // Show error message to user
      alert(error.message || 'Failed to process checkout. Please try again.');
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {/* Cart Items */}
        <Box sx={{ flex: '1 1 60%', minWidth: 300 }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
              Shopping Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
            </Typography>
            <Divider sx={{ my: 2 }} />
            {cart.map((item) => (
              <Card key={item.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.name}
                        sx={{
                          width: 80,
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 1
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">{item.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Seller: {item.seller || 'Unknown Seller'}
                        </Typography>
                        <Typography variant="body1" color="primary">
                          ${item.price.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        <Remove />
                      </IconButton>
                      <Typography>{item.quantity}</Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        <Add />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Box>
        
        {/* Order Summary */}
        <Box sx={{ flex: '1 1 30%', minWidth: 300 }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal:</Typography>
              <Typography>${subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Tax (10%):</Typography>
              <Typography>${tax.toFixed(2)}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">${cartTotal.toFixed(2)}</Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleCheckout}
              disabled={isProcessing}
              sx={{ mb: 2 }}
            >
              {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
            </Button>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={handleClearCart}
              disabled={isProcessing}
            >
              Clear Cart
            </Button>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
} 