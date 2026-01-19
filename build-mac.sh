#!/bin/bash
# Build script for AI Eval Monitor Mac Desktop App
# Run this on your Mac to create the installable DMG file

echo "🚀 Building AI Eval Monitor for Mac..."
echo ""

# Check if on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Error: This script must be run on macOS to build Mac apps"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

echo ""
echo "🔨 Building Mac app..."
echo ""

# Detect architecture and build accordingly
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
    echo "🍎 Detected Apple Silicon (M1/M2/M3)"
    echo "Building for ARM64..."
    npm run build:mac:arm64
else
    echo "💻 Detected Intel Mac"
    echo "Building for x64..."
    npm run build:mac:x64
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build complete!"
    echo ""
    echo "📦 Your installer is ready:"
    echo "   dist/AI Eval Monitor-1.0.0-arm64.dmg (or x64.dmg)"
    echo ""
    echo "To install:"
    echo "1. Double-click the DMG file"
    echo "2. Drag 'AI Eval Monitor' to Applications"
    echo "3. Right-click the app and select 'Open' (first time only)"
    echo ""
else
    echo ""
    echo "❌ Build failed. Check the error messages above."
    exit 1
fi
