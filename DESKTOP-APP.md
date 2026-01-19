# AI Eval Monitor - Mac Desktop App

This guide explains how to build and run AI Eval Monitor as a native Mac desktop application using Electron.

## Overview

The desktop app includes:
- **Native Mac application** - Runs as a standalone app, no browser needed
- **Embedded backend server** - Express server runs automatically inside the app
- **Dark mode support** - Beautiful dark theme matching macOS
- **Universal binary** - Supports both Intel and Apple Silicon Macs
- **DMG installer** - Professional disk image for easy installation

## Prerequisites

- macOS (for building Mac apps)
- Node.js 14 or higher
- npm 6 or higher

## Installation & Setup

### 1. Install Dependencies

```bash
cd ai-eval-monitor
npm install
```

This will install:
- Electron (desktop app framework)
- electron-builder (packaging tool)
- All backend dependencies (Express, CORS, etc.)

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your Twitter Bearer Token (optional, but needed for Twitter search):

```
TWITTER_BEARER_TOKEN=your_token_here
PORT=3001
```

### 3. Run the Desktop App (Development Mode)

```bash
npm run electron:dev
```

This will:
- Start the Express backend server on port 3001
- Launch the Electron app with DevTools enabled
- Automatically reload when you make changes

For production mode (no DevTools):

```bash
npm run electron
```

## Building the Mac App

### Build for Your Current Architecture

```bash
npm run build:mac
```

This creates a DMG installer for your current Mac architecture (Intel or Apple Silicon).

### Build for Specific Architecture

**For Apple Silicon (M1/M2/M3):**
```bash
npm run build:mac:arm64
```

**For Intel Macs:**
```bash
npm run build:mac:x64
```

**Universal Binary (both architectures):**
```bash
npm run build:mac:universal
```

Note: Universal builds are ~2x larger but work on both Intel and Apple Silicon.

### Build Output

Built apps will be in the `dist/` directory:

```
dist/
├── AI Eval Monitor-1.0.0-arm64.dmg        # Apple Silicon installer
├── AI Eval Monitor-1.0.0-x64.dmg          # Intel installer
├── AI Eval Monitor-1.0.0-universal.dmg    # Universal installer
└── mac/
    └── AI Eval Monitor.app                # The actual app bundle
```

## Installing the App

### From DMG (Recommended)

1. Open the DMG file: `AI Eval Monitor-1.0.0.dmg`
2. Drag "AI Eval Monitor" to the Applications folder
3. Open from Applications or Spotlight

### From App Bundle (Development)

Double-click `dist/mac/AI Eval Monitor.app` directly, or drag to Applications.

### First Launch

On first launch, macOS may show a security warning because the app isn't signed with an Apple Developer certificate. To allow it:

1. Right-click the app and select "Open"
2. Click "Open" in the security dialog
3. Alternatively, go to System Settings > Privacy & Security and click "Open Anyway"

## Customizing the App Icon

The app currently uses a placeholder icon. To add a custom icon:

### Option 1: Use a PNG file

1. Create a 1024x1024 PNG image
2. Convert it to ICNS format:
   - Online: https://cloudconvert.com/png-to-icns
   - Mac tool: [Image2Icon](https://img2icnsapp.com/) (free)
3. Save as `build/icon.icns`
4. Rebuild the app

### Option 2: Use iconutil (built into macOS)

```bash
# Create an iconset directory
mkdir icon.iconset

# Add various sizes of your icon (example sizes):
# icon_16x16.png, icon_32x32.png, icon_128x128.png,
# icon_256x256.png, icon_512x512.png, icon_1024x1024.png

# Convert to ICNS
iconutil -c icns icon.iconset -o build/icon.icns

# Rebuild
npm run build:mac
```

## How It Works

### Architecture

```
┌─────────────────────────────────────────┐
│         Electron Main Process           │
│  ┌────────────┐      ┌──────────────┐  │
│  │  Express   │      │   Browser    │  │
│  │  Backend   │◄────►│   Window     │  │
│  │ (port 3001)│      │ (index.html) │  │
│  └────────────┘      └──────────────┘  │
└─────────────────────────────────────────┘
```

1. **Main Process** (`electron.js`):
   - Starts Express server on localhost:3001
   - Creates browser window
   - Manages app lifecycle

2. **Backend Server**:
   - Same as web version
   - Handles Twitter API proxy
   - Serves API endpoints

3. **Frontend**:
   - Loads `index.html`
   - Auto-detects Electron environment
   - Uses local backend URL

### Key Files

- `electron.js` - Main Electron process, starts backend & window
- `preload.js` - Security bridge between main and renderer processes
- `index.html` - Frontend (auto-detects Electron backend URL)
- `package.json` - Electron scripts and build configuration
- `build/entitlements.mac.plist` - macOS security permissions

## Development Scripts

```bash
# Run app in development mode (with DevTools)
npm run electron:dev

# Run app in production mode
npm run electron

# Build for Mac (current architecture)
npm run build:mac

# Build for Apple Silicon
npm run build:mac:arm64

# Build for Intel
npm run build:mac:x64

# Build universal binary
npm run build:mac:universal

# Create package without installer (faster for testing)
npm run pack
```

## Troubleshooting

### App won't open - "damaged or can't be verified"

This happens because the app isn't code-signed. Solutions:

1. **Right-click Open method** (recommended):
   - Right-click app → Open → Click "Open" in dialog

2. **Remove quarantine attribute**:
   ```bash
   xattr -cr "/Applications/AI Eval Monitor.app"
   ```

3. **Disable Gatekeeper** (not recommended):
   ```bash
   sudo spctl --master-disable
   ```

### Twitter search not working

Make sure you've added `TWITTER_BEARER_TOKEN` to your `.env` file. The app will still work without it, but Twitter search will be disabled.

### Build fails on npm install

This can happen if you're behind a proxy or have network issues. Try:

```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

### Port 3001 already in use

Change the port in `.env`:

```
PORT=3002
```

Or kill the process using port 3001:

```bash
lsof -ti:3001 | xargs kill
```

## Code Signing (Optional)

For distribution, you should code-sign the app with an Apple Developer certificate:

1. Enroll in [Apple Developer Program](https://developer.apple.com/programs/) ($99/year)
2. Get a "Developer ID Application" certificate
3. Update `package.json`:

```json
"build": {
  "mac": {
    "identity": "Developer ID Application: Your Name (TEAM_ID)"
  }
}
```

4. Rebuild:
   ```bash
   npm run build:mac
   ```

Signed apps can be opened without security warnings.

## Notarization (Optional)

For public distribution, Apple requires notarization:

```bash
# Install electron-notarize
npm install --save-dev electron-notarize

# Add notarization to package.json afterSign hook
# See: https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/
```

## Comparison: Web vs Desktop App

| Feature | Web Version | Desktop App |
|---------|-------------|-------------|
| Installation | None (browser-based) | Download & install |
| Backend | Separate server | Embedded |
| Updates | Automatic | Manual download |
| Performance | Good | Slightly better |
| Offline | No | Backend works offline |
| Native feel | Browser UI | Native macOS UI |
| Dock icon | No | Yes |
| Notifications | Limited | Full support |

## Next Steps

- Add app icon (see "Customizing the App Icon")
- Configure Twitter API token in `.env`
- Build the app: `npm run build:mac`
- Test the DMG installer
- (Optional) Code sign for distribution

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder Guide](https://www.electron.build/)
- [macOS Code Signing](https://developer.apple.com/support/code-signing/)
- [Image2Icon (Free Icon Tool)](https://img2icnsapp.com/)

## Support

For issues or questions:
- Check the main [README.md](./README.md)
- Review [SETUP.md](./SETUP.md) for backend configuration
- Open an issue on GitHub
