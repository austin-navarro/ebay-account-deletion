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

    // Get the full endpoint URL
    const endpoint = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    
    // Create hash as per eBay's requirements
    // Order must be: challengeCode + verificationToken + endpoint
    const hash = crypto.createHash('sha256');
    hash.update(challengeCode);
    hash.update(EXPECTED_TOKEN);
    hash.update(endpoint);
    const responseHash = hash.digest('hex');

    console.log('✅ Challenge code verification successful');
    console.log('Challenge code:', challengeCode);
    console.log('Endpoint:', endpoint);
    console.log('Response hash:', responseHash);
    
    // Return the response in the exact format eBay expects
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ challengeResponse: responseHash });
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
    // Log the full request for debugging
    console.log('Received deletion notification:', {
      headers: req.headers,
      body: req.body,
      timestamp: new Date().toISOString()
    });

    // Check for eBay signature header
    const ebaySignature = req.headers['x-ebay-signature'];
    if (!ebaySignature) {
      console.warn('Missing eBay signature');
      return res.status(401).json({ error: 'Missing eBay signature' });
    }

    // Validate the notification payload
    const { metadata, notification } = req.body;
    
    if (!metadata || !notification) {
      console.warn('Invalid notification format');
      return res.status(400).json({ error: 'Invalid notification format' });
    }

    if (metadata.topic !== 'MARKETPLACE_ACCOUNT_DELETION') {
      console.warn('Invalid notification topic');
      return res.status(400).json({ error: 'Invalid notification topic' });
    }

    // Extract user data
    const { username, userId, eiasToken } = notification.data || {};
    
    if (!username || !userId) {
      console.warn('Missing user data in notification');
      return res.status(400).json({ error: 'Missing user data' });
    }

    // Log the deletion request
    console.log('✅ Account deletion notification received:', {
      username,
      userId,
      eiasToken,
      notificationId: notification.notificationId,
      eventDate: notification.eventDate,
      timestamp: new Date().toISOString()
    });

    // TODO: Implement your data deletion logic here
    // This is where you would delete the user's data from your systems

    // Return 200 OK as required by eBay
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