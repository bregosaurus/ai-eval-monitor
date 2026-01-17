# AI Eval Monitor

Real-time media intelligence dashboard for tracking AI evaluation topics across multiple platforms.

## Features

- 🔍 **Multi-Platform Search**: Reddit, Hacker News, Google News, YouTube, Twitter/X, LinkedIn
- 📊 **Industry Radar**: Track key players in AI evaluation space (LangChain, Arize AI, Langfuse, Maxim AI)
- 📈 **Sentiment Analysis**: Automatic sentiment detection for mentions
- 📝 **Weekly Briefings**: Auto-generated summaries of recent activity
- ⚡ **Real-time Updates**: Live search across all platforms
- 🎨 **Modern UI**: Clean, dark-mode interface

## Quick Start

### Frontend Only (Limited Features)

Simply open `index.html` in your browser. Twitter and LinkedIn will show placeholders.

### With Twitter API Integration

1. **Get Twitter API credentials** (see [SETUP.md](SETUP.md))
2. **Install dependencies**: `npm install`
3. **Configure**: Copy `.env.example` to `.env` and add your Twitter Bearer Token
4. **Start backend**: `npm start`
5. **Open frontend**: Open `index.html` in browser or use Live Server

## Production Deployment

🚀 **Deploy to Production**: See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions to deploy the backend to Railway/Render/Heroku and connect it to GitHub Pages.

**Quick Deploy to Railway**:
1. Sign up at [railway.app](https://railway.app)
2. Create new project from GitHub
3. Add `TWITTER_BEARER_TOKEN` environment variable
4. Update frontend URL in `index.html`
5. Push and you're live!

## Full Setup Guide

See [SETUP.md](SETUP.md) for local development setup:
- Getting Twitter API credentials
- Backend configuration
- Local development workflow
- Troubleshooting

## Architecture

- **Frontend**: Single-page React app (vanilla, no build required)
- **Backend**: Node.js + Express proxy server
- **APIs**: Twitter API v2, Reddit API, Algolia HN, RSS feeds, Invidious

## Tech Stack

- React 18 (CDN)
- Express.js
- Twitter API v2
- Modern vanilla JavaScript

## Cost

- Frontend: Free (static hosting)
- Backend: Free tier available on Railway, Render, etc.
- Twitter API: $100/month for Basic tier (10K tweets/month)

## License

MIT
