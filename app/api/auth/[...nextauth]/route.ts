import NextAuth from "next-auth";
import AppleProvider from "next-auth/providers/apple";

const handler = NextAuth({
    providers: [
        AppleProvider({
            clientId: process.env.APPLE_ID!,
            clientSecret: process.env.APPLE_SECRET!,
            checks: ['state'], // Use state instead of PKCE
            authorization: {
                url: "https://appleid.apple.com/auth/authorize",
                params: {
                    scope: "email name",
                    response_mode: "form_post",
                    response_type: "code"
                }
            },
            token: "https://appleid.apple.com/auth/token",
            userinfo: "https://appleid.apple.com/auth/userinfo",
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.email?.split("@")[0] || "User",
                    email: profile.email!,
                    image: null
                };
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    debug: true,

    // Critical: Configure cookies to work with Apple's form_post
    cookies: {
        sessionToken: {
            name: `__Secure-next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: true,
            },
        },
        callbackUrl: {
            name: `__Secure-next-auth.callback-url`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: true,
            },
        },
        csrfToken: {
            name: `__Host-next-auth.csrf-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: true,
            },
        },
        state: {
            name: `__Secure-next-auth.state`,
            options: {
                httpOnly: true,
                sameSite: 'lax', // This is critical for Apple's form_post!
                path: '/',
                secure: true,
                maxAge: 900, // 15 minutes
            },
        },
    },
    // @ts-ignore - trustHost is valid but missing from some type definitions
    trustHost: true,
});

export { handler as GET, handler as POST };
