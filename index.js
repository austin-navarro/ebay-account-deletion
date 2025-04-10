const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

const PORT = process.env.PORT || 3000;
const EXPECTED_TOKEN = process.env.VERIFICATION_TOKEN;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Endpoint for Marketplace account deletion notifications
app.post('/account-deletion', (req, res) => {
  try {
    const receivedToken = req.headers['x-verification-token'];

    if (!receivedToken) {
      console.warn('Missing verification token');
      return res.status(401).json({ error: 'Missing verification token' });
    }

    if (receivedToken !== EXPECTED_TOKEN) {
      console.warn('Invalid verification token');
      return res.status(403).json({ error: 'Invalid verification token' });
    }

    const { user_id, deleted_at } = req.body;

    if (!user_id || !deleted_at) {
      console.warn('Missing required fields in request body');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('✅ Account deletion notification received:', {
      user_id,
      deleted_at,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({ 
      message: 'Notification received',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing account deletion notification:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Account Deletion Notification Service running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 