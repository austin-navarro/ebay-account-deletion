const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const EXPECTED_TOKEN = process.env.VERIFICATION_TOKEN;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Endpoint for Marketplace account deletion notifications
app.post('/account-deletion', (req, res) => {
  const receivedToken = req.headers['x-verification-token'];

  if (receivedToken !== EXPECTED_TOKEN) {
    console.warn('Invalid verification token:', receivedToken);
    return res.status(403).json({ error: 'Forbidden' });
  }

  console.log('✅ Account deletion notification received:', req.body);
  res.status(200).json({ message: 'Notification received' });
});

app.listen(PORT, () => {
  console.log(`🚀 Account Deletion Notification Service running on http://localhost:${PORT}`);
}); 