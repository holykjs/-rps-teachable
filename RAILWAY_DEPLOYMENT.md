# 🚀 Railway Deployment Guide

## Quick Deploy (Recommended)

### Option 1: One-Click Deploy
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/nodejs)

### Option 2: Manual Deploy

1. **Create Railway Account**: Go to [railway.app](https://railway.app)
2. **Connect GitHub**: Link your GitHub account
3. **New Project**: Click "New Project" → "Deploy from GitHub repo"
4. **Select Repository**: Choose your `-rps-teachable` repository
5. **Configure Service**:
   - **Root Directory**: `/server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

## Environment Variables (Set in Railway Dashboard)

```bash
NODE_ENV=production
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://your-netlify-app.netlify.app
PORT=3001
```

## Alternative Platforms

### Heroku
```bash
# Install Heroku CLI, then:
cd server
heroku create your-rps-server
git subtree push --prefix server heroku main
```

### DigitalOcean App Platform
1. Create new app from GitHub
2. Set root directory to `/server`
3. Configure environment variables

### Render
1. Connect GitHub repository
2. Set root directory: `server`
3. Build command: `npm install`
4. Start command: `npm start`

## After Deployment

1. **Get your server URL** (e.g., `https://your-app.railway.app`)
2. **Update client environment**:
   ```bash
   # In main project root
   echo "VITE_SERVER_URL=https://your-app.railway.app" > .env.production.local
   ```
3. **Update server CORS** (in Railway dashboard):
   ```
   ALLOWED_ORIGINS=https://your-client.vercel.app,http://localhost:5173
   ```

## Testing Deployment

```bash
# Test health endpoint
curl https://your-app.railway.app/health

# Expected response:
# {"status":"ok","rooms":0,"players":0}
```

## 🎯 Production Checklist

- [ ] Server deployed and running
- [ ] Health check endpoint working
- [ ] CORS configured for client domain
- [ ] Client updated with production server URL
- [ ] WebSocket connections tested
- [ ] WebRTC signaling tested
