import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        return NextResponse.json(session.user);
    } catch (error) {
        console.error("Session API Error:", error);
        return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
