"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useAuth } from "../contexts/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { signOut } = useAuth();

    useEffect(() => {
        const applyStatusBar = async () => {
            try {
                // Only run on native; web will warn
                if (!Capacitor.isNativePlatform()) return;

                const platform = Capacitor.getPlatform();
                await StatusBar.show();

                if (platform === "ios") {
                    await StatusBar.setOverlaysWebView({ overlay: false });
                    await StatusBar.setStyle({ style: Style.Dark });
                    await StatusBar.setBackgroundColor({ color: "#f2f2f2" });
                } else if (platform === "android") {
                    await StatusBar.setOverlaysWebView({ overlay: true });
                    await StatusBar.setStyle({ style: Style.Light });
                    await StatusBar.setBackgroundColor({ color: "#000000" });
                }
            } catch (err) {
                console.warn("StatusBar setup skipped:", err);
            }
        };

        applyStatusBar();
    }, []);

    const handleSignOut = async () => {
        try {
            console.log("🔓 Signing out user...");
            signOut(); // Use custom auth signOut
            router.replace("/login");
        } catch (err) {
            console.error("❌ Sign-out error:", err);
        }
    };

    const getTitle = () => (pathname === "/settings" ? "Settings" : "Suggestions");

    return (
        <div
            className="min-h-screen flex flex-col font-sans bg-gray-50"
            style={{
                paddingTop: "env(safe-area-inset-top, 0px)",
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
        >
            {/* Header */}
            <header className="bg-white shadow-sm py-3 rounded-t-2xl overflow-hidden sticky top-0 z-50" style={{ top: "env(safe-area-inset-top, 0px)" }}>
                <div className="max-w-lg mx-auto w-full px-4 flex justify-between items-center gap-2 min-w-0">
                    <div className="flex-shrink-0 min-w-0">
                        {pathname === "/settings" ? (
                            <Link
                                href="/"
                                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition inline-flex items-center justify-center"
                                aria-label="Home"
                            >
                                🏠
                            </Link>
                        ) : (
                            <Link
                                href="/settings"
                                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition inline-flex items-center justify-center"
                                aria-label="Settings"
                            >
                                ⚙️
                            </Link>
                        )}
                    </div>

                    <h1 className="text-base sm:text-lg font-semibold text-gray-800 flex-1 text-center min-w-0 truncate px-2">
                        {getTitle()}
                    </h1>

                    <div className="flex-shrink-0 min-w-0">
                        <button
                            onClick={handleSignOut}
                            className="bg-red-600 text-white px-3 py-1 text-xs sm:text-sm rounded-lg font-medium transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 whitespace-nowrap"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="flex-1 w-full text-gray-900">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white text-center text-xs text-gray-500 border-t py-3 rounded-b-2xl">
                <div className="max-w-lg mx-auto w-full px-4 space-y-1">
                    <div>© {new Date().getFullYear()} CardCompass</div>
                    <div>
                        <Link href="/privacy" className="hover:text-gray-700 underline">
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
