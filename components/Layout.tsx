"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth } from "../lib/auth";
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const applyStatusBar = async () => {
            try {
                const platform = Capacitor.getPlatform();

                await StatusBar.show();

                if (platform === "ios") {
                    // ✅ Ensure iOS status text is visible
                    await StatusBar.setOverlaysWebView({ overlay: false });
                    await StatusBar.setStyle({ style: Style.Dark }); // dark icons (black)
                    await StatusBar.setBackgroundColor({ color: "#f2f2f2" }); // light gray background for contrast
                } else if (platform === "android") {
                    // ✅ Keep Android as is (already working)
                    await StatusBar.setOverlaysWebView({ overlay: true });
                    await StatusBar.setStyle({ style: Style.Light }); // white text
                    await StatusBar.setBackgroundColor({ color: "#000000" });
                }
            } catch (err) {
                console.warn("StatusBar setup skipped:", err);
            }
        };

        applyStatusBar();
    }, []);

    const handleSignOut = () => {
        clearAuth();
        router.push("/login");
    };

    const getTitle = () => (pathname === "/settings" ? "Settings" : "Suggestions");

    return (
        <div
            className="min-h-screen flex flex-col font-sans bg-gray-50"
            style={{
                paddingTop: "env(safe-area-inset-top, 38px)",
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
        >
            {/* Header */}
            <header className="bg-white shadow-sm px-4 py-3 flex justify-between items-center rounded-t-2xl">
                {pathname === "/settings" ? (
                    <Link
                        href="/"
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                        aria-label="Home"
                    >
                        🏠
                    </Link>
                ) : (
                    <Link
                        href="/settings"
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                        aria-label="Settings"
                    >
                        ⚙️
                    </Link>
                )}

                <h1 className="text-base sm:text-lg font-semibold text-gray-800">
                    {getTitle()}
                </h1>

                <button
                    onClick={handleSignOut}
                    className="btn btn-danger px-3 py-1 text-xs sm:text-sm"
                >
                    Sign Out
                </button>
            </header>

            {/* Main */}
            <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 text-gray-900">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white text-center text-xs text-gray-500 border-t py-3 rounded-b-2xl">
                © {new Date().getFullYear()} Credit Card Advisor
            </footer>
        </div>
    );
}
