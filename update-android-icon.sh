#!/bin/bash

# Script to update Android app icon from a 1024x1024 source image
# Usage: ./update-android-icon.sh /path/to/icon.png

set -e

SOURCE_ICON="$1"
RES_DIR="android/app/src/main/res"

if [ -z "$SOURCE_ICON" ]; then
    echo "Usage: ./update-android-icon.sh /path/to/icon.png"
    echo "Example: ./update-android-icon.sh ~/Downloads/cardscope_app_icon.png"
    exit 1
fi

if [ ! -f "$SOURCE_ICON" ]; then
    echo "Error: Icon file not found: $SOURCE_ICON"
    exit 1
fi

echo "🖼️  Updating Android app icon..."
echo "Source: $SOURCE_ICON"
echo ""

# Check if source is 1024x1024
WIDTH=$(sips -g pixelWidth "$SOURCE_ICON" 2>/dev/null | grep pixelWidth | awk '{print $2}')
HEIGHT=$(sips -g pixelHeight "$SOURCE_ICON" 2>/dev/null | grep pixelHeight | awk '{print $2}')
if [ "$WIDTH" != "1024" ] || [ "$HEIGHT" != "1024" ]; then
    echo "⚠️  Warning: Source icon is ${WIDTH}x${HEIGHT}, but 1024x1024 is recommended"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Android icon sizes for different densities
declare -A SIZES=(
    ["mipmap-mdpi"]="48"
    ["mipmap-hdpi"]="72"
    ["mipmap-xhdpi"]="96"
    ["mipmap-xxhdpi"]="144"
    ["mipmap-xxxhdpi"]="192"
)

# Generate icons for each density
for DENSITY in "${!SIZES[@]}"; do
    SIZE="${SIZES[$DENSITY]}"
    DENSITY_DIR="$RES_DIR/$DENSITY"
    
    echo "📱 Generating $DENSITY icons (${SIZE}x${SIZE})..."
    
    # Create directory if it doesn't exist
    mkdir -p "$DENSITY_DIR"
    
    # Generate square icon (ic_launcher.png)
    sips -z "$SIZE" "$SIZE" "$SOURCE_ICON" --out "$DENSITY_DIR/ic_launcher.png" > /dev/null 2>&1
    
    # Generate round icon (ic_launcher_round.png) - same as square for now
    sips -z "$SIZE" "$SIZE" "$SOURCE_ICON" --out "$DENSITY_DIR/ic_launcher_round.png" > /dev/null 2>&1
    
    # Generate foreground icon (ic_launcher_foreground.png) - same as main icon
    sips -z "$SIZE" "$SIZE" "$SOURCE_ICON" --out "$DENSITY_DIR/ic_launcher_foreground.png" > /dev/null 2>&1
    
    echo "   ✅ Created icons in $DENSITY"
done

echo ""
echo "✅ Android icon update complete!"
echo ""
echo "📋 Summary:"
echo "   - Square icons: ic_launcher.png (all densities)"
echo "   - Round icons: ic_launcher_round.png (all densities)"
echo "   - Foreground icons: ic_launcher_foreground.png (all densities)"
echo ""
echo "💡 Note: For adaptive icons (Android 8.0+), you may want to:"
echo "   1. Use a transparent foreground on colored background"
echo "   2. Edit ic_launcher_background.xml in res/drawable/"
echo "   3. Adjust the adaptive icon in res/mipmap-anydpi-v26/ic_launcher.xml"
echo ""
echo "🚀 Rebuild your Android app to see the new icon!"

