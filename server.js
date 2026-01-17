const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    twitter: !!process.env.TWITTER_BEARER_TOKEN
  });
});

// Twitter search endpoint
app.get('/api/twitter/search', async (req, res) => {
  try {
    const { q, limit = 25 } = req.query;

    if (!q) {
      return res.status(400).json({
        error: 'Missing required parameter: q (query)'
      });
    }

    if (!process.env.TWITTER_BEARER_TOKEN) {
      return res.status(500).json({
        error: 'Twitter API credentials not configured',
        message: 'Please set TWITTER_BEARER_TOKEN in .env file'
      });
    }

    // Twitter API v2 recent search
    const response = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
      headers: {
        'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        'User-Agent': 'AI-Eval-Monitor/1.0'
      },
      params: {
        query: q,
        max_results: Math.min(parseInt(limit), 100), // Twitter max is 100
        'tweet.fields': 'created_at,public_metrics,author_id,entities',
        'user.fields': 'username,name,profile_image_url',
        'expansions': 'author_id'
      },
      timeout: 10000
    });

    // Transform Twitter API response to match your frontend format
    const tweets = response.data.data || [];
    const users = response.data.includes?.users || [];

    // Create user lookup map
    const userMap = {};
    users.forEach(user => {
      userMap[user.id] = user;
    });

    const formatted = tweets.map(tweet => {
      const user = userMap[tweet.author_id] || {};

      return {
        source: 'twitter',
        title: tweet.text.length > 200 ? tweet.text.slice(0, 200) + '...' : tweet.text,
        content: tweet.text,
        author: user.username ? `@${user.username}` : 'Twitter User',
        authorName: user.name || 'Twitter User',
        url: `https://twitter.com/${user.username}/status/${tweet.id}`,
        date: tweet.created_at,
        score: tweet.public_metrics?.like_count || 0,
        comments: tweet.public_metrics?.reply_count || 0,
        retweets: tweet.public_metrics?.retweet_count || 0,
        sentiment: analyzeSentiment(tweet.text),
        isPlaceholder: false
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });

  } catch (error) {
    console.error('Twitter API Error:', error.response?.data || error.message);

    // Handle specific Twitter API errors
    if (error.response?.status === 401) {
      return res.status(401).json({
        error: 'Invalid Twitter API credentials',
        message: 'Please check your TWITTER_BEARER_TOKEN'
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'Twitter API rate limit exceeded',
        message: 'Please try again later',
        retryAfter: error.response.headers['x-rate-limit-reset']
      });
    }

    res.status(500).json({
      error: 'Failed to fetch tweets',
      message: error.message
    });
  }
});

// Simple sentiment analysis (same as frontend)
function analyzeSentiment(text) {
  const positive = ['breakthrough', 'success', 'excellent', 'great', 'amazing', 'innovative', 'progress', 'improve', 'better', 'good', 'exciting', 'promising', 'love', 'awesome', 'fantastic'];
  const negative = ['fail', 'problem', 'issue', 'concern', 'risk', 'danger', 'bad', 'worse', 'difficult', 'challenge', 'controversy', 'criticism', 'hate', 'terrible', 'awful'];

  const lower = text.toLowerCase();
  let score = 0;

  positive.forEach(word => {
    if (lower.includes(word)) score++;
  });

  negative.forEach(word => {
    if (lower.includes(word)) score--;
  });

  return score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 AI Eval Monitor Backend Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🐦 Twitter API: ${process.env.TWITTER_BEARER_TOKEN ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`\n⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Allowed origins: ${allowedOrigins.join(', ')}\n`);
});

module.exports = app;
