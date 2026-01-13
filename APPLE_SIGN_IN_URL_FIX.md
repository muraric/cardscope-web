# Fix for "One or more domains are invalid" Error

## The Problem

When configuring Sign in with Apple in Apple Developer Console, you're seeing the error:
**"One or more domains are invalid"**

## The Solution

The **"Domains and Subdomains"** field has specific formatting requirements:

### ❌ WRONG (What you currently have):
```
Domains and Subdomains:
https://cardscope-web.vercel.app
https://cardscope-web.vercel.app/api/auth/callback/apple
```

### ✅ CORRECT (What it should be):
```
Domains and Subdomains:
cardscope-web.vercel.app
```

## Step-by-Step Fix

1. **In the "Domains and Subdomains" field:**
   - Remove `https://`
   - Remove any paths (like `/api/auth/callback/apple`)
   - Enter ONLY the domain name: `cardscope-web.vercel.app`
   - If you have multiple domains, enter them comma-separated (but each should be just the domain)

2. **In the "Return URLs" field:**
   - Keep the full URL with `https://` and the path
   - Enter: `https://cardscope-web.vercel.app/api/auth/callback/apple`
   - If you have multiple return URLs, enter them comma-separated

## Complete Configuration

**Domains and Subdomains:**
```
cardscope-web.vercel.app
```

**Return URLs:**
```
https://cardscope-web.vercel.app/api/auth/callback/apple
```

## Why This Matters

- **Domains and Subdomains**: Apple needs to verify domain ownership. This field is for the domain only.
- **Return URLs**: These are the specific callback URLs where Apple will redirect users after authentication. These need the full URL including the path.

## After Fixing

1. Clear the error by entering the correct domain format
2. Click "Continue"
3. Click "Save"
4. Apple will verify your domain ownership (may take a few minutes)

## Domain Verification

After saving, Apple may require domain verification:
- You'll need to add a verification file to your website
- Or add a TXT record to your domain's DNS
- Follow Apple's instructions for domain verification
