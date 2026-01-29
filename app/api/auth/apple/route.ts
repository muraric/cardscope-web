import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

// Initialize JWKS client to fetch Apple's public keys
const client = jwksClient({
  jwksUri: "https://appleid.apple.com/auth/keys",
  cache: true,
  cacheMaxAge: 86400000, // 24 hours
});

// Get signing key from Apple's JWKS
function getAppleSigningKey(kid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    client.getSigningKey(kid, (err, key) => {
      if (err) {
        reject(err);
        return;
      }
      const signingKey = key?.getPublicKey();
      if (!signingKey) {
        reject(new Error("No signing key found"));
        return;
      }
      resolve(signingKey);
    });
  });
}

// Verify Apple identity token
async function verifyAppleToken(
  identityToken: string
): Promise<jwt.JwtPayload> {
  // Decode header to get key ID
  const decoded = jwt.decode(identityToken, { complete: true });
  if (!decoded || !decoded.header.kid) {
    throw new Error("Invalid token: missing key ID");
  }

  // Get the signing key from Apple
  const signingKey = await getAppleSigningKey(decoded.header.kid);

  // Verify the token
  return new Promise((resolve, reject) => {
    jwt.verify(
      identityToken,
      signingKey,
      {
        algorithms: ["RS256"],
        issuer: "https://appleid.apple.com",
        audience: "com.shomuran.cardcompass", // Your app's Bundle ID
      },
      (err, payload) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(payload as jwt.JwtPayload);
      }
    );
  });
}

export async function POST(request: NextRequest) {
  try {
    const { identityToken, user, email, givenName, familyName } =
      await request.json();

    console.log("🍎 Apple auth request received:", {
      hasToken: !!identityToken,
      user,
      email,
      givenName,
      familyName,
    });

    if (!identityToken) {
      return NextResponse.json(
        { error: "Identity token is required" },
        { status: 400 }
      );
    }

    // Verify the identity token with Apple's public keys
    let tokenPayload: jwt.JwtPayload;
    try {
      tokenPayload = await verifyAppleToken(identityToken);
      console.log("✅ Apple token verified:", {
        sub: tokenPayload.sub,
        email: tokenPayload.email,
        email_verified: tokenPayload.email_verified,
      });
    } catch (verifyError: any) {
      console.error("❌ Token verification failed:", verifyError.message);
      return NextResponse.json(
        { error: "Invalid identity token", details: verifyError.message },
        { status: 401 }
      );
    }

    // Extract user info from verified token
    const appleUserId = tokenPayload.sub; // Unique, immutable Apple user ID
    const verifiedEmail = tokenPayload.email || email;

    // Build user name - IMPORTANT: Apple only sends name on FIRST login!
    const userName =
      givenName || familyName
        ? `${givenName || ""} ${familyName || ""}`.trim()
        : verifiedEmail?.split("@")[0] || "User";

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

    // Create user payload for backend
    const payload = {
      name: userName,
      email: verifiedEmail,
      provider: "apple",
      providerId: appleUserId, // Use Apple's unique user ID
      image: null, // Apple Sign-In doesn't provide profile pictures
    };

    console.log("🍎 Sending to backend:", payload);

    // Register or update user in backend (upsert)
    const res = await fetch(`${apiUrl}/api/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Backend signup failed:", errorText);
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }

    const userData = await res.json();
    console.log("✅ Backend user created/updated:", userData);

    // Return user data for frontend
    return NextResponse.json({
      user: {
        id: appleUserId,
        name: userName,
        email: verifiedEmail,
        picture: null,
      },
    });
  } catch (error: any) {
    console.error("❌ Apple Sign-In error:", error);
    return NextResponse.json(
      { error: "Authentication failed", details: error.message },
      { status: 500 }
    );
  }
}
