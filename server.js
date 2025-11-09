const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Zoho Books Proxy Server is running' });
});

// Proxy endpoint for Zoho Books API calls
app.post('/api/zoho-books-proxy', async (req, res) => {
  try {
    const { method, url, headers, data, params } = req.body;

    if (!method || !url) {
      return res.status(400).json({ error: 'Method and URL are required' });
    }

    // Validate that the URL is for Zoho Books or Zoho Accounts
    if (!url.includes('books.zoho.com') && !url.includes('accounts.zoho.com')) {
      return res.status(400).json({ 
        error: 'Invalid URL. Only Zoho Books and Zoho Accounts URLs are allowed' 
      });
    }

    const config = {
      method: method.toUpperCase(),
      url: url,
      headers: headers || {},
      ...(data && { data: data }),
      ...(params && { params: params })
    };

    const response = await axios(config);

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Zoho Books Proxy Error:', error);
    
    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data || error.message,
        status: error.response.status
      });
    }

    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
});

// Endpoint to refresh Zoho access token
app.post('/api/refresh-zoho-token', async (req, res) => {
  try {
    const { refresh_token, client_id, client_secret } = req.body;

    if (!refresh_token || !client_id || !client_secret) {
      return res.status(400).json({ 
        error: 'refresh_token, client_id, and client_secret are required' 
      });
    }

    const url = 'https://accounts.zoho.com/oauth/v2/token';
    const params = new URLSearchParams({
      refresh_token: refresh_token,
      client_id: client_id,
      client_secret: client_secret,
      grant_type: 'refresh_token'
    });

    const response = await axios.post(url, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Token Refresh Error:', error);
    
    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data || error.message,
        status: error.response.status
      });
    }

    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Zoho Books Proxy Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

