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
            process.env.GOOGLE_CLIENT_ID_ANDROID!,
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
    providers.push(
        AppleProvider({
            clientId: process.env.APPLE_ID,
            clientSecret: process.env.APPLE_SECRET,
            checks: ['state'],
            authorization: {
                params: {
                    scope: 'name email',
                    response_mode: 'form_post',
                    response_type: 'code',
                }
            },
            profile(profile) {
                console.log("🍎 Apple profile received:", profile);
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: null,
                }
            }
        })
    );
} else {
    console.warn("⚠️ Apple Sign-In not configured: APPLE_ID and APPLE_SECRET environment variables are required");
}

const handler = NextAuth({
    providers,

    debug: true,

    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",

    useSecureCookies: true,

    cookies: {
        state: {
            name: '__Secure-next-auth.state',
            options: {
                httpOnly: true,
                sameSite: 'none',
                path: '/',
                secure: true,
            },
        },
        callbackUrl: {
            name: '__Secure-next-auth.callback-url',
            options: {
                sameSite: 'none',
                path: '/',
                secure: true,
            }
        }
    },


    // @ts-ignore - trustHost is valid but missing from some type definitions
    trustHost: true,

    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
        updateAge: 24 * 60 * 60,
    },

    jwt: {
        maxAge: 30 * 24 * 60 * 60,
    },

    callbacks: {
        // ✅ SIMPLIFIED redirect callback - don't interfere with OAuth flow
        async redirect({ url, baseUrl }) {
            console.log("🔍 Redirect callback - URL:", url, "BaseURL:", baseUrl);

            // For mobile custom scheme
            if (url.startsWith("cardscope://")) {
                return url;
            }

            // Allow relative URLs
            if (url.startsWith("/")) {
                return `${baseUrl}${url}`;
            }

            // Allow same origin URLs
            if (new URL(url).origin === baseUrl) {
                return url;
            }

            // Default to baseUrl - let NextAuth handle everything else
            return baseUrl;
        },

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

        async jwt({ token, account, user }) {
            if (account && user) {
                token.provider = account.provider;
                token.email = user.email;
                token.name = user.name;
                token.picture = user.image;
            }
            return token;
        },

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

    pages: {
        signIn: "/login",
        error: "/login",
    },

    events: {
        async signIn(message) {
            console.log("🔍 signIn event:", message);
        },
    },

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
