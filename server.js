const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

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

// Endpoint to exchange authorization code for tokens
app.post('/api/exchange-zoho-code', async (req, res) => {
  try {
    const { code, client_id, client_secret, redirect_uri } = req.body;

    if (!code || !client_id || !client_secret) {
      return res.status(400).json({ 
        error: 'code, client_id, and client_secret are required' 
      });
    }

    const url = 'https://accounts.zoho.com/oauth/v2/token';
    const params = new URLSearchParams({
      code: code,
      client_id: client_id,
      client_secret: client_secret,
      grant_type: 'authorization_code'
    });
    
    // Only add redirect_uri if it's provided and not empty
    if (redirect_uri !== undefined && redirect_uri !== null && redirect_uri !== '') {
      params.append('redirect_uri', redirect_uri);
    }

    const response = await axios.post(url, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Code Exchange Error:', error);
    
    if (error.response) {
      const zohoError = error.response.data;
      console.error('Zoho API Error:', zohoError);
      return res.status(error.response.status).json({
        error: {
          error: zohoError.error || 'unknown_error',
          error_description: zohoError.error_description || zohoError.message || 'Unknown error from Zoho',
          ...zohoError
        },
        status: error.response.status
      });
    }

    return res.status(500).json({
      error: {
        error: 'internal_error',
        error_description: error.message || 'Internal server error'
      }
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
      // Return the actual error from Zoho
      const zohoError = error.response.data;
      console.error('Zoho API Error:', zohoError);
      return res.status(error.response.status).json({
        error: {
          error: zohoError.error || 'unknown_error',
          error_description: zohoError.error_description || zohoError.message || 'Unknown error from Zoho',
          ...zohoError
        },
        status: error.response.status
      });
    }

    return res.status(500).json({
      error: {
        error: 'internal_error',
        error_description: error.message || 'Internal server error'
      }
    });
  }
});

// Helper function to fetch events for a specific date
const fetchForexFactoryEventsForDate = async (targetDate) => {
  try {
    // ForexFactory calendar URL - format: YYYY-MM-DD
    const url = `https://www.forexfactory.com/calendar?day=${targetDate}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const events = [];
    
    // Try multiple selectors for ForexFactory calendar table
    const selectors = [
      '.calendar__row',
      '.ff-cal-event',
      'tr.ff-cal-event',
      'table.calendar tr',
      '#calendar tr',
      'tr[data-eventid]',
      'tbody tr'
    ];
    
    let rows = [];
    for (const selector of selectors) {
      rows = $(selector);
      if (rows.length > 0) break;
    }
    
    rows.each((index, element) => {
      const $row = $(element);
      
      // Skip header rows
      if ($row.hasClass('calendar__row--header') || 
          $row.find('th').length > 0 ||
          $row.text().trim().toLowerCase().includes('time') ||
          $row.text().trim().toLowerCase().includes('currency')) {
        return;
      }
      
      // Try multiple selectors for each field
      const time = $row.find('.calendar__time, .ff-cal-time, td:first-child').first().text().trim();
      const currency = $row.find('.calendar__currency, .ff-cal-currency, td:nth-child(2)').first().text().trim();
      const impactElement = $row.find('.calendar__impact, .ff-cal-impact, td:nth-child(3)').first();
      const impact = impactElement.attr('class') || impactElement.attr('title') || '';
      const event = $row.find('.calendar__event, .ff-cal-event-name, td:nth-child(4)').first().text().trim();
      const actual = $row.find('.calendar__actual, .ff-cal-actual, td:nth-child(5)').first().text().trim();
      const forecast = $row.find('.calendar__forecast, .ff-cal-forecast, td:nth-child(6)').first().text().trim();
      const previous = $row.find('.calendar__previous, .ff-cal-previous, td:nth-child(7)').first().text().trim();
      
      // Determine priority from impact class or color
      let priority = 'Low';
      const impactLower = impact.toLowerCase();
      if (impactLower.includes('high') || impactLower.includes('red') || impactLower.includes('3')) {
        priority = 'High';
      } else if (impactLower.includes('medium') || impactLower.includes('orange') || 
                 impactLower.includes('yellow') || impactLower.includes('2')) {
        priority = 'Medium';
      }
      
      // Also check for impact indicators in the row
      const rowClass = $row.attr('class') || '';
      if (rowClass.includes('high') || rowClass.includes('red')) priority = 'High';
      else if (rowClass.includes('medium') || rowClass.includes('orange') || rowClass.includes('yellow')) priority = 'Medium';
      
      if (event && event.length > 0) {
        events.push({
          id: `ff_${targetDate}_${index}_${Math.random().toString(36).substr(2, 9)}`,
          title: event,
          time: time || 'TBD',
          date: targetDate,
          currency: currency || 'N/A',
          impact: priority,
          actual: actual || '',
          forecast: forecast || '',
          previous: previous || '',
          description: `${currency || 'N/A'} - ${event}`
        });
      }
    });
    
    return events;
  } catch (error) {
    console.error(`Error fetching ForexFactory events for ${targetDate}:`, error);
    return [];
  }
};

// Endpoint to fetch ForexFactory calendar events
app.get('/api/forexfactory-calendar', async (req, res) => {
  try {
    const { date, days } = req.query;
    
    // If days parameter is provided, fetch multiple days
    if (days && days === 'week') {
      const allEvents = [];
      const today = new Date();
      
      // Fetch today + next 6 days (7 days total)
      for (let i = 0; i < 7; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + i);
        const dateStr = targetDate.toISOString().split('T')[0];
        const events = await fetchForexFactoryEventsForDate(dateStr);
        allEvents.push(...events);
        
        // Small delay to avoid rate limiting
        if (i < 6) await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      return res.json({ events: allEvents, dateRange: 'week' });
    } else if (days && parseInt(days) > 1) {
      // Fetch specific number of days
      const allEvents = [];
      const startDate = date ? new Date(date) : new Date();
      
      for (let i = 0; i < parseInt(days); i++) {
        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + i);
        const dateStr = targetDate.toISOString().split('T')[0];
        const events = await fetchForexFactoryEventsForDate(dateStr);
        allEvents.push(...events);
        
        // Small delay to avoid rate limiting
        if (i < parseInt(days) - 1) await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      return res.json({ events: allEvents, days: parseInt(days) });
    } else {
      // Single date fetch (default behavior)
      const targetDate = date || new Date().toISOString().split('T')[0];
      const events = await fetchForexFactoryEventsForDate(targetDate);
      return res.json({ events, date: targetDate });
    }
  } catch (error) {
    console.error('ForexFactory Calendar Error:', error);
    
    if (error.response) {
      return res.status(error.response.status).json({
        error: error.message,
        events: []
      });
    }
    
    return res.status(500).json({
      error: error.message || 'Failed to fetch ForexFactory calendar',
      events: []
    });
  }
});

// Endpoint to fetch market news from various sources
app.get('/api/market-news', async (req, res) => {
  try {
    const { source } = req.query;
    
    // For now, return mock data structure
    // In production, you would integrate with actual news APIs like:
    // - NewsAPI.org
    // - Alpha Vantage
    // - Financial Modeling Prep
    // - RSS feeds from financial news sites
    
    const articles = [];
    
    // Mock structure for different sources
    if (source === 'investing') {
      // Would fetch from Investing.com RSS or API
      articles.push({
        title: 'Futures Market Update',
        description: 'Latest updates from futures markets',
        url: 'https://www.investing.com/economic-calendar/',
        publishedAt: new Date().toISOString()
      });
    } else if (source === 'marketwatch') {
      // Would fetch from MarketWatch RSS or API
      articles.push({
        title: 'Stock Market News',
        description: 'Breaking news from stock markets',
        url: 'https://www.marketwatch.com/markets',
        publishedAt: new Date().toISOString()
      });
    } else if (source === 'bloomberg') {
      // Would fetch from Bloomberg RSS or API
      articles.push({
        title: 'Bloomberg Markets Update',
        description: 'Latest Bloomberg market analysis',
        url: 'https://www.bloomberg.com/markets',
        publishedAt: new Date().toISOString()
      });
    }
    
    return res.json({ articles, source });
  } catch (error) {
    console.error('Market News Error:', error);
    
    return res.status(500).json({
      error: error.message || 'Failed to fetch market news',
      articles: []
    });
  }
});

app.listen(PORT, () => {
  console.log(`Zoho Books Proxy Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

