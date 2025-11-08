# Android Version Management

## ✅ Automatic Version Incrementing Configured

The Android app version is now set to automatically increment every time you build.

## Current Version

- **Version Name**: 1.0.21
- **Version Code**: 21

## How It Works

When you run `./build-android-release.sh`, the script will:

1. ✅ Read current version from `android/app/build.gradle`
2. ✅ Increment versionCode by 1 (required for Play Store)
3. ✅ Increment patch version (e.g., 1.0.21 → 1.0.22)
4. ✅ Update `build.gradle` automatically
5. ✅ Build the AAB with new version

## Usage

### Build with Auto-Increment

```bash
# This will automatically increment version and build
./build-android-release.sh
```

**Example Output:**
```
📦 Current Version: 1.0.21 (code: 21)
📦 New Version: 1.0.22 (code: 22)
✅ Updated build.gradle with new version
🔨 Building signed AAB...
```

### Manual Version Update

If you need to update version manually (e.g., major or minor bump):

Edit `android/app/build.gradle`:
```gradle
versionCode 22          // Increment this for each release
versionName "1.0.22"    // Format: major.minor.patch
```

**Version Naming Convention:**
- **Major** (1.x.x): Breaking changes, major features
- **Minor** (x.1.x): New features, backward compatible
- **Patch** (x.x.1): Bug fixes, small improvements

## Version History

| Version Code | Version Name | Date | Notes |
|-------------|--------------|------|-------|
| 21 | 1.0.21 | Nov 3, 2024 | Auto-increment configured |
| 20 | 1.0.20 | Nov 3, 2024 | Initial release build |

## Important Notes

⚠️ **Version Code Rules:**
- Must always increment (Google Play requirement)
- Cannot reuse or decrease version codes
- Each AAB upload must have a unique version code

✅ **Best Practices:**
- Use the build script for automatic increments
- Only manually edit for major/minor version changes
- Keep version history documented
- Test before uploading to Play Store

## Quick Commands

```bash
# Build with auto-increment
./build-android-release.sh

# Check current version
grep -E "versionCode|versionName" android/app/build.gradle

# Manual build (no increment)
cd android && ./gradlew bundleRelease
```

---

**Status**: ✅ Automatic version incrementing is now active!


