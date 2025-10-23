"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";

export default function MobileAuthSuccess() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        const handleRedirect = async () => {
            // Wait for session to be available
            if (status === "loading") return;
            
            if (session) {
                console.log("✅ Mobile auth success - user authenticated:", session.user?.email);
                
                // Check if we're in a mobile app
                if (Capacitor.isNativePlatform()) {
                    console.log("📱 In mobile app, redirecting to app home");
                    // In mobile app, redirect to home
                    router.replace("/");
                } else {
                    console.log("💻 In web browser, attempting deep link to app");
                    // Try to redirect to the native app using deep link
                    try {
                        // First try the custom scheme
                        window.location.href = "cardscope://api/auth/callback/google";
                        
                        // If that doesn't work, try after a delay
                        setTimeout(() => {
                            console.log("📱 Deep link failed, staying in web");
                            router.replace("/");
                        }, 2000);
                    } catch (error) {
                        console.log("📱 Deep link error:", error);
                        router.replace("/");
                    }
                }
            } else {
                console.log("❌ No session found, redirecting to login");
                router.replace("/login");
            }
        };

        handleRedirect();
    }, [session, status, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-4">
                <div className="text-6xl">🔐</div>
                <h1 className="text-2xl font-bold text-gray-800">Authentication Successful!</h1>
                <p className="text-gray-600">Redirecting you back to the app...</p>
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        </div>
    );
}

