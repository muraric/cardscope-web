import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        appleId: process.env.APPLE_ID || 'MISSING',
        appleSecretExists: !!process.env.APPLE_SECRET,
        appleSecretLength: process.env.APPLE_SECRET?.length || 0,
        nextauthUrl: process.env.NEXTAUTH_URL || 'MISSING',
        nextauthSecretExists: !!process.env.NEXTAUTH_SECRET,
    });
}
