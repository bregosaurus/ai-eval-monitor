const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

let mainWindow;
let backendServer;
const PORT = process.env.PORT || 3001;

// Create Express server for backend API
function createBackendServer() {
  const expressApp = express();

  // Middleware
  expressApp.use(cors({
    origin: ['http://localhost:3001', 'app://electron'], // Allow Electron app origin
    credentials: true
  }));
  expressApp.use(express.json());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });

  expressApp.use('/api/', limiter);

  // Health check endpoint
  expressApp.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Twitter search endpoint
  expressApp.get('/api/twitter/search', async (req, res) => {
    try {
      const { q, limit = 25 } = req.query;

      if (!q) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
      }

      const bearerToken = process.env.TWITTER_BEARER_TOKEN;
      if (!bearerToken) {
        console.warn('Twitter Bearer Token not configured');
        return res.status(503).json({
          error: 'Twitter API not configured',
          message: 'Please add TWITTER_BEARER_TOKEN to your .env file'
        });
      }

      const response = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
        params: {
          query: q,
          max_results: Math.min(parseInt(limit), 100),
          'tweet.fields': 'created_at,public_metrics,author_id',
          'user.fields': 'name,username,profile_image_url',
          expansions: 'author_id'
        },
        headers: {
          'Authorization': `Bearer ${bearerToken}`
        }
      });

      // Transform response to match frontend expectations
      const users = {};
      if (response.data.includes?.users) {
        response.data.includes.users.forEach(user => {
          users[user.id] = user;
        });
      }

      const tweets = (response.data.data || []).map(tweet => {
        const author = users[tweet.author_id] || {};
        return {
          id: tweet.id,
          text: tweet.text,
          created_at: tweet.created_at,
          author: {
            name: author.name || 'Unknown',
            username: author.username || 'unknown',
            profile_image_url: author.profile_image_url
          },
          metrics: tweet.public_metrics
        };
      });

      res.json({ tweets });
    } catch (error) {
      console.error('Twitter API error:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        error: 'Failed to fetch tweets',
        details: error.response?.data || error.message
      });
    }
  });

  // Start server
  return new Promise((resolve, reject) => {
    const server = expressApp.listen(PORT, 'localhost', () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
      resolve(server);
    }).on('error', reject);
  });
}

// Create the main browser window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#000000',
    title: 'AI Eval Monitor',
    icon: path.join(__dirname, 'build', 'icon.png')
  });

  // Load the index.html file
  mainWindow.loadFile('index.html');

  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Inject backend URL into the page
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      window.ELECTRON_BACKEND_URL = 'http://localhost:${PORT}';
    `);
  });
}

// App lifecycle
app.whenReady().then(async () => {
  try {
    // Start backend server
    backendServer = await createBackendServer();

    // Create main window
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (backendServer) {
    backendServer.close();
  }
});

// Handle app termination
app.on('will-quit', () => {
  if (backendServer) {
    backendServer.close();
  }
});
