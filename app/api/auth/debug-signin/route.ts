import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(request: NextRequest) {
    try {
        // Import NextAuth handler to inspect providers
        const { default: NextAuth } = await import("next-auth");
        const { default: AppleProvider } = await import("next-auth/providers/apple");
        
        // Check environment variables
        const hasAppleId = !!process.env.APPLE_ID;
        const hasAppleSecret = !!process.env.APPLE_SECRET;
        const hasNextAuthUrl = !!process.env.NEXTAUTH_URL;
        
        // Try to create Apple provider instance
        let appleProvider = null;
        let appleProviderError = null;
        
        if (hasAppleId && hasAppleSecret) {
            try {
                appleProvider = AppleProvider({
                    clientId: process.env.APPLE_ID!,
                    clientSecret: process.env.APPLE_SECRET!,
                });
            } catch (error: any) {
                appleProviderError = error.message;
            }
        }
        
        // Get the signin URL that NextAuth would generate
        const baseUrl = process.env.NEXTAUTH_URL || request.headers.get('origin') || 'https://cardscope-web.vercel.app';
        const callbackUrl = `${baseUrl}/api/auth/callback/apple`;
        
        return NextResponse.json({
            environment: {
                hasAppleId,
                hasAppleSecret,
                hasNextAuthUrl,
                nextAuthUrl: process.env.NEXTAUTH_URL,
                baseUrl,
                callbackUrl,
            },
            appleProvider: {
                created: !!appleProvider,
                error: appleProviderError,
                id: appleProvider?.id,
            },
            message: "Check the environment variables and Apple provider configuration",
        });
    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
            stack: error.stack,
        }, { status: 500 });
    }
}
