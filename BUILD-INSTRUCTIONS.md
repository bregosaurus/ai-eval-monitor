# How to Create the Mac Installer

Since Mac apps must be built on macOS, you'll need to build the installer on your Mac.

## Step 1: Get the Code on Your Mac

Pull this branch to your Mac:

```bash
git pull origin claude/mac-desktop-app-zTntI
# Or if you haven't cloned yet:
git clone <your-repo-url>
cd ai-eval-monitor
git checkout claude/mac-desktop-app-zTntI
```

## Step 2: Build the Installer

### Option A: Use the Build Script (Easy)

```bash
./build-mac.sh
```

This will automatically:
- Install dependencies
- Detect your Mac type (Apple Silicon or Intel)
- Build the appropriate installer

### Option B: Manual Build

```bash
# Install dependencies
npm install

# Build for your Mac architecture
npm run build:mac        # Auto-detects your architecture
# OR
npm run build:mac:arm64  # For M1/M2/M3 Macs
# OR
npm run build:mac:x64    # For Intel Macs
```

## Step 3: Find Your Installer

The DMG file will be created in the `dist/` folder:

```
dist/
├── AI Eval Monitor-1.0.0-arm64.dmg   (for Apple Silicon)
└── AI Eval Monitor-1.0.0-x64.dmg     (for Intel)
```

## Step 4: Install

1. Double-click the DMG file
2. Drag "AI Eval Monitor" to the Applications folder
3. Open the app (right-click → Open for first launch)

## Estimated Time

- First time (with npm install): **5-10 minutes**
- Subsequent builds: **2-3 minutes**

## What Gets Built

- ✅ Native Mac application (.app)
- ✅ DMG installer (drag-to-Applications)
- ✅ ZIP archive (alternative distribution format)
- ✅ Optimized for your Mac architecture

## Troubleshooting

**Build fails?**
- Make sure you're on macOS (can't build Mac apps on Windows/Linux)
- Check you have Node.js 14+ installed: `node --version`
- Clear cache and retry: `npm cache clean --force && npm install`

**App won't open?**
- Right-click the app and select "Open" (not double-click)
- This is normal for unsigned apps

**Want to build for both Intel and Apple Silicon?**
```bash
npm run build:mac:universal
```
This creates a larger file (~2x) but works on any Mac.

---

**Once built, you can share the DMG file** with others who want to install the app on their Mac!
