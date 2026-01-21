# Local Testing Guide

## Setup Complete ✅

The app is now configured to use your local development server for testing.

## Steps to Test Locally

### 1. Start the Development Server

In your terminal, run:

```bash
npm run dev
```

This will start the Next.js dev server at `http://localhost:3000`

### 2. Find Your Mac's IP Address (for iOS Simulator/Device)

For iOS Simulator, you can use `localhost` or your Mac's IP address.

To find your Mac's IP address:
```bash
# On Mac, run:
ipconfig getifaddr en0
# or
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### 3. Update Capacitor Config (if needed)

If `localhost` doesn't work in iOS Simulator, update `capacitor.config.ts`:

```typescript
server: {
    url: 'http://YOUR_MAC_IP:3000',  // e.g., 'http://192.168.1.100:3000'
    androidScheme: 'http',
    iosScheme: 'http'
}
```

Then run: `npx cap sync ios`

### 4. Run the iOS App

1. Open Xcode (already open)
2. Select a simulator (e.g., iPhone 15 Pro)
3. Click the Play button (▶️) or press `Cmd+R`
4. The app will load from your local dev server

### 5. Test the Features

**Sign in with Apple:**
- Go to Login page
- You should see "Continue with Apple" button (black button with Apple logo)
- Click it to test (will show error if Apple Sign-In not configured, but button should be visible)

**Account Deletion:**
- Log in to the app
- Go to Settings page
- Scroll to bottom
- You should see "Danger Zone" section with "Delete My Account" button

## Troubleshooting

### "Cannot connect to server" error
- Make sure `npm run dev` is running
- Check that the port is 3000 (or update config if different)
- For iOS Simulator, try using your Mac's IP address instead of localhost

### Changes not showing
- Make sure dev server is running
- Hard refresh the app (close and reopen)
- Check that `capacitor.config.ts` has the correct URL

### API routes not working
- Local dev server supports API routes, so this should work fine
- Make sure your backend API is also running if needed

## After Testing

When you're ready to deploy:
1. Change `capacitor.config.ts` back to use Vercel URL:
   ```typescript
   server: {
       url: 'https://cardscope-web.vercel.app',
       androidScheme: 'https',
       iosScheme: 'https'
   }
   ```
2. Run `npx cap sync ios`
3. Deploy to Vercel (see `DEPLOY_TO_VERCEL.md`)
