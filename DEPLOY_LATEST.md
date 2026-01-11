# Deploy Proxy Server with Latest Code (Including Stock Price API)

## Quick Deployment Guide

The proxy server has been updated with a new `/api/stock-price` endpoint for fetching real-time stock prices. Follow these steps to deploy the latest version.

## Option 1: Render.com (Recommended - Free Tier)

### If You Already Have a Render Service

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com
   - Find your existing `zoho-proxy-server` (or similar) service

2. **Trigger Manual Deploy**
   - Click on your service
   - Go to **Manual Deploy** tab
   - Click **Deploy latest commit** (if using Git)
   - OR click **Clear build cache & deploy** to force a fresh build

3. **Verify Deployment**
   - Wait 2-5 minutes for deployment
   - Check the **Logs** tab to ensure it starts successfully
   - Test the new endpoint: `https://your-service.onrender.com/api/stock-price?symbol=AAPL`

### If You Don't Have a Render Service Yet

1. **Go to Render**
   - Visit https://render.com
   - Sign up/login

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - **Important**: Set **Root Directory** to: `mycalendar/calendar-app/zoho-proxy-server`

3. **Configure Service**
   ```
   Name: zoho-proxy-server (or any name you prefer)
   Environment: Node
   Region: Choose closest to you
   Branch: main (or your default branch)
   Root Directory: mycalendar/calendar-app/zoho-proxy-server
   Build Command: npm install
   Start Command: npm start
   Plan: Free
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (2-5 minutes)
   - Copy your service URL (e.g., `https://zoho-proxy-server.onrender.com`)

## Option 2: Railway.app (Free Tier)

### If You Already Have a Railway Service

1. **Go to Railway Dashboard**
   - Visit https://railway.app
   - Find your existing service

2. **Redeploy**
   - Click on your service
   - Go to **Settings** → **Deployments**
   - Click **Redeploy** or push a new commit to trigger auto-deploy

### If You Don't Have a Railway Service

1. **Go to Railway**
   - Visit https://railway.app
   - Sign up/login with GitHub

2. **New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure**
   - Railway will auto-detect Node.js
   - Set **Root Directory** to: `mycalendar/calendar-app/zoho-proxy-server`
   - Railway will automatically deploy

## Option 3: Manual Git Push (If Using Git)

If your proxy server is connected to a Git repository:

```bash
cd mycalendar/calendar-app/zoho-proxy-server
git add .
git commit -m "Add stock price API endpoint"
git push origin main
```

This will trigger auto-deployment if you have auto-deploy enabled on Render/Railway.

## Verify the New Endpoint

After deployment, test the stock price endpoint:

### Test via Browser
```
https://your-proxy-server.onrender.com/api/stock-price?symbol=AAPL
```

### Test via curl
```bash
curl "https://your-proxy-server.onrender.com/api/stock-price?symbol=AAPL"
```

### Expected Response
```json
{
  "symbol": "AAPL",
  "price": 175.50,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Update Frontend Configuration

After deploying, make sure your frontend knows about the proxy server URL:

1. **If using AdminConfigPanel**:
   - Go to your app → Zoho Books → Configuration
   - Update "Proxy Server URL" to your deployed URL
   - Save configuration

2. **Or set environment variable** (if using):
   ```bash
   REACT_APP_PROXY_URL=https://your-proxy-server.onrender.com
   ```

## What's New in This Version

✅ **New Endpoint**: `/api/stock-price`
   - Fetches real-time stock prices from Yahoo Finance
   - Avoids CORS issues for frontend
   - Returns: `{ symbol, price, timestamp }`

✅ **Existing Endpoints** (still working):
   - `/api/zoho-books-proxy` - Zoho Books API proxy
   - `/api/refresh-zoho-token` - Token refresh
   - `/api/forexfactory-calendar` - ForexFactory calendar
   - `/api/market-news` - Market news
   - `/health` - Health check

## Troubleshooting

### Issue: Deployment fails
- Check **Logs** tab in Render/Railway dashboard
- Verify `package.json` has correct dependencies
- Ensure Node.js version is >= 18.0.0

### Issue: Stock price endpoint returns error
- Check logs for specific error
- Verify Yahoo Finance API is accessible
- Test with a valid stock symbol (e.g., AAPL, TSLA, MSFT)

### Issue: CORS errors in frontend
- Verify proxy server URL is correct
- Check that CORS is enabled (should be by default)
- Ensure frontend is calling the proxy, not Yahoo Finance directly

### Issue: Service goes to sleep (Render free tier)
- First request after inactivity may be slow (cold start)
- This is normal for free tier
- Consider upgrading to paid tier for always-on service

## Quick Test Checklist

- [ ] Service deploys successfully
- [ ] Health endpoint works: `/health`
- [ ] Stock price endpoint works: `/api/stock-price?symbol=AAPL`
- [ ] Frontend can connect to proxy server
- [ ] No CORS errors in browser console
- [ ] Stock prices load in SWING Smallcaps feature

## Next Steps

1. Deploy proxy server (follow steps above)
2. Update frontend proxy URL if needed
3. Test SWING Smallcaps feature
4. Verify stock prices load correctly

---

**Last Updated**: After adding stock price API endpoint
**Server Version**: 1.1.0 (with stock price support)
