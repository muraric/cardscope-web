import { NextResponse } from 'next/server';

export async function GET() {
  const debugInfo = {
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      hasAppleId: !!process.env.APPLE_ID,
      hasAppleSecret: !!process.env.APPLE_SECRET,
      hasAppleTeamId: !!process.env.APPLE_TEAM_ID,
      hasAppleKeyId: !!process.env.APPLE_KEY_ID,
      appleIdValue: process.env.APPLE_ID,
      appleSecretLength: process.env.APPLE_SECRET?.length || 0,
      appleSecretHasNewLines: (process.env.APPLE_SECRET || '').includes('\n'),
      appleSecretStartsWithBegin: (process.env.APPLE_SECRET || '').startsWith('-----BEGIN'),
      appleTeamIdValue: process.env.APPLE_TEAM_ID,
      appleKeyIdValue: process.env.APPLE_KEY_ID,
    },
    nextAuth: {
      url: process.env.NEXTAUTH_URL,
      expectedCallbackUrl: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/callback/apple` : 'not set (will be inferred by NextAuth)',
      hasSecret: !!process.env.NEXTAUTH_SECRET,
      secretLength: process.env.NEXTAUTH_SECRET?.length || 0,
    },
    // Try to import NextAuth providers to see if there are any import errors
    providers: {
      googleAvailable: true,
      appleAvailable: false,
      appleError: null as string | null,
    },
  };

  // Try to initialize Apple provider to see what error we get
  try {
    const AppleProviderModule = await import('next-auth/providers/apple');
    const AppleProvider = AppleProviderModule.default || AppleProviderModule;

    if (process.env.APPLE_ID && process.env.APPLE_SECRET) {
      try {
        AppleProvider({
          clientId: process.env.APPLE_ID,
          clientSecret: process.env.APPLE_SECRET,
        });
        debugInfo.providers.appleAvailable = true;
      } catch (error: any) {
        debugInfo.providers.appleError = error.message;
        debugInfo.providers.appleAvailable = false;
      }
    } else {
      debugInfo.providers.appleError = 'Missing APPLE_ID or APPLE_SECRET';
    }
  } catch (error: any) {
    debugInfo.providers.appleError = `Import error: ${error.message}`;
  }

  return NextResponse.json(debugInfo);
}
