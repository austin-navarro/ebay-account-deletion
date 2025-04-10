const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const crypto = require('crypto');

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

// eBay Challenge Code Verification
app.get('/account-deletion', (req, res) => {
  try {
    const challengeCode = req.query.challenge_code;
    
    if (!challengeCode) {
      console.warn('Missing challenge code');
      return res.status(400).json({ error: 'Missing challenge code' });
    }

    // Create the verification string as per eBay's requirements
    const verificationString = `${challengeCode}${EXPECTED_TOKEN}${req.protocol}://${req.get('host')}${req.originalUrl}`;
    
    // Generate SHA256 hash
    const hash = crypto
      .createHash('sha256')
      .update(verificationString)
      .digest('hex');

    console.log('✅ Challenge code verification successful');
    res.status(200).json({ challengeResponse: hash });
  } catch (error) {
    console.error('Error processing challenge code:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Account Deletion Notification Endpoint
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

    // Log the deletion request
    console.log('✅ Account deletion notification received:', {
      user_id,
      deleted_at,
      timestamp: new Date().toISOString()
    });

    // TODO: Implement your data deletion logic here
    // This is where you would delete the user's data from your systems

    res.status(200).json({ 
      message: 'Notification received and processed',
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