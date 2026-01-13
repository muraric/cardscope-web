import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";

/** ✅ Extend NextAuth types to safely include optional picture field */
declare module "next-auth" {
    interface Profile {
        picture?: string;
    }
}

// Build providers array conditionally
const providers: any[] = [
    GoogleProvider({
        clientId:
            process.env.GOOGLE_CLIENT_ID ||
            process.env.GOOGLE_CLIENT_ID_ANDROID!, // ✅ support both web + Android clients
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        authorization: {
            params: {
                prompt: "select_account",
                access_type: "offline",
                response_type: "code",
                scope: "openid email profile",
            },
        },
        checks: [],
    }),
];

// Only add Apple provider if configured
if (process.env.APPLE_ID && process.env.APPLE_SECRET) {
    try {
        providers.push(
            AppleProvider({
                clientId: process.env.APPLE_ID,
                clientSecret: process.env.APPLE_SECRET,
                authorization: {
                    params: {
                        scope: "name email",
                        // Use query instead of form_post for better compatibility
                        // form_post requires special handling and might cause redirect issues
                        response_mode: "query",
                    },
                },
            })
        );
        console.log("✅ Apple provider initialized successfully");
        console.log("✅ Apple provider config:", {
            clientId: process.env.APPLE_ID,
            hasSecret: !!process.env.APPLE_SECRET,
            nextAuthUrl: process.env.NEXTAUTH_URL,
        });
    } catch (error: any) {
        console.error("❌ Failed to initialize Apple provider:", error.message);
        console.error("Error details:", error);
    }
} else {
    console.warn("⚠️ Apple Sign-In not configured: APPLE_ID and APPLE_SECRET environment variables are required");
}

const handler = NextAuth({
    providers,

    // ✅ Enable debug logging for troubleshooting (enable in production to debug Apple Sign-In)
    debug: true, // Temporarily enabled to debug Apple Sign-In issues

    // ✅ Add secret for proper session handling
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",

    // ✅ Use default cookie behavior but with custom settings
    useSecureCookies: process.env.NODE_ENV === 'production',

    session: {
        strategy: "jwt", // ✅ stateless sessions for Next.js
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // 24 hours
    },

    // ✅ Add JWT configuration for mobile compatibility
    jwt: {
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    callbacks: {
        /** ✅ Custom OAuth callback to handle mobile in-app browser */
        async redirect({ url, baseUrl }) {
            console.log("🔍 Redirect callback - URL:", url, "BaseURL:", baseUrl);
            console.log("🔍 Redirect callback - Full context:", { url, baseUrl, urlType: typeof url });
            
            // CRITICAL: If URL is just the baseUrl during signin, NextAuth might not have generated the OAuth URL
            // This could indicate a configuration issue. Return the URL as-is to avoid breaking the flow.
            if (url === baseUrl) {
                console.warn("⚠️ Redirect callback received baseUrl - NextAuth may not have generated OAuth URL");
                console.warn("⚠️ This might indicate missing NEXTAUTH_URL or Apple provider configuration issue");
                // Return baseUrl to avoid infinite redirect, but log the issue
                return baseUrl;
            }
            
            // Allow Apple OAuth redirects to pass through (don't intercept)
            if (url.includes("appleid.apple.com") || url.startsWith("https://appleid.apple.com")) {
                console.log("🍎 Apple OAuth redirect detected, allowing through:", url);
                return url;
            }
            
            // Handle OAuth callback URLs - redirect back to app
            if (url.includes("/api/auth/callback/google")) {
                console.log("🔄 Google OAuth callback detected, redirecting to app");
                return `${baseUrl}/`;
            }
            
            // Handle Apple OAuth callback URLs
            if (url.includes("/api/auth/callback/apple")) {
                console.log("🍎 Apple OAuth callback detected, redirecting to app");
                return `${baseUrl}/`;
            }
            
            // Handle custom scheme callbacks (for mobile)
            if (url.startsWith("cardscope://")) {
                console.log("📱 Custom scheme callback detected:", url);
                return `${baseUrl}/mobile-auth-success`;
            }
            
            // Handle mobile auth success redirect
            if (url.includes("/mobile-auth-success")) {
                console.log("📱 Mobile auth success redirect");
                return `${baseUrl}/mobile-auth-success`;
            }
            
            // Handle error redirects
            if (url.includes("error=")) {
                console.log("⚠️ Error in redirect URL:", url);
                // Still redirect to login but preserve error for display
                return `${baseUrl}/login?${url.split('?')[1] || ''}`;
            }
            
            // Handle other redirects
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            else if (new URL(url).origin === baseUrl) return url;
            
            // If URL is external (like Apple OAuth), allow it through
            try {
                const urlObj = new URL(url);
                if (urlObj.origin !== baseUrl) {
                    console.log("🌐 External redirect detected, allowing through:", url);
                    return url;
                }
            } catch (e) {
                // Invalid URL, fall back to baseUrl
            }
            
            return baseUrl;
        },

        /** ✅ When user signs in via Google or Apple */
        async signIn({ user, account, profile }) {
            console.log("🔍 signIn callback called:", { 
                provider: account?.provider, 
                hasUser: !!user, 
                hasAccount: !!account,
                accountType: account?.type 
            });
            
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
                const provider = account?.provider || "google";

                const payload = {
                    name: user.name,
                    email: user.email,
                    provider: provider,
                    providerId: account?.providerAccountId,
                    image: user.image || (profile as any)?.picture || null,
                };

                const res = await fetch(`${apiUrl}/api/user`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (res.ok) {
                    console.log(`✅ ${provider} user accepted by backend:`, user.email);
                    return true;
                }

                console.error("❌ Backend signup failed:", await res.text());
                return false;
            } catch (err) {
                console.error("❌ signIn callback error:", err);
                return false;
            }
        },


        /** ✅ Attach token data to JWT */
        async jwt({ token, account, user }) {
            if (account && user) {
                token.provider = account.provider;
                token.email = user.email;
                token.name = user.name;
                token.picture = user.image;
            }
            return token;
        },

        /** ✅ Map JWT values to session safely */
        async session({ session, token }) {
            if (token) {
                session.user = session.user || { name: "", email: "", image: "" };
                session.user.email = (token.email as string) || "";
                session.user.name = (token.name as string) || "";
                session.user.image = (token.picture as string) || "";
                (session as any).provider = token.provider;
            }
            return session;
        },
    },

    /** ✅ Custom pages (consistent UX) */
    pages: {
        signIn: "/login",
        error: "/login",
    },
});

export { handler as GET, handler as POST };
