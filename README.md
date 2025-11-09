# Zoho Books Proxy Server

A simple Express.js server to proxy Zoho Books API calls and avoid CORS issues.

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3001`

## Deployment Options

### Option 1: Render (Recommended - Free Tier Available)

1. Go to https://render.com
2. Sign up/login
3. Click "New +" → "Web Service"
4. Connect your GitHub repository (or deploy from this folder)
5. Configure:
   - **Name**: `zoho-books-proxy`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

6. Click "Create Web Service"

The service will be available at: `https://zoho-books-proxy.onrender.com`

### Option 2: Railway (Free Tier Available)

1. Go to https://railway.app
2. Sign up/login
3. Click "New Project" → "Deploy from GitHub"
4. Select this repository
5. Railway will auto-detect Node.js and deploy

### Option 3: Fly.io (Free Tier Available)

1. Install Fly CLI: `npm install -g @fly/cli`
2. Run: `fly launch`
3. Follow the prompts

### Option 4: Vercel (Free Tier Available)

1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel`
3. Follow the prompts

## Environment Variables

No environment variables required for basic operation. The server uses the PORT environment variable (defaults to 3001).

## API Endpoints

### POST /api/zoho-books-proxy
Proxies any Zoho Books API call.

**Request Body:**
```json
{
  "method": "GET",
  "url": "https://books.zoho.com/api/v3/organizations/123456",
  "headers": {
    "Authorization": "Zoho-oauthtoken YOUR_TOKEN"
  }
}
```

### POST /api/refresh-zoho-token
Refreshes a Zoho access token.

**Request Body:**
```json
{
  "refresh_token": "YOUR_REFRESH_TOKEN",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET"
}
```

### GET /health
Health check endpoint.

