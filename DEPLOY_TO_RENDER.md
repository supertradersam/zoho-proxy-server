# Quick Guide: Deploy to Render (Free)

## Step-by-Step Instructions

### 1. Go to Render
Visit: https://render.com

### 2. Sign Up/Login
- Click "Get Started for Free"
- Sign up with your GitHub account (recommended) or email

### 3. Create New Web Service
- Click "New +" button (top right)
- Select "Web Service"

### 4. Connect Your Repository
- Choose "Public Git repository"
- Enter: `https://github.com/supertradersam/zoho-proxy-server.git`
- OR connect your GitHub account and select the repository

### 5. Configure the Service
- **Name**: `zoho-books-proxy` (or any name you like)
- **Environment**: Select `Node`
- **Region**: Choose closest to you (e.g., `Oregon (US West)`)
- **Branch**: `main`
- **Root Directory**: Leave empty (or `./` if needed)
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Select **Free**

### 6. Deploy
- Click "Create Web Service"
- Wait 2-5 minutes for deployment
- You'll see a URL like: `https://zoho-books-proxy.onrender.com`

### 7. Copy Your Service URL
- Once deployed, copy the URL from the top of the page
- Example: `https://zoho-books-proxy.onrender.com`

### 8. Update Your Frontend Config
1. Go to your app: https://samcalendar-b9182.web.app
2. Navigate to: **Zoho Books** → **Configuration** tab
3. Find the **Proxy Server URL** field (should be at the top)
4. Enter your Render service URL: `https://zoho-books-proxy.onrender.com`
5. Click **Save Configuration**

### 9. Test
1. Click **🔄 Refresh Test Access Token**
2. Click **Test Connection**
3. If successful, you're all set! ✅

## Important Notes

- **Free Tier**: Render's free tier may have cold starts (first request after inactivity may be slow)
- **Auto-Deploy**: Render will automatically redeploy when you push to GitHub
- **Logs**: Check the "Logs" tab in Render dashboard for any errors

## Troubleshooting

If the service doesn't start:
- Check the "Logs" tab in Render dashboard
- Verify `package.json` has the correct start command
- Make sure Node.js version is compatible (18+)

If you get CORS errors:
- Verify the Proxy Server URL is correct in your frontend config
- Check that the service is running (green status in Render)

