import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { identityToken, user, email, name } = await request.json();
    
    if (!identityToken) {
      return NextResponse.json({ error: 'Identity token is required' }, { status: 400 });
    }

    // Verify the identity token (in production, you should verify the JWT signature)
    // For now, we'll trust the token from Apple and extract user info
    
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
    
    // Create user payload
    const payload = {
      name: name || email?.split('@')[0] || 'User',
      email: email || user,
      provider: 'apple',
      providerId: user || email,
      image: null, // Apple Sign-In doesn't provide profile pictures
    };

    // Register or update user in backend
    const res = await fetch(`${apiUrl}/api/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Backend signup failed:', errorText);
      return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 });
    }

    const userData = await res.json();

    // Return user data for frontend
    return NextResponse.json({
      user: {
        id: email || user,
        name: payload.name,
        email: email || user,
        picture: null,
      },
    });
  } catch (error) {
    console.error('Apple Sign-In error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
