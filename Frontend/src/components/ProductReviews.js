import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper, 
  Box, 
  CircularProgress, 
  Rating, 
  Divider, 
  TextField,
  Button,
  Avatar,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import VerifiedIcon from '@mui/icons-material/Verified';
import PersonIcon from '@mui/icons-material/Person';
import StoreIcon from '@mui/icons-material/Store';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import * as apiService from '../services/api';

const ReviewItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
    marginBottom: 0
  }
}));

const VerifiedBadge = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  color: theme.palette.success.main,
  fontSize: '0.75rem'
}));

const UserTypeBadge = styled(Chip)(({ theme, type }) => ({
  backgroundColor: type === 'admin' 
    ? theme.palette.error.main 
    : type === 'seller' 
      ? theme.palette.primary.main 
      : theme.palette.secondary.main,
  color: theme.palette.common.white,
  marginLeft: theme.spacing(1)
}));

const PurchaseVerifiedBadge = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.success.main,
  color: theme.palette.common.white,
  marginLeft: theme.spacing(1)
}));

const ProductReviews = ({ productId, user }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReview, setNewReview] = useState({
    title: '',
    rating: 0,
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await apiService.getProductReviews(productId);
        setReviews(data.reviews || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError('Failed to fetch reviews');
        setLoading(false);
        setReviews([]);
      }
    };

    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (event, newValue) => {
    setNewReview(prev => ({
      ...prev,
      rating: newValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.rating || !newReview.comment) {
      setAlert({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    try {
      setSubmitting(true);
      const reviewData = {
        ...newReview,
        productId,
        userId: user._id,
        userType: user.role
      };
      
      await apiService.createProductReview(reviewData);
      
      // Refresh reviews
      const data = await apiService.getProductReviews(productId);
      setReviews(data.reviews);
      
      // Reset the form
      setNewReview({
        title: '',
        rating: 0,
        comment: '',
      });
      
      setAlert({
        open: true,
        message: 'Review submitted successfully!',
        severity: 'success'
      });
      
      setSubmitting(false);
    } catch (error) {
      setAlert({
        open: true,
        message: error.response?.data?.message || 'Failed to submit review',
        severity: 'error'
      });
      setSubmitting(false);
      console.error('Error submitting review:', error);
    }
  };

  const handleCloseAlert = () => {
    setAlert(prev => ({
      ...prev,
      open: false
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getUserTypeIcon = (type) => {
    switch (type) {
      case 'admin':
        return <AdminPanelSettingsIcon />;
      case 'seller':
        return <StoreIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const formatUserType = (type) => {
    if (!type) return 'Customer';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && (!reviews || reviews.length === 0)) {
    return (
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Customer Reviews
      </Typography>
      
      {/* Review form */}
      {user && (
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Write a Review
          </Typography>
          
          <TextField
            fullWidth
            label="Review Title (Optional)"
            name="title"
            value={newReview.title}
            onChange={handleInputChange}
            margin="normal"
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ mb: 2 }}>
            <Typography component="legend">Rating</Typography>
            <Rating
              name="rating"
              value={newReview.rating}
              onChange={handleRatingChange}
              precision={0.5}
            />
          </Box>
          
          <TextField
            fullWidth
            label="Your Review"
            name="comment"
            value={newReview.comment}
            onChange={handleInputChange}
            margin="normal"
            multiline
            rows={4}
            required
            helperText="Minimum 10 characters required"
          />
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            disabled={submitting || !newReview.rating || newReview.comment.length < 10}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </Box>
      )}
      
      <Divider sx={{ my: 3 }} />
      
      {/* Reviews list */}
      <Typography variant="subtitle1" gutterBottom>
        {reviews?.length || 0} {reviews?.length === 1 ? 'Review' : 'Reviews'}
      </Typography>
      
      {(!reviews || reviews.length === 0) ? (
        <Typography variant="body2" color="text.secondary">
          Be the first to review this product!
        </Typography>
      ) : (
        <Box sx={{ mt: 2 }}>
          {reviews.map((review) => (
            <ReviewItem key={review._id || review.id}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {getUserTypeIcon(review.userType)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2">{review.userName || 'Anonymous User'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(review.timestamp)}
                    </Typography>
                  </Box>
                  <UserTypeBadge 
                    icon={getUserTypeIcon(review.userType)}
                    label={formatUserType(review.userType)}
                    size="small"
                  />
                  {review.purchaseVerified && (
                    <PurchaseVerifiedBadge
                      icon={<LocalShippingIcon />}
                      label="Verified Purchase"
                      size="small"
                    />
                  )}
                </Box>
                
                {review.verified && (
                  <VerifiedBadge>
                    <VerifiedIcon fontSize="small" />
                    <Typography variant="caption">Verified</Typography>
                  </VerifiedBadge>
                )}
              </Box>
              
              {review.title && (
                <Typography variant="subtitle1" sx={{ mt: 1, mb: 0.5 }}>
                  {review.title}
                </Typography>
              )}
              
              <Rating value={review.rating || 0} precision={0.5} readOnly size="small" />
              
              <Typography variant="body2" sx={{ mt: 1 }}>
                {review.comment || 'No comment provided'}
              </Typography>
            </ReviewItem>
          ))}
        </Box>
      )}

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ProductReviews; 