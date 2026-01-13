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
        const appleConfig = {
            clientId: process.env.APPLE_ID,
            clientSecret: process.env.APPLE_SECRET,
            authorization: {
                params: {
                    scope: "name email",
                    // Apple requires form_post when requesting user info scopes
                    response_mode: "form_post",
                    response_type: "code id_token",
                },
            },
        };
        
        console.log("🔍 Creating Apple provider with config:", {
            clientId: appleConfig.clientId,
            hasSecret: !!appleConfig.clientSecret,
            nextAuthUrl: process.env.NEXTAUTH_URL,
            callbackUrl: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/callback/apple` : 'not set',
        });
        
        const appleProvider = AppleProvider(appleConfig);
        providers.push(appleProvider);
        
        console.log("✅ Apple provider initialized successfully");
        console.log("✅ Apple provider ID:", appleProvider.id);
    } catch (error: any) {
        console.error("❌ Failed to initialize Apple provider:", error.message);
        console.error("Error details:", error);
        console.error("Error stack:", error.stack);
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
            
            // NOTE: Redirect callback is called MULTIPLE times:
            // 1. During initial signin (before OAuth URL generated) - url might be baseUrl
            // 2. After OAuth callback - url will be the callback URL or intended destination
            // NextAuth handles OAuth URL generation internally, so we shouldn't interfere
            
            // Allow Apple OAuth redirects to pass through (don't intercept)
            if (url.includes("appleid.apple.com") || url.startsWith("https://appleid.apple.com")) {
                console.log("🍎 Apple OAuth redirect detected, allowing through:", url);
                return url;
            }
            
            // If URL is external (like OAuth providers), allow it through
            try {
                const urlObj = new URL(url);
                if (urlObj.origin !== baseUrl && urlObj.origin !== new URL(baseUrl).origin) {
                    console.log("🌐 External redirect detected, allowing through:", url);
                    return url;
                }
            } catch (e) {
                // Invalid URL, continue with normal handling
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
            
            // Default: return baseUrl (NextAuth will handle OAuth redirects internally)
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
    
    /** ✅ Events for debugging */
    events: {
        async signIn(message) {
            console.log("🔍 signIn event:", message);
        },
        async signOut(message) {
            console.log("🔍 signOut event:", message);
        },
        async createUser(message) {
            console.log("🔍 createUser event:", message);
        },
        async updateUser(message) {
            console.log("🔍 updateUser event:", message);
        },
        async linkAccount(message) {
            console.log("🔍 linkAccount event:", message);
        },
        async session(message) {
            console.log("🔍 session event:", message);
        },
    },
    
    /** ✅ Logger for detailed error tracking */
    logger: {
        error(code, metadata) {
            console.error("❌ NextAuth Error:", code, metadata);
        },
        warn(code) {
            console.warn("⚠️ NextAuth Warning:", code);
        },
        debug(code, metadata) {
            console.log("🔍 NextAuth Debug:", code, metadata);
        },
    },
});

export { handler as GET, handler as POST };
