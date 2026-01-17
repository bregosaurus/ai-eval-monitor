# AI Eval Monitor - Backend Setup Guide

This guide will help you set up the backend server with Twitter API integration.

## Prerequisites

- Node.js 16+ installed ([Download here](https://nodejs.org/))
- Twitter Developer Account (free)
- A code editor (VS Code, etc.)

---

## Part 1: Get Twitter API Credentials

### Step 1: Create a Twitter Developer Account

1. Go to [https://developer.twitter.com/](https://developer.twitter.com/)
2. Sign in with your Twitter/X account
3. Click **"Sign up for Free Account"**
4. Complete the application:
   - **What's your name?** Enter your name
   - **Country** Select your country
   - **Use Case** Select "Making a bot" or "Exploring the API"
   - **Will you make Twitter content available to a government?** No (usually)
   - Describe your use case: "Building a media monitoring tool to track mentions across social platforms"

5. Accept the Terms and Conditions
6. Verify your email address

### Step 2: Create a Twitter App

1. Once approved, go to the [Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Click **"+ Create Project"** or **"Create App"**
3. Fill in the details:
   - **App Name**: `AI-Eval-Monitor` (or your preferred name)
   - **Description**: "Media monitoring tool for tracking topic mentions"
   - **Website URL**: Use your website or `https://github.com/yourusername`

### Step 3: Get Your Bearer Token

1. In your app dashboard, go to **"Keys and Tokens"** tab
2. Under **"Bearer Token"**, click **"Generate"**
3. **IMPORTANT**: Copy this token immediately - you won't see it again!
   ```
   Example: AAAAAAAAAAAAAAAAAAAAABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk
   ```
4. Save it in a secure location

### API Access Tiers

Twitter offers different access levels:

| Tier | Cost | Tweets/Month | Best For |
|------|------|--------------|----------|
| **Free** | $0 | 1,500 tweets/month | Testing only |
| **Basic** | $100/month | 10,000 tweets/month | Small projects |
| **Pro** | $5,000/month | 1M tweets/month | Professional use |

⚠️ **Note**: The Free tier is very limited. For production use, you'll need at least the Basic tier.

---

## Part 2: Install and Configure Backend

### Step 1: Install Dependencies

Open terminal in your project directory:

```bash
cd /home/user/ai-eval-monitor
npm install
```

This installs:
- `express` - Web server framework
- `cors` - Handle cross-origin requests
- `axios` - HTTP client for API calls
- `dotenv` - Environment variable management
- `express-rate-limit` - Prevent API abuse

### Step 2: Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Edit the `.env` file with your credentials:

```bash
nano .env
# or use your preferred editor
code .env
```

3. Add your Twitter Bearer Token:

```env
# Twitter API v2 Credentials
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Settings (add your frontend URLs)
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:5500,http://localhost:5500
```

4. Save and close the file

⚠️ **Security**: Never commit `.env` to git! It's already in `.gitignore`.

---

## Part 3: Run the Application

### Option A: Run Both Frontend and Backend

#### Terminal 1 - Start Backend Server:

```bash
npm start
```

You should see:
```
🚀 AI Eval Monitor Backend Server running on port 3001
📊 Health check: http://localhost:3001/health
🐦 Twitter API: ✅ Configured

⚙️  Environment: development
🔒 Allowed origins: http://localhost:3000, http://127.0.0.1:5500
```

#### Terminal 2 - Start Frontend:

For development, use a simple HTTP server:

```bash
# Using Python 3
python3 -m http.server 5500

# OR using Node.js http-server (install first: npm install -g http-server)
http-server -p 5500

# OR using VS Code Live Server extension
# Right-click index.html > Open with Live Server
```

Open browser to: `http://localhost:5500`

### Option B: Development Mode with Auto-Restart

Install nodemon for development:

```bash
npm install -g nodemon
npm run dev
```

Now the server will automatically restart when you change `server.js`.

---

## Part 4: Test the Integration

### Test 1: Health Check

Open in browser or use curl:

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-17T16:30:00.000Z",
  "twitter": true
}
```

### Test 2: Twitter Search

```bash
curl "http://localhost:3001/api/twitter/search?q=AI+evaluation&limit=5"
```

Expected response:
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "source": "twitter",
      "title": "Just tested the new AI evaluation framework...",
      "content": "Full tweet text here",
      "author": "@username",
      "url": "https://twitter.com/username/status/123456789",
      "date": "2026-01-17T15:30:00.000Z",
      "score": 42,
      "comments": 5,
      "retweets": 12,
      "sentiment": "positive"
    }
  ]
}
```

### Test 3: Frontend Integration

1. Open `http://localhost:5500` in your browser
2. Enter search query: `AI evaluation`
3. Click **Search**
4. Check that Twitter results appear alongside Reddit, HN, etc.
5. Look for the Twitter count in the stats section

---

## Troubleshooting

### Error: "Twitter API credentials not configured"

**Cause**: Missing or invalid `TWITTER_BEARER_TOKEN` in `.env`

**Fix**:
1. Check that `.env` file exists
2. Verify the token is correct (no extra spaces)
3. Restart the server after editing `.env`

### Error: "Invalid Twitter API credentials" (401)

**Cause**: Bearer token is incorrect or expired

**Fix**:
1. Go to Twitter Developer Portal
2. Regenerate your Bearer Token
3. Update `.env` with new token
4. Restart server

### Error: "Twitter API rate limit exceeded" (429)

**Cause**: You've hit your monthly tweet limit

**Fix**:
1. Wait for the rate limit to reset (check `X-Rate-Limit-Reset` header)
2. Upgrade to a higher Twitter API tier
3. Implement caching to reduce API calls

### Error: "Backend server not running"

**Cause**: Backend server at port 3001 is not running

**Fix**:
```bash
# Check if port is in use
lsof -i :3001

# Kill existing process if needed
kill -9 <PID>

# Restart server
npm start
```

### Error: "CORS policy blocking request"

**Cause**: Frontend URL not in `ALLOWED_ORIGINS`

**Fix**:
1. Open `.env`
2. Add your frontend URL to `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500
   ```
3. Restart server

### Twitter results showing placeholder

**Check**:
1. Backend server is running (`http://localhost:3001/health`)
2. Browser console for errors (F12 > Console)
3. Backend logs for error messages
4. Network tab shows request to `/api/twitter/search`

---

## Production Deployment

### Environment Variables for Production

Update `.env` for production:

```env
NODE_ENV=production
PORT=3001
TWITTER_BEARER_TOKEN=your_production_token
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Deploy to Popular Platforms

#### Deploy to Heroku:

```bash
heroku create ai-eval-monitor-backend
heroku config:set TWITTER_BEARER_TOKEN=your_token
git push heroku main
```

#### Deploy to Railway:

1. Connect your GitHub repo
2. Add environment variables in dashboard
3. Railway auto-deploys on push

#### Deploy to DigitalOcean App Platform:

1. Create new app from GitHub
2. Set environment variables
3. Deploy

### Update Frontend for Production

Edit `index.html` line 34:

```javascript
// Development
const [backendUrl] = useState('http://localhost:3001');

// Production
const [backendUrl] = useState('https://your-backend.herokuapp.com');

// Auto-detect
const [backendUrl] = useState(
  window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://your-backend.herokuapp.com'
);
```

---

## API Reference

### GET /health

Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-17T16:30:00.000Z",
  "twitter": true
}
```

### GET /api/twitter/search

Search recent tweets

**Parameters:**
- `q` (required): Search query
- `limit` (optional): Number of results (1-100, default: 25)

**Response:**
```json
{
  "success": true,
  "count": 25,
  "data": [...]
}
```

**Error Response:**
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

---

## Cost Estimation

### Twitter API Costs

| Monthly Searches | Tweets/Search | Total Tweets | Recommended Tier | Monthly Cost |
|-----------------|---------------|--------------|------------------|--------------|
| 10 | 25 | 250 | Free | $0 |
| 100 | 25 | 2,500 | Basic | $100 |
| 1,000 | 25 | 25,000 | Basic | $100 |
| 10,000 | 25 | 250,000 | Pro | $5,000 |

### Reduce API Costs

1. **Implement caching**: Cache results for 5-15 minutes
2. **Reduce tweet limit**: Use `limit=10` instead of `limit=25`
3. **Batch searches**: Combine related queries
4. **User limits**: Rate limit users to prevent abuse

---

## Next Steps

- [ ] Set up Twitter Developer Account
- [ ] Get Bearer Token
- [ ] Install dependencies (`npm install`)
- [ ] Configure `.env` file
- [ ] Start backend server (`npm start`)
- [ ] Test with frontend
- [ ] (Optional) Implement caching for cost savings
- [ ] (Optional) Add LinkedIn API integration (if approved)

---

## Support

- **Twitter API Docs**: https://developer.twitter.com/en/docs/twitter-api
- **Express.js Docs**: https://expressjs.com/
- **Issues**: Create an issue in your repository

---

## Security Checklist

- [x] API keys stored in `.env` (not in code)
- [x] `.env` added to `.gitignore`
- [x] CORS configured with allowed origins
- [x] Rate limiting enabled
- [x] Input validation on queries
- [ ] HTTPS enabled in production
- [ ] Environment variables set in hosting platform
- [ ] Monitor API usage to prevent bill shock

---

**Last Updated**: January 17, 2026
