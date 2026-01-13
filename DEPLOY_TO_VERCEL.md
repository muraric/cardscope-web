# Deploy Changes to Vercel

## Quick Deploy Steps

### Method 1: Git Push (Automatic Deploy)
If your Vercel project is connected to Git:

```bash
# Commit your changes
git add .
git commit -m "Add Sign in with Apple and Account Deletion features"

# Push to trigger Vercel deployment
git push origin main
```

Vercel will automatically build and deploy your changes.

### Method 2: Vercel CLI (Manual Deploy)
If you have Vercel CLI installed:

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy to production
vercel --prod
```

### Method 3: Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project (`cardscope-web`)
3. Go to "Deployments" tab
4. Click "Redeploy" on the latest deployment
5. Or connect your Git repo and push changes

## What Gets Deployed

The following changes will be deployed:
- ✅ Sign in with Apple button on Login page
- ✅ Sign in with Apple button on Signup page  
- ✅ Account deletion feature in Settings page
- ✅ Apple Sign-In API endpoint (`/api/auth/apple`)
- ✅ Updated NextAuth configuration with Apple provider

## After Deployment

1. Wait for deployment to complete (usually 1-2 minutes)
2. Test on iOS app - it should now show:
   - Apple Sign-In button on login/signup pages
   - Account deletion in Settings page

## Environment Variables

Make sure these are set in Vercel:
- `APPLE_ID` - Your Apple Services ID
- `APPLE_SECRET` - Your Apple JWT secret
- `APPLE_TEAM_ID` - Your Apple Team ID
- `APPLE_KEY_ID` - Your Apple Key ID

(These are needed for Apple Sign-In to work, but the UI will show even without them)
