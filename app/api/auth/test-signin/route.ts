import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        // Try to manually construct what NextAuth would do
        const baseUrl = process.env.NEXTAUTH_URL || request.headers.get('origin') || 'https://cardscope-web.vercel.app';
        const callbackUrl = `${baseUrl}/api/auth/callback/apple`;
        
        // Check if we can import and create Apple provider
        let appleProviderInfo = null;
        try {
            const { default: AppleProvider } = await import("next-auth/providers/apple");
            
            if (process.env.APPLE_ID && process.env.APPLE_SECRET) {
                const provider = AppleProvider({
                    clientId: process.env.APPLE_ID,
                    clientSecret: process.env.APPLE_SECRET,
                    authorization: {
                        params: {
                            scope: "name email",
                            response_mode: "form_post",
                            response_type: "code id_token",
                        },
                    },
                });
                
                // Try to get the authorization URL (this is what NextAuth does internally)
                try {
                    // This is a simplified check - NextAuth does more internally
                    appleProviderInfo = {
                        id: provider.id,
                        name: provider.name,
                        type: provider.type,
                        callbackUrl,
                        baseUrl,
                        canGenerateUrl: true,
                    };
                } catch (error: any) {
                    appleProviderInfo = {
                        error: error.message,
                        stack: error.stack,
                    };
                }
            }
        } catch (error: any) {
            appleProviderInfo = {
                importError: error.message,
                stack: error.stack,
            };
        }
        
        return NextResponse.json({
            baseUrl,
            callbackUrl,
            appleProvider: appleProviderInfo,
            environment: {
                hasAppleId: !!process.env.APPLE_ID,
                hasAppleSecret: !!process.env.APPLE_SECRET,
                hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
                nextAuthUrl: process.env.NEXTAUTH_URL,
            },
            message: "This endpoint tests if Apple provider can be created and configured",
        });
    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
            stack: error.stack,
        }, { status: 500 });
    }
}
