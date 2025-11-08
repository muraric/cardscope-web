#!/bin/bash

# Build script for Android App Bundle (AAB) for Google Play Store
# Automatically increments version before building
# Usage: ./build-android-release.sh

set -e

echo "🚀 Building Android App Bundle (AAB) for Google Play Store..."
echo ""

# Navigate to Android directory
cd android

# Read current version
CURRENT_VERSION_CODE=$(grep "versionCode" app/build.gradle | awk '{print $2}')
CURRENT_VERSION_NAME=$(grep "versionName" app/build.gradle | awk -F'"' '{print $2}')

echo "📦 Current Version: $CURRENT_VERSION_NAME (code: $CURRENT_VERSION_CODE)"

# Increment version
NEW_VERSION_CODE=$((CURRENT_VERSION_CODE + 1))

# Parse version name (format: major.minor.patch)
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION_NAME"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

# Increment patch version
NEW_PATCH=$((PATCH + 1))
NEW_VERSION_NAME="$MAJOR.$MINOR.$NEW_PATCH"

echo "📦 New Version: $NEW_VERSION_NAME (code: $NEW_VERSION_CODE)"
echo ""

# Update build.gradle with new version
sed -i '' "s/versionCode $CURRENT_VERSION_CODE/versionCode $NEW_VERSION_CODE/" app/build.gradle
sed -i '' "s/versionName \"$CURRENT_VERSION_NAME\"/versionName \"$NEW_VERSION_NAME\"/" app/build.gradle

echo "✅ Updated build.gradle with new version"
echo ""

# Clean previous builds
echo "🧹 Cleaning previous builds..."
./gradlew clean

# Build release AAB
echo "🔨 Building signed AAB (Android App Bundle)..."
./gradlew bundleRelease

# Check if build was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "📦 AAB location:"
    echo "   android/app/build/outputs/bundle/release/app-release.aab"
    echo ""
    echo "📊 Version: $NEW_VERSION_NAME (versionCode: $NEW_VERSION_CODE)"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Upload AAB to Google Play Console"
    echo "   2. Go to: https://play.google.com/console"
    echo "   3. Select your app → Release → Production/Testing"
    echo "   4. Upload the AAB file"
    echo ""
else
    echo ""
    echo "❌ Build failed!"
    exit 1
fi

# Return to root directory
cd ..

echo "✨ Done!"

