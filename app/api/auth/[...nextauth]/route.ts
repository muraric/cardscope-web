import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "next-auth" {
    interface Profile {
        picture?: string;
    }
}

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],

    session: {
        strategy: "jwt", // ✅ Use JWT-based sessions for stateless auth
    },

    callbacks: {
        async signIn({ user, account, profile }) {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

                const res = await fetch(`${apiUrl}/api/user`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: user.name,
                        email: user.email,
                        provider: "google",
                        providerId: account?.providerAccountId,
                        image: user.image || profile?.picture || null,
                    }),
                });

                if (res.ok) {
                    console.log("✅ Google user accepted by backend");
                    return true;
                }

                console.error("❌ Backend signup failed:", await res.text());
                return false;
            } catch (err) {
                console.error("❌ signIn callback error:", err);
                return false;
            }
        },

        async redirect({ url, baseUrl }) {
            // Always redirect to settings after login success
            return `/`;
        },

        async jwt({ token, account, user }) {
            // ✅ Attach Google info to JWT
            if (account && user) {
                token.provider = account.provider;
                token.email = user.email;
                token.name = user.name;
                token.picture = user.image;
            }
            return token;
        },

        async session({ session, token }) {
            // ✅ Attach provider data to session
            if (token) {
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.image = token.picture as string;
                session.provider = token.provider;
            }
            return session;
        },
    },

    pages: {
        signIn: "/login", // ✅ Custom login page
        error: "/login",  // Redirect error back to login page
    },
});

export { handler as GET, handler as POST };
