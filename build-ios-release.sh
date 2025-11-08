#!/bin/bash

# Build script for iOS App Store deployment
# This script builds the Next.js app for mobile and syncs with Capacitor iOS project

set -e  # Exit on error

echo "🚀 Building CardScope for iOS App Store..."
echo ""

# Step 1: Build Next.js app for mobile (static export)
echo "📦 Step 1: Building Next.js app for mobile..."
echo "⚠️  Note: If build fails due to API routes, you may need to:"
echo "   1. Uncomment server.url in capacitor.config.ts"
echo "   2. Remove BUILD_FOR_MOBILE=true and use 'npm run build' instead"
echo ""

BUILD_FOR_MOBILE=true npm run build || {
    echo ""
    echo "❌ Build failed. This might be due to API routes in app/api directory."
    echo ""
    echo "Alternative approach:"
    echo "1. Uncomment server.url in capacitor.config.ts"
    echo "2. Run: npm run build (without BUILD_FOR_MOBILE)"
    echo "3. Run: npx cap sync ios"
    echo ""
    echo "Using remote server (server.url) is valid for App Store deployment."
    exit 1
}

if [ ! -d "dist" ]; then
    echo "❌ Error: dist folder not found after build"
    exit 1
fi

echo "✅ Next.js build completed successfully"
echo ""

# Step 2: Sync Capacitor iOS project
echo "📱 Step 2: Syncing Capacitor iOS project..."
npx cap sync ios

echo "✅ Capacitor sync completed"
echo ""

# Step 3: Install CocoaPods dependencies
echo "🍫 Step 3: Installing CocoaPods dependencies..."
cd ios/App
pod install
cd ../..

echo "✅ CocoaPods installation completed"
echo ""

echo "✅ Build process completed successfully!"
echo ""
echo "Next steps:"
echo "1. Open Xcode: npx cap open ios"
echo "2. Select 'Any iOS Device' as build target"
echo "3. Product → Archive"
echo "4. Follow the App Store deployment guide in APP_STORE_DEPLOYMENT.md"
echo ""

