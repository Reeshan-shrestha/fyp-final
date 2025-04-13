import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Typography, 
  Paper, 
  Box, 
  CircularProgress, 
  Divider,
  Tooltip,
  Chip
} from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';

// Icons
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import StoreIcon from '@mui/icons-material/Store';
import FactoryIcon from '@mui/icons-material/Factory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarehouseIcon from '@mui/icons-material/Warehouse';

const SupplyChainTracker = ({ productId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupplyChainData = async () => {
      try {
        const response = await axios.get(`http://localhost:3005/api/supply-chain/${productId}`);
        setEvents(response.data.events);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching supply chain data:', error);
        setError('Failed to fetch supply chain data');
        setLoading(false);
      }
    };

    if (productId) {
      fetchSupplyChainData();
    }
  }, [productId]);

  // Function to get appropriate icon for different supply chain events
  const getEventIcon = (eventType) => {
    switch (eventType.toLowerCase()) {
      case 'manufactured':
      case 'production':
        return <FactoryIcon />;
      case 'packaged':
      case 'packaging':
        return <InventoryIcon />;
      case 'shipped':
      case 'shipping':
        return <LocalShippingIcon />;
      case 'delivered':
      case 'delivery':
        return <CheckCircleIcon />;
      case 'stored':
      case 'storage':
        return <WarehouseIcon />;
      case 'retail':
      case 'store arrival':
        return <StoreIcon />;
      default:
        return <InventoryIcon />;
    }
  };

  // Color based on event type
  const getEventColor = (eventType) => {
    switch (eventType.toLowerCase()) {
      case 'manufactured':
      case 'production':
        return 'secondary';
      case 'packaged':
      case 'packaging':
        return 'info';
      case 'shipped':
      case 'shipping':
        return 'primary';
      case 'delivered':
      case 'delivery':
        return 'success';
      case 'stored':
      case 'storage':
        return 'warning';
      case 'retail':
      case 'store arrival':
        return 'success';
      default:
        return 'grey';
    }
  };

  // Format the event name for display
  const formatEventName = (name) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format timestamp to readable time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Supply Chain Tracking
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No supply chain events available for this product.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Supply Chain Tracking
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Chip 
          icon={<FactoryIcon fontSize="small" />} 
          label="Verified on Blockchain" 
          color="success" 
          size="small"
          sx={{ mr: 1 }}
        />
        <Typography variant="caption" color="text.secondary">
          {events.length} verified events
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Timeline position="alternate">
        {events.map((event, index) => (
          <TimelineItem key={index}>
            <TimelineOppositeContent color="text.secondary">
              <Typography variant="body2">{formatDate(event.timestamp)}</Typography>
              <Typography variant="caption">{formatTime(event.timestamp)}</Typography>
            </TimelineOppositeContent>
            
            <TimelineSeparator>
              <TimelineDot color={getEventColor(event.eventType)}>
                <Tooltip title={formatEventName(event.eventType)}>
                  {getEventIcon(event.eventType)}
                </Tooltip>
              </TimelineDot>
              {index < events.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            
            <TimelineContent>
              <Typography variant="subtitle2">
                {formatEventName(event.eventType)}
              </Typography>
              
              <Typography variant="body2">
                {event.location}
              </Typography>
              
              {event.details && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {event.details}
                </Typography>
              )}
              
              {event.transactionHash && (
                <Tooltip title="View on Blockchain Explorer">
                  <Typography 
                    variant="caption" 
                    color="primary" 
                    sx={{ 
                      display: 'block', 
                      mt: 0.5, 
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      '&:hover': { color: 'primary.dark' }
                    }}
                    onClick={() => window.open(`https://etherscan.io/tx/${event.transactionHash}`, '_blank')}
                  >
                    Tx: {event.transactionHash.substring(0, 10)}...
                  </Typography>
                </Tooltip>
              )}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Paper>
  );
};

export default SupplyChainTracker; 