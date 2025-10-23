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

    session: {
        strategy: "jwt", // ✅ stateless sessions for Next.js
    },

    callbacks: {
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

        /** ✅ After successful sign-in, redirect based on platform */
        async redirect({ url, baseUrl }) {
            console.log("🔍 Redirect callback - URL:", url, "BaseURL:", baseUrl);
            
            // Check if the URL contains the mobile deep link scheme
            if (url.includes("cardscope://")) {
                console.log("📱 Mobile deep link detected:", url);
                return url; // Return the deep link URL for mobile apps
            }
            
            // Check if this is a mobile app request by looking at the referer or user agent
            // For now, we'll use a different approach - redirect to a mobile detection page
            if (url.includes("/api/auth/callback/google")) {
                console.log("🔄 OAuth callback detected, redirecting to mobile detection");
                return `${baseUrl}/mobile-auth-success`;
            }
            
            // For web, redirect to home page
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            else if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
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
