"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthSyncPage() {
    const router = useRouter();
    const [status, setStatus] = useState("Syncing session...");

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

                // Short delay to ensure local storage event propagates
                setTimeout(() => {
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

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 font-medium">{status}</p>
        </div>
    );
}
