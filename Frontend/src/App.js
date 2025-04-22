import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navigation from './components/Navigation';
import Home from './components/Home';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import AddProduct from './components/AddProduct';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import AdminDashboard from './components/AdminDashboard';
import DevelopmentBanner from './components/DevelopmentBanner';
import Cart from './components/Cart';
import OrderConfirmation from './components/OrderConfirmation';
import ThankYouPage from './components/ThankYouPage';
import Sell from './components/Sell';
import Admin from './components/Admin';
import './App.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { authenticated, guestMode } = useAuth();
  
  // Redirect to sign in if not authenticated or in guest mode
  if (!authenticated || guestMode) {
    // Redirect to sign in, remembering the current path
    return <Navigate to={`/signin?returnTo=${encodeURIComponent(window.location.pathname)}`} />;
  }
  
  return children;
};

// Admin route protection
const AdminRoute = ({ children }) => {
  const { authenticated, guestMode, user } = useAuth();
  
  // Check if user is admin
  const isAdmin = user?.isAdmin || user?.role === 'admin';
  
  // Redirect to sign in if not authenticated or in guest mode
  if (!authenticated || guestMode) {
    return <Navigate to={`/signin?returnTo=${encodeURIComponent(window.location.pathname)}`} />;
  }
  
  // Redirect to home if authenticated but not admin
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  return children;
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#64748b',
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="app">
              <Navigation />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<ProductList />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/add-product" element={
                    <ProtectedRoute>
                      <AddProduct />
                    </ProtectedRoute>
                  } />
                  <Route path="/sell" element={
                    <ProtectedRoute>
                      <Sell />
                    </ProtectedRoute>
                  } />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin-dashboard" element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/order-confirmation" element={<OrderConfirmation />} />
                  <Route path="/thank-you" element={<ThankYouPage />} />
                </Routes>
              </main>
              <DevelopmentBanner />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;