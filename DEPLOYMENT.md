# Production Deployment Guide

## Step 1: Configure Groq API Key

1. **Get your API key** from [Groq Console](https://console.groq.com/keys)
2. **Update .env file**:
```bash
GROQ_API_KEY=gsk_your_actual_key_here
```

## Step 2: Android In-App Purchase Setup

### Google Play Console Configuration
1. Go to [Google Play Console](https://play.google.com/console)
2. Create your app (if not already)
3. Navigate to **Monetize > Products > In-app products**
4. Create new product:
   - **Product ID**: `explicit_content_scan`
   - **Title**: "Explicit Content Scan"
   - **Description**: "Scan and secure explicit content from your device"
   - **Price**: $4.99 USD
   - **Status**: Active

### Required Permissions
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

## Step 3: iOS In-App Purchase Setup (Optional)

### App Store Connect
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create your app
3. Navigate to **In-App Purchases**
4. Create new product:
   - **Reference Name**: "Explicit Content Scan"
   - **Product ID**: `explicit_content_scan`
   - **Type**: Non-consumable
   - **Price**: $4.99
   - **Status**: Ready to Submit

### Required Info.plist
Add to `ios/ExplicitContentScanner/Info.plist`:
```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>Access photos and videos to scan for explicit content</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>Save secured content to your photo library</string>
```

## Step 4: Device Testing

### Prerequisites
- Physical Android device (API 28+)
- USB debugging enabled
- Developer options enabled

### Test Commands
```bash
# Install dependencies
npm install

# Start Metro bundler
npm start

# Run on connected Android device
npx react-native run-android

# For iOS (if configured)
npx react-native run-ios
```

### Test Checklist
- [ ] App launches without crashes
- [ ] Permission screen appears first
- [ ] Can grant photo/video permissions
- [ ] Scanning process completes
- [ ] Results show blurred thumbnails
- [ ] Payment flow works ($4.99 charge)
- [ ] Content moves to secure vault
- [ ] Can view/manage secured content
- [ ] Content restores to gallery
- [ ] App uninstall removes secured content

## Step 5: Build Release Version

### Android Release Build
```bash
# Generate signing key (one-time)
cd android
./gradlew assembleRelease

# Or for Play Store upload
./gradlew bundleRelease
```

### iOS Release Build
```bash
# Build for App Store
cd ios
xcodebuild -workspace ExplicitContentScanner.xcworkspace -scheme ExplicitContentScanner -configuration Release
```

### Testing Release Build
```bash
# Install release APK on device
adb install android/app/build/outputs/apk/release/app-release.apk
```

## Production Checklist

### Security
- [ ] API keys not hardcoded
- [ ] HTTPS for all network requests
- [ ] Proper encryption for stored content
- [ ] No sensitive data in logs

### Performance
- [ ] Batch processing for large media libraries
- [ ] Progress indicators during scanning
- [ ] Memory management for large files
- [ ] Background processing for large scans

### Legal
- [ ] Privacy policy created
- [ ] Terms of service created
- [ ] Age verification (18+)
- [ ] GDPR compliance (if applicable)

### App Store Requirements
- [ ] App description written
- [ ] Screenshots created
- [ ] App icon designed
- [ ] Age rating set (17+)
- [ ] Content guidelines compliance verified