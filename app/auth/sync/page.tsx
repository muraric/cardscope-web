"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthSyncPage() {
    const router = useRouter();
    const [status, setStatus] = useState("Syncing session...");
    const [showFallback, setShowFallback] = useState(false);

    // Check if running on mobile browser (iOS Safari after Apple OAuth redirect)
    const isMobileBrowser = () => {
        return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    const redirectToApp = (userData: any) => {
        // Prepare the app URL with user data
        const encodedUserData = encodeURIComponent(JSON.stringify(userData));
        const appUrl = `cardscope://auth-success?status=success&userData=${encodedUserData}`;

        console.log("📱 Redirecting to app with URL:", appUrl);

        // Method 1: Direct location change
        try {
            window.location.href = appUrl;
            console.log("📱 Attempted redirect via window.location.href");
        } catch (error) {
            console.log("Method 1 failed:", error);
        }

        // Method 2: Create hidden iframe (backup)
        setTimeout(() => {
            try {
                const iframe = document.createElement("iframe");
                iframe.style.display = "none";
                iframe.src = appUrl;
                document.body.appendChild(iframe);
                console.log("📱 Attempted redirect via iframe");

                // Remove iframe after attempt
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            } catch (error) {
                console.log("Method 2 failed:", error);
            }
        }, 500);

        // Method 3: Try window.open (backup)
        setTimeout(() => {
            try {
                window.open(appUrl, "_self");
                console.log("📱 Attempted redirect via window.open");
            } catch (error) {
                console.log("Method 3 failed:", error);
            }
        }, 1000);

        // Show fallback message after attempts
        setTimeout(() => {
            setShowFallback(true);
        }, 2000);
    };

    useEffect(() => {
        const syncSession = async () => {
            try {
                // Fetch user session from server-side NextAuth
                const res = await fetch("/api/auth/session");

                if (!res.ok) {
                    throw new Error("No session found");
                }

                const userData = await res.json();
                console.log("✅ Synced session user:", userData);

                // Create user object compatible with AuthContext
                // NextAuth session user might differ slightly, normalize it here
                const localUser = {
                    id: userData.email, // Use email as ID for consistency
                    name: userData.name || userData.email?.split('@')[0],
                    email: userData.email,
                    picture: userData.image || null
                };

                // Store in localStorage for client-side AuthContext
                localStorage.setItem("cardscope_user", JSON.stringify(localUser));

                // Trigger auth update events
                window.dispatchEvent(new Event("authUpdated"));
                // Also dispatch storage event for cross-tab sync if needed
                window.dispatchEvent(new StorageEvent("storage", {
                    key: "cardscope_user",
                    newValue: JSON.stringify(localUser)
                }));

                setStatus("✅ Success! Redirecting...");
                setUserData(localUser); // Store for the "Open App" button

                // Short delay to ensure local storage event propagates
                setTimeout(() => {
                    // Check if on mobile browser (iOS Safari after Apple OAuth)
                    // This is more reliable than checking Capacitor.isNativePlatform()
                    // because after Apple OAuth, we're in Safari, not the Capacitor WebView
                    if (isMobileBrowser()) {
                        console.log("📱 Mobile browser detected, redirecting to app via custom scheme");
                        redirectToApp(localUser);
                        return;
                    }

                    // Also try Capacitor check as fallback for in-app WebView scenarios
                    try {
                        // @ts-ignore
                        if (window.Capacitor?.isNativePlatform()) {
                            console.log("📱 Native platform detected via Capacitor, diverting to app scheme");
                            redirectToApp(localUser);
                            return;
                        }
                    } catch (e) {
                        console.log("Native check failed", e);
                    }

                    // Web flow - redirect to home
                    console.log("🌐 Web browser detected, redirecting to home");
                    router.replace("/");
                }, 500);

            } catch (err) {
                console.error("❌ Session sync failed:", err);
                setStatus("❌ Authentication failed. Redirecting to login...");
                setTimeout(() => {
                    router.replace("/login?error=sync_failed");
                }, 2000);
            }
        };

        syncSession();
    }, [router]);

    // Store user data for the "Open App" button
    const [userData, setUserData] = useState<any>(null);

    const openApp = () => {
        if (userData) {
            const encodedUserData = encodeURIComponent(JSON.stringify(userData));
            const appUrl = `cardscope://auth-success?status=success&userData=${encodedUserData}`;
            window.location.href = appUrl;
        }
    };

    if (showFallback) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
                <div className="text-center max-w-md">
                    <h2 className="text-xl font-semibold text-green-600 mb-4">✅ Authentication Complete!</h2>
                    <p className="text-gray-600 mb-4">Your Apple account has been successfully linked.</p>
                    <p className="text-gray-500 mb-6">Tap the button below to return to the app.</p>

                    <button
                        onClick={openApp}
                        className="w-full px-6 py-4 bg-black text-white rounded-lg font-semibold text-lg hover:bg-gray-800 transition mb-4"
                    >
                        Open CardScope App
                    </button>

                    <p className="text-xs text-gray-400 mb-4">
                        If the button doesn't work, tap "CardCompass" in the top left corner of Safari.
                    </p>

                    <button
                        onClick={() => window.close()}
                        className="px-4 py-2 text-gray-500 text-sm hover:text-gray-700 transition"
                    >
                        Close Browser
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 font-medium">{status}</p>
        </div>
    );
}
