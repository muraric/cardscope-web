# How to Add App Icon for iOS

## App Icon Requirements

- **Size**: 1024x1024 pixels
- **Format**: PNG (with transparency support)
- **No rounded corners**: iOS will add them automatically
- **No "gloss" effect**: iOS handles this automatically

## Method 1: Using Xcode (Easiest)

1. **Open Xcode** (if not already open)
   ```bash
   npx cap open ios
   ```

2. **Navigate to Assets**
   - In Project Navigator (left sidebar)
   - Expand `App` → `Assets.xcassets` → `AppIcon`

3. **Add Your Icon**
   - Drag your 1024x1024 PNG file into the AppIcon set
   - OR click the "+" button and select your icon file
   - Replace the existing `AppIcon-512@2x.png` slot

4. **Verify**
   - You should see your icon in the 1024x1024 slot
   - Xcode will automatically update the Contents.json file

## Method 2: Manual File Replacement

1. **Prepare Your Icon**
   - Name it: `AppIcon-512@2x.png`
   - Size: 1024x1024 pixels
   - Format: PNG

2. **Replace the File**
   ```bash
   # Copy your icon to the app icon directory
   cp /path/to/your/icon.png ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png
   ```

3. **Refresh in Xcode**
   - Close and reopen Xcode
   - Or: Right-click Assets.xcassets → "Open in External Editor"

## Current Icon Location

```
ios/App/App/Assets.xcassets/AppIcon.appiconset/
├── AppIcon-512@2x.png  ← Replace this file (1024x1024 PNG)
└── Contents.json       ← Auto-generated, don't edit manually
```

## Icon Design Tips

✅ **Do:**
- Use a simple, recognizable design
- Ensure it looks good at small sizes
- Use high contrast colors
- Follow Apple's Human Interface Guidelines

❌ **Don't:**
- Add rounded corners (iOS does this)
- Include text that's too small
- Use low-resolution images
- Make it too complex/busy

## Testing Your Icon

After adding the icon:

1. **Build and Run** in Xcode
   - Product → Run (Cmd+R)
   - Check home screen to see your icon

2. **Archive** for TestFlight
   - The icon will appear in TestFlight and App Store

## App Store Icon Requirements

For App Store submission, you'll also need:
- **App Icon**: 1024x1024 PNG (already covered above)
- **No transparency** (Apple may reject icons with transparency)

## Quick Commands

```bash
# Open Xcode to add icon
npx cap open ios

# View current icon location
ls -la ios/App/App/Assets.xcassets/AppIcon.appiconset/

# Replace icon manually (example)
cp ~/Downloads/my-app-icon.png ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png
```

## Troubleshooting

**Icon not showing in Xcode:**
- Clean build folder: Product → Clean Build Folder (Shift+Cmd+K)
- Rebuild: Product → Build (Cmd+B)

**Icon looks blurry:**
- Ensure it's exactly 1024x1024 pixels
- Use PNG format (not JPEG)
- Check image resolution/dpi

**Need to create an icon?**
- Use tools like Figma, Sketch, or online icon generators
- Ensure it's 1024x1024 PNG format

