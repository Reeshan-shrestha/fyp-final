import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  CircularProgress,
  Divider,
  Chip,
  Rating,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Breadcrumbs,
  Link,
  Snackbar,
  Alert,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedIcon from '@mui/icons-material/Verified';
import StorefrontIcon from '@mui/icons-material/Storefront';
import InventoryIcon from '@mui/icons-material/Inventory';
import SupplyChainTracker from './SupplyChainTracker';
import ProductReviews from './ProductReviews';
import { useCart } from '../context/CartContext';
import * as apiService from '../services/api';

const ProductImage = styled(CardMedia)(({ theme }) => ({
  height: 500,
  backgroundSize: 'contain',
  backgroundPosition: 'center',
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)'
  }
}));

const ProductCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: theme.shadows[2],
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[5]
  }
}));

const PriceTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 'bold',
  fontSize: '2rem'
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1.5),
  color: theme.palette.text.secondary
}));

const ProductDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log(`Fetching product details for ID: ${id}`);
        const productData = await apiService.getProduct(id);
        console.log('Product data:', productData);
        setProduct(productData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product details');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart(product);
    setSnackbar({
      open: true,
      message: `${product.name} added to cart!`,
      severity: 'success'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: '#fef2f2'
          }}
        >
          <Typography color="error" variant="h5" gutterBottom fontWeight="medium">
            {error || 'Product not found'}
          </Typography>
          <Button 
            variant="contained"
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/products')}
            sx={{ mt: 2 }}
          >
            Back to Products
          </Button>
        </Paper>
      </Container>
    );
  }

  // Calculate if product is in stock
  const isInStock = product.countInStock && product.countInStock > 0;

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* Breadcrumbs Navigation */}
      <Breadcrumbs sx={{ mb: 4, px: 1 }}>
        <Link 
          color="inherit" 
          href="/products" 
          onClick={(e) => { e.preventDefault(); navigate('/products'); }}
          sx={{ cursor: 'pointer', fontWeight: 500 }}
        >
          Products
        </Link>
        {product.category && (
          <Link
            color="inherit"
            href={`/products?category=${product.category}`}
            onClick={(e) => { e.preventDefault(); navigate(`/products?category=${product.category}`); }}
            sx={{ cursor: 'pointer' }}
          >
            {product.category}
          </Link>
        )}
        <Typography color="text.primary" fontWeight="medium">{product.name}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Product Image */}
        <Grid item xs={12} md={6}>
          <ProductCard>
            <Box sx={{ p: 2 }}>
              <ProductImage
                image={product.imageUrl || product.image}
                title={product.name}
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/600x600?text=${encodeURIComponent(product.name || 'Product Image')}`;
                }}
              />
            </Box>
            
            {/* Image Verification badge */}
            {product.verified && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 1, bgcolor: 'success.light' }}>
                <Chip
                  icon={<VerifiedIcon />}
                  label="Verified Product"
                  color="success"
                  variant="filled"
                  sx={{ fontWeight: 'medium' }}
                />
              </Box>
            )}
          </ProductCard>
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 4, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 2
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              {product.name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
              <Rating 
                value={product.rating || 0} 
                precision={0.5} 
                readOnly 
                size="medium"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
                ({product.numReviews || product.reviews?.length || 0} reviews)
              </Typography>
              
              <Chip 
                label={product.category} 
                color="primary" 
                variant="outlined" 
                size="small"
                sx={{ ml: 'auto' }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <PriceTypography variant="h5">
              ${product.price.toFixed(2)}
            </PriceTypography>

            <Typography variant="body1" paragraph sx={{ mt: 2, color: 'text.primary', lineHeight: 1.7 }}>
              {product.description}
            </Typography>

            <Box sx={{ mt: 'auto', mb: 3 }}>
              <Divider sx={{ my: 2 }} />
              
              <Stack spacing={1.5}>
                <InfoItem>
                  <LocalShippingIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                  <Typography variant="body2">
                    Free shipping on orders over $50
                  </Typography>
                </InfoItem>

                <InfoItem>
                  <VerifiedIcon 
                    color={product.verified ? "success" : "disabled"} 
                    sx={{ mr: 1.5 }} 
                  />
                  <Typography variant="body2">
                    {product.verified ? "Verified product with tracking" : "Verification pending"}
                  </Typography>
                </InfoItem>

                <InfoItem>
                  <InventoryIcon sx={{ mr: 1.5 }} />
                  <Typography variant="body2">
                    <strong>Stock:</strong> {isInStock ? `${product.countInStock} available` : 'Out of stock'}
                  </Typography>
                </InfoItem>

                <InfoItem>
                  <StorefrontIcon sx={{ mr: 1.5 }} />
                  <Typography variant="body2">
                    <strong>Seller:</strong> {product.seller || 'ChainBazzar Marketplace'}
                  </Typography>
                </InfoItem>
              </Stack>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<ShoppingCartIcon />}
                fullWidth
                sx={{ 
                  py: 1.5,
                  fontWeight: 'medium',
                  boxShadow: 3
                }}
                onClick={handleAddToCart}
                disabled={!isInStock}
              >
                {!isInStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>

              <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={() => navigate('/products')}
                startIcon={<ArrowBackIcon />}
                sx={{ 
                  py: 1.5,
                  fontWeight: 'medium'
                }}
              >
                Back to Products
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Product Journey and Reviews Section - Side by Side on larger screens */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {/* Supply Chain Tracker */}
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3,
                  height: '100%',
                  borderRadius: 2
                }}
              >
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  fontWeight="medium"
                  sx={{ 
                    pb: 1, 
                    borderBottom: '1px solid', 
                    borderColor: 'divider'
                  }}
                >
                  Product Journey
                </Typography>
                <SupplyChainTracker productId={id} />
              </Paper>
            </Grid>

            {/* Reviews Section */}
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3,
                  height: '100%',
                  borderRadius: 2
                }}
              >
                <ProductReviews productId={product._id} user={user} />
              </Paper>
            </Grid>
          </Grid>
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
          sx={{ width: '100%', boxShadow: 4 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductDetail; 