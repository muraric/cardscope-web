import { NextAuthOptions } from "next-auth";
import AppleProvider from "next-auth/providers/apple";

export const authOptions: NextAuthOptions = {
    providers: [
        AppleProvider({
            clientId: process.env.APPLE_ID!,
            clientSecret: process.env.APPLE_SECRET!,
            checks: [], // CRITICAL: No cookie-based checks with form_post
            authorization: {
                params: {
                    scope: "email name",
                    response_mode: "form_post",
                    response_type: "code"
                }
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    cookies: {
        sessionToken: {
            name: `__Secure-next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'none',
                path: '/',
                secure: true,
            },
        },
        callbackUrl: {
            name: `__Secure-next-auth.callback-url`,
            options: {
                httpOnly: true,
                sameSite: 'none',
                path: '/',
                secure: true,
            },
        },
        csrfToken: {
            name: `__Host-next-auth.csrf-token`,
            options: {
                httpOnly: true,
                sameSite: 'none',
                path: '/',
                secure: true,
            },
        },
        state: {
            name: `__Secure-next-auth.state`,
            options: {
                httpOnly: true,
                sameSite: 'none',
                path: '/',
                secure: true,
                maxAge: 900, // 15 minutes
            },
        },
    },
    debug: true,
    callbacks: {
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

            // Default to baseUrl
            return baseUrl;
        },

        async signIn({ user, account, profile }) {
            console.log("🍎 signIn callback START:", {
                provider: account?.provider,
                email: user.email,
                name: user.name,
            });

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
                const provider = account?.provider || "apple";

                const payload = {
                    name: user.name,
                    email: user.email,
                    provider: provider,
                    providerId: account?.providerAccountId,
                    image: user.image || null,
                };

                console.log("🍎 Sending to backend:", apiUrl, payload);

                const res = await fetch(`${apiUrl}/api/user`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                console.log("🍎 Backend response status:", res.status);

                if (res.ok) {
                    console.log(`✅ ${provider} user accepted by backend:`, user.email);
                    return true;
                }

                const errorText = await res.text();
                console.error("❌ Backend signup failed:", res.status, errorText);
                return false;
            } catch (err) {
                console.error("❌ signIn callback error:", err);
                return false;
            }
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    // @ts-ignore - trustHost is valid but missing from some type definitions
    trustHost: true,
};
