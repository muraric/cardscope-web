import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/** ✅ Extend NextAuth types to safely include optional picture field */
declare module "next-auth" {
    interface Profile {
        picture?: string;
    }
}

const handler = NextAuth({
    providers: [
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
                },
            },
        }),
    ],

    // ✅ Enable debug logging for troubleshooting
    debug: process.env.NODE_ENV === "development",

    // ✅ Configure cookies for mobile compatibility
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined,
            },
        },
        callbackUrl: {
            name: `next-auth.callback-url`,
            options: {
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
        csrfToken: {
            name: `next-auth.csrf-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
        pkceCodeVerifier: {
            name: `next-auth.pkce.code_verifier`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 15, // 15 minutes
            },
        },
        state: {
            name: `next-auth.state`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 15, // 15 minutes
            },
        },
    },

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
            
            // Handle OAuth callback URLs - redirect back to app
            if (url.includes("/api/auth/callback/google")) {
                console.log("🔄 OAuth callback detected, redirecting to app");
                return `${baseUrl}/`;
            }
            
            // Handle mobile auth success redirect
            if (url.includes("/mobile-auth-success")) {
                console.log("📱 Mobile auth success redirect");
                return `${baseUrl}/mobile-auth-success`;
            }
            
            // Handle other redirects
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            else if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        },

        /** ✅ When user signs in via Google */
        async signIn({ user, account, profile }) {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

                const payload = {
                    name: user.name,
                    email: user.email,
                    provider: "google",
                    providerId: account?.providerAccountId,
                    image: user.image || (profile as any)?.picture || null,
                };

                const res = await fetch(`${apiUrl}/api/user`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (res.ok) {
                    console.log("✅ Google user accepted by backend:", user.email);
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
