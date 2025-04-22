import React, { useState } from 'react';
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
  Card,
  CardContent,
  Avatar
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaymentIcon from '@mui/icons-material/Payment';
import EmailIcon from '@mui/icons-material/Email';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HomeIcon from '@mui/icons-material/Home';
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

const OrderCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(1.5),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  overflow: 'hidden',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)',
  }
}));

const CardHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
}));

const ShippingCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.spacing(1.5),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
}));

const PaymentCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.spacing(1.5),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
}));

const InfoAvatar = styled(Avatar)(({ theme, bgcolor }) => ({
  backgroundColor: bgcolor || theme.palette.primary.main,
  color: 'white',
  width: 40,
  height: 40,
}));

const ThankYouPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order, bill, orderDate } = location.state || {};
  const [isPrintView, setIsPrintView] = useState(false);

  // Calculate estimated delivery date (7 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 7);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const handleViewBill = () => {
    setIsPrintView(true);
    // Set a small timeout to ensure the view is updated before printing
    setTimeout(() => {
      window.print();
      setIsPrintView(false);
    }, 300);
  };

  // If no order data, show fallback content
  if (!order) {
    return (
      <Container maxWidth="md">
        <StyledPaper>
          <Box textAlign="center">
            <SuccessIcon>
              <CheckCircleIcon />
            </SuccessIcon>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Thank You for Your Purchase!
            </Typography>
            <Typography variant="body1" paragraph>
              Your order has been placed successfully, but we couldn't find the details.
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

  // Add CSS class for print mode
  const containerClass = isPrintView ? "container print-mode" : "container";

  return (
    <Container maxWidth="md" className={containerClass}>
      <StyledPaper>
        {isPrintView && (
          <div className="print-header">
            <h1>ChainBazzar</h1>
            <p>Order Receipt</p>
            <p>Date: {new Date().toLocaleDateString()}</p>
          </div>
        )}
        
        <Box textAlign="center" className={isPrintView ? "print-visible" : ""}>
          <SuccessIcon className={isPrintView ? "print-hidden" : ""}>
            <CheckCircleIcon />
          </SuccessIcon>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            {isPrintView ? 'Order Receipt' : 'Thank You for Your Purchase!'}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" paragraph className={isPrintView ? "print-hidden" : ""}>
            Your order has been confirmed and will be shipped soon.
          </Typography>
          <Box display="flex" justifyContent="center" my={2} className={isPrintView ? "print-hidden" : ""}>
            <Chip
              icon={<EmailIcon />}
              label="Confirmation email has been sent to your registered email address"
              color="success"
              variant="outlined"
              sx={{ borderRadius: 2, py: 1.5, px: 1 }}
            />
          </Box>
        </Box>

        <OrderCard>
          <CardHeader>
            <ReceiptIcon />
            <Typography variant="h6" fontWeight="bold">
              Order Summary
            </Typography>
          </CardHeader>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <InfoAvatar bgcolor="#4361ee">
                    <ShoppingBagIcon />
                  </InfoAvatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Order ID
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {order._id || bill?.orderId || 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <InfoAvatar bgcolor="#3a86ff">
                    <AccessTimeIcon />
                  </InfoAvatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Order Date
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {orderDate || new Date().toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Order Items
                </Typography>
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <List disablePadding>
                    {order.items.map((item, index) => (
                      <React.Fragment key={index}>
                        <ListItem sx={{ py: 2, px: 3 }}>
                          <Box display="flex" alignItems="center" width="100%">
                            <Avatar 
                              sx={{ 
                                bgcolor: 'primary.light', 
                                color: 'primary.main',
                                mr: 2,
                                width: 40,
                                height: 40
                              }}
                            >
                              {index + 1}
                            </Avatar>
                            <ListItemText
                              primary={
                                <Typography variant="body1" fontWeight="medium">
                                  {item.name || `Product #${index + 1}`}
                                </Typography>
                              }
                              secondary={`Quantity: ${item.quantity} | Price: $${item.price.toFixed(2)}`}
                              sx={{ flex: 1 }}
                            />
                            <Typography variant="body1" fontWeight="bold">
                              ${(item.price * item.quantity).toFixed(2)}
                            </Typography>
                          </Box>
                        </ListItem>
                        {index < order.items.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>

            <Box mt={4}>
              <Grid container spacing={2} justifyContent="flex-end">
                <Grid item xs={12} sm={6}>
                  <Box bgcolor="grey.50" p={2} borderRadius={1}>
                    <Typography variant="body1" display="flex" justifyContent="space-between" mb={1}>
                      <span>Subtotal:</span>
                      <span>${order.subtotal?.toFixed(2) || (order.totalAmount * 0.9).toFixed(2)}</span>
                    </Typography>
                    <Typography variant="body1" display="flex" justifyContent="space-between" mb={1}>
                      <span>Tax:</span>
                      <span>${order.tax?.toFixed(2) || (order.totalAmount * 0.1).toFixed(2)}</span>
                    </Typography>
                    <Typography variant="body1" display="flex" justifyContent="space-between" mb={1}>
                      <span>Shipping:</span>
                      <span>Free</span>
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="h6" fontWeight="bold" display="flex" justifyContent="space-between">
                      <span>Total:</span>
                      <span>${order.totalAmount.toFixed(2)}</span>
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </OrderCard>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ShippingCard>
              <CardHeader>
                <LocalShippingIcon />
                <Typography variant="h6" fontWeight="bold">
                  Shipping Information
                </Typography>
              </CardHeader>
              <CardContent>
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <InfoAvatar bgcolor="#4cc9f0">
                    <HomeIcon />
                  </InfoAvatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Shipping Address
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {`${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}, ${order.shippingAddress.country}`}
                    </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" alignItems="flex-start" gap={2} mt={3}>
                  <InfoAvatar bgcolor="#4361ee">
                    <AccessTimeIcon />
                  </InfoAvatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Estimated Delivery Date
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formattedDeliveryDate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Your items will be delivered via express shipping
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </ShippingCard>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <PaymentCard>
              <CardHeader>
                <PaymentIcon />
                <Typography variant="h6" fontWeight="bold">
                  Payment Information
                </Typography>
              </CardHeader>
              <CardContent>
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <InfoAvatar bgcolor="#f72585">
                    <PaymentIcon />
                  </InfoAvatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Payment Method
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {order.paymentMethod.replace('_', ' ').toUpperCase()}
                    </Typography>
                    {order.paymentMethod === 'credit_card' && (
                      <Typography variant="body1">
                        Credit Card ending in **** 1234
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                <Box display="flex" alignItems="flex-start" gap={2} mt={3}>
                  <InfoAvatar bgcolor="#560bad">
                    <ReceiptIcon />
                  </InfoAvatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Billing Information
                    </Typography>
                    <Typography variant="body1">
                      A receipt has been sent to your email
                    </Typography>
                    <Typography variant="body2" color="success.main" mt={1}>
                      Payment Successfully Processed
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </PaymentCard>
          </Grid>
        </Grid>

        <Box textAlign="center" mt={4} className={isPrintView ? "print-hidden" : ""}>
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
            startIcon={<ReceiptIcon />}
            onClick={handleViewBill}
            color="secondary"
          >
            View Bill
          </Button>
        </Box>
        
        {isPrintView && (
          <div className="print-footer">
            <p>Thank you for shopping with ChainBazzar!</p>
            <p>For any questions about your order, please contact support@chainbazzar.com</p>
            <p>Order ID: {order._id || bill?.orderId}</p>
            <p>Bill Number: {bill?.billNumber || bill?.invoiceNumber}</p>
          </div>
        )}
      </StyledPaper>
    </Container>
  );
};

export default ThankYouPage; 