# Quick Start: Mac Desktop App

Get the AI Eval Monitor running as a Mac desktop app in 3 steps.

## Step 1: Install

```bash
cd ai-eval-monitor
npm install
```

This installs Electron and all dependencies. Takes 2-3 minutes.

## Step 2: Run

```bash
npm run electron:dev
```

The app will launch immediately. No browser needed!

**Note**: Twitter search won't work yet (shows placeholder). That's OK for testing.

## Step 3: Build Installer (Optional)

```bash
npm run build:mac
```

This creates `AI Eval Monitor.dmg` in the `dist/` folder. Double-click to install.

## Enable Twitter Search (Optional)

1. Get Twitter API credentials ([see SETUP.md](SETUP.md))
2. Copy `.env.example` to `.env`
3. Add your token:
   ```
   TWITTER_BEARER_TOKEN=your_token_here
   ```
4. Restart: `npm run electron:dev`

## That's It!

🎉 You now have a native Mac app for AI Eval Monitor.

**Next steps**:
- Read [DESKTOP-APP.md](DESKTOP-APP.md) for detailed guide
- Add custom app icon
- Build signed installer for distribution

## Troubleshooting

**App won't open after building?**
Right-click the app and select "Open" (not double-click). This is because the app isn't code-signed yet.

**Port 3001 in use?**
Change `PORT=3002` in `.env`

**Installation failed?**
Clear npm cache: `npm cache clean --force` then try again.
