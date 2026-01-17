# Deployment Guide

This guide explains how to deploy the AI Eval Monitor to production with GitHub Pages (frontend) and Railway (backend).

## Architecture Overview

- **Frontend**: Hosted on GitHub Pages (free, static hosting)
- **Backend**: Hosted on Railway/Render/Heroku (Node.js + Express + Twitter API)

## Step 1: Deploy Backend to Railway (Recommended)

### Prerequisites
- GitHub account
- Twitter API Bearer Token (see [SETUP.md](SETUP.md))

### Railway Deployment Steps

1. **Sign up for Railway**
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `bregosaurus/ai-eval-monitor`
   - Select branch: `claude/code-review-RnEi0` (or `main` after merging)

3. **Configure Environment Variables**
   - In Railway dashboard, go to your project
   - Click "Variables" tab
   - Add the following variables:
     ```
     TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here
     PORT=3001
     NODE_ENV=production
     ALLOWED_ORIGINS=https://bregosaurus.github.io,http://localhost:3000,http://localhost:5500
     ```

4. **Deploy**
   - Railway will automatically detect `package.json` and deploy
   - Wait for deployment to complete (2-3 minutes)
   - Copy your deployment URL (e.g., `https://ai-eval-monitor-production.up.railway.app`)

5. **Verify Deployment**
   - Visit `https://YOUR-APP.railway.app/health`
   - You should see: `{"status":"ok","twitter":true}`

### Alternative: Deploy to Render

1. Go to [render.com](https://render.com)
2. Create "New Web Service"
3. Connect GitHub repo
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: Same as Railway above
5. Deploy and copy URL

### Alternative: Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create ai-eval-monitor-backend

# Add environment variables
heroku config:set TWITTER_BEARER_TOKEN=your_token_here
heroku config:set NODE_ENV=production

# Deploy
git push heroku claude/code-review-RnEi0:main

# Open
heroku open
```

## Step 2: Update Frontend with Backend URL

After deploying your backend, you need to update the frontend to use the production backend URL.

1. **Open `index.html`**
2. **Find line 38** (approximately):
   ```javascript
   if (window.location.hostname.includes('github.io')) {
       return 'https://YOUR-RAILWAY-APP.railway.app'; // Replace after deploying to Railway
   }
   ```

3. **Replace with your actual backend URL**:
   ```javascript
   if (window.location.hostname.includes('github.io')) {
       return 'https://ai-eval-monitor-production.up.railway.app'; // Your actual Railway URL
   }
   ```

4. **Commit and push**:
   ```bash
   git add index.html
   git commit -m "Update backend URL to production Railway deployment"
   git push origin claude/code-review-RnEi0
   ```

5. **Merge to main** (if deploying from main branch):
   ```bash
   git checkout main
   git merge claude/code-review-RnEi0
   git push origin main
   ```

## Step 3: Verify GitHub Pages Deployment

1. Go to your repository settings
2. Navigate to "Pages" section
3. Ensure source is set to deploy from `main` branch (or your preferred branch)
4. Visit `https://bregosaurus.github.io/ai-eval-monitor/`
5. Try a search - Twitter results should now appear!

## Troubleshooting

### Twitter Returns Placeholder

**Symptoms**: Searches show "Backend server not reachable"

**Solutions**:
1. Check Railway logs for errors
2. Verify environment variables are set correctly
3. Test backend directly: `curl https://YOUR-APP.railway.app/health`
4. Check CORS configuration includes your GitHub Pages URL
5. Open browser console and look for CORS errors

### CORS Errors

**Symptoms**: Browser console shows "blocked by CORS policy"

**Solutions**:
1. Add your domain to `ALLOWED_ORIGINS` in Railway variables:
   ```
   ALLOWED_ORIGINS=https://bregosaurus.github.io,http://localhost:3000
   ```
2. Redeploy backend after changing environment variables

### Twitter API Rate Limits

**Symptoms**: Works initially, then returns errors

**Solutions**:
1. Check Twitter API dashboard for rate limit status
2. Upgrade to Basic tier ($100/month) for higher limits
3. Implement caching (see below)

### Backend Won't Deploy

**Solutions**:
1. Check Railway/Render logs
2. Verify `package.json` has correct start script
3. Ensure Node.js version is compatible (14.x or higher)
4. Check that all dependencies are in `package.json`

## Cost Breakdown

### Free Option
- **GitHub Pages**: Free
- **Railway**: Free tier (500 hours/month, ~20 days)
- **Twitter API**: Free tier (1,500 tweets/month)
- **Total**: $0/month (very limited)

### Recommended Production Setup
- **GitHub Pages**: Free
- **Railway Starter**: $5/month (unlimited hours)
- **Twitter API Basic**: $100/month (10K tweets/month)
- **Total**: $105/month

### Budget Option
- **GitHub Pages**: Free
- **Render Free**: Free tier
- **Twitter API Basic**: $100/month
- **Total**: $100/month

## Performance Optimization

### Add Redis Caching (Optional)

To reduce Twitter API costs, add caching:

1. Add Redis to Railway (click "Add Service" > "Redis")
2. Install Redis client: `npm install redis`
3. Update `server.js` to cache responses (see example in SETUP.md)

This can reduce API calls by 80%+ for popular searches.

## Monitoring

### Railway
- Built-in logs and metrics
- Set up alerts for downtime
- Monitor usage to avoid hitting free tier limits

### Twitter API
- Check usage at [developer.twitter.com](https://developer.twitter.com)
- Set up alerts for rate limit warnings
- Monitor monthly quota

## Security Checklist

- ✅ Never commit `.env` file (already in `.gitignore`)
- ✅ Use environment variables for all secrets
- ✅ Enable HTTPS only (Railway provides this automatically)
- ✅ Restrict CORS to your domains only
- ✅ Keep dependencies updated (`npm audit`)
- ✅ Monitor logs for suspicious activity

## Next Steps

1. Deploy backend to Railway ✅
2. Update frontend URL ✅
3. Test thoroughly
4. Set up monitoring
5. Consider adding caching
6. Document any custom configuration

## Support

- Railway: [docs.railway.app](https://docs.railway.app)
- Twitter API: [developer.twitter.com/docs](https://developer.twitter.com/docs)
- Issues: [GitHub Issues](https://github.com/bregosaurus/ai-eval-monitor/issues)
