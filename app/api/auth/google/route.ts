import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }

    // Get client secret from environment
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    if (!clientSecret) {
      console.error('GOOGLE_CLIENT_SECRET not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Exchange code for tokens using Google's token endpoint
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: '488875684334-urrslagsla2btuuri02acrunqum7d2bk.apps.googleusercontent.com',
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: 'https://cardscope-web.vercel.app/auth/callback',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return NextResponse.json({ error: 'Token exchange failed' }, { status: 400 });
    }

    const tokens = await tokenResponse.json();

    // Get user info using the access token
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error('Failed to get user info');
      return NextResponse.json({ error: 'Failed to get user info' }, { status: 400 });
    }

    const userData = await userResponse.json();

    // Return user data
    const user = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      picture: userData.picture,
    };

    return NextResponse.json({ user });

  } catch (error) {
    console.error('OAuth token exchange error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
