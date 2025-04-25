import React from 'react';
import { Typography, Container, Paper, Button, Grid, Box } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import VerifiedIcon from '@mui/icons-material/Verified';
import PendingIcon from '@mui/icons-material/Pending';
import LaunchIcon from '@mui/icons-material/Launch';

const Blockchain = () => {
  const openNextJsBlockchainDashboard = () => {
    // Open in a new tab to avoid conflicts between React Router and Next.js routing
    window.open('http://localhost:3000/blockchain/dashboard', '_blank', 'noopener,noreferrer');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <AccountBalanceWalletIcon sx={{ fontSize: 60, color: '#4361ee', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Blockchain Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            View your blockchain transactions and activity on ChainBazzar
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', backgroundColor: '#f8f9fa', border: '1px solid #e3e6f0' }}>
              <Typography variant="h6" gutterBottom>
                <VerifiedIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#4caf50' }} />
                Blockchain Verification
              </Typography>
              <Typography variant="body2" paragraph>
                ChainBazzar uses blockchain technology to verify transactions, ensuring security and transparency for all purchases.
              </Typography>
              <Typography variant="body2">
                Each transaction is recorded on the Ethereum blockchain, providing an immutable record of your purchase history.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', backgroundColor: '#f8f9fa', border: '1px solid #e3e6f0' }}>
              <Typography variant="h6" gutterBottom>
                <PendingIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#ff9800' }} />
                Transaction Monitoring
              </Typography>
              <Typography variant="body2" paragraph>
                Track the status of your transactions in real-time, from pending to verified on the blockchain.
              </Typography>
              <Typography variant="body2">
                Our comprehensive dashboard provides detailed analytics on transaction volume, verification rates, and wallet activity.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            size="large" 
            endIcon={<LaunchIcon />}
            onClick={openNextJsBlockchainDashboard}
            sx={{ 
              backgroundColor: '#4361ee',
              '&:hover': {
                backgroundColor: '#3a56d4'
              },
              px: 4,
              py: 1.5
            }}
          >
            Open Blockchain Dashboard
          </Button>
          <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
            This will open the full-featured blockchain dashboard in a new window
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Blockchain; 