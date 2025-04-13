import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Typography,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '8px',
    background: 'linear-gradient(90deg, #4361ee, #4895ef)',
  },
}));

const SuccessIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  '& svg': {
    fontSize: 80,
    color: '#10b981',
  },
}));

const OrderSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '0.9rem',
  padding: theme.spacing(1),
}));

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order, orderDate } = location.state || {};

  // If no order data, show fallback content
  if (!order) {
    return (
      <Container maxWidth="md">
        <StyledPaper>
          <Box textAlign="center">
            <SuccessIcon>
              <CheckCircleOutlineIcon />
            </SuccessIcon>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Order Confirmed!
            </Typography>
            <Typography variant="body1" paragraph>
              Your order has been placed successfully.
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/products')}
              sx={{ mt: 2 }}
            >
              Continue Shopping
            </Button>
          </Box>
        </StyledPaper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <StyledPaper>
        <Box textAlign="center">
          <SuccessIcon>
            <CheckCircleOutlineIcon />
          </SuccessIcon>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Thank You for Your Order!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            Your order has been confirmed and will be shipped soon.
          </Typography>
          <Box display="flex" justifyContent="center" my={2}>
            <StatusChip
              icon={<LocalShippingIcon />}
              label={`Status: ${order.status.toUpperCase()}`}
              color="primary"
            />
          </Box>
        </Box>

        <OrderSection>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Order Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Order Number
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {order._id || 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Order Date
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {orderDate || new Date().toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Payment Method
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {order.paymentMethod.replace('_', ' ').toUpperCase()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Shipping Address
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {`${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`}
              </Typography>
            </Grid>
          </Grid>
        </OrderSection>

        <Divider />

        <OrderSection>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Order Items
          </Typography>
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <List disablePadding>
              {order.items.map((item, index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{ py: 2, px: 3 }}>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center">
                          <ShoppingBagIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="body1" fontWeight="medium">
                            Product #{index + 1}
                          </Typography>
                        </Box>
                      }
                      secondary={`Quantity: ${item.quantity}`}
                    />
                    <Typography variant="body1" fontWeight="bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </ListItem>
                  {index < order.items.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </OrderSection>

        <Divider />

        <OrderSection>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}></Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" fontWeight="medium" display="flex" justifyContent="space-between">
                <span>Subtotal:</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </Typography>
              <Typography variant="body1" fontWeight="medium" display="flex" justifyContent="space-between">
                <span>Tax:</span>
                <span>${(order.totalAmount * 0.1).toFixed(2)}</span>
              </Typography>
              <Typography variant="body1" fontWeight="medium" display="flex" justifyContent="space-between">
                <span>Shipping:</span>
                <span>Free</span>
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight="bold" display="flex" justifyContent="space-between">
                <span>Total:</span>
                <span>${(order.totalAmount * 1.1).toFixed(2)}</span>
              </Typography>
            </Grid>
          </Grid>
        </OrderSection>

        <Box textAlign="center" mt={4}>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/products')}
            sx={{ mr: 2 }}
          >
            Continue Shopping
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/account/orders')}
          >
            View All Orders
          </Button>
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default OrderConfirmation; 