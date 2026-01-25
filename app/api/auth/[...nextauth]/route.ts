import NextAuth from "next-auth";
import AppleProvider from "next-auth/providers/apple";

const handler = NextAuth({
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
    debug: true,
    // @ts-ignore - trustHost is valid but missing from some type definitions
    trustHost: true,
});

export { handler as GET, handler as POST };
