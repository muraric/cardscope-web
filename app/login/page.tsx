"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import api from "../../lib/api";
import { setAuth } from "../../lib/auth";
import { Capacitor } from "@capacitor/core";

export default function Login() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const redirected = useRef(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // ✅ Redirect once after successful login
    useEffect(() => {
        if (status === "authenticated" && !redirected.current) {
            redirected.current = true;
            console.log("✅ Login success → redirecting to /");
            router.replace("/");
        }
    }, [status, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email) {
            setError("Please enter your email");
            return;
        }

        try {
            await api.post("/api/auth/login", { email, password });
            setAuth({ email });
            router.replace("/");
        } catch (err) {
            console.error("❌ Login failed:", err);
            setError("Invalid email or password. Please try again.");
        }
    };

    // ✅ Custom Google sign-in handler using direct OAuth flow
    const handleGoogleSignIn = async () => {
        try {
            console.log("🔍 Starting Google sign-in...");
            console.log("📱 Is native platform:", Capacitor.isNativePlatform());
            
            // Build OAuth URL for both mobile and web
            const oauthUrl = `https://accounts.google.com/oauth/authorize?` +
                `client_id=375010610176-rf9ajtm5ut8r5oauel8dg5c50qqpjmrv.apps.googleusercontent.com&` +
                `redirect_uri=${encodeURIComponent('https://cardscope-web.vercel.app/auth/callback')}&` +
                `response_type=code&` +
                `scope=openid%20email%20profile&` +
                `access_type=offline`;
            
            console.log("📱 OAuth URL:", oauthUrl);
            
            if (Capacitor.isNativePlatform()) {
                // For mobile, use Capacitor Browser to open OAuth in-app
                try {
                    // Check if Browser is available on window object (Capacitor runtime)
                    if (typeof window !== 'undefined' && (window as any).Capacitor?.Plugins?.Browser) {
                        const { Browser } = (window as any).Capacitor.Plugins;
                        await Browser.open({ 
                            url: oauthUrl,
                            windowName: '_self'
                        });
                        
                        // Listen for browser close event
                        Browser.addListener('browserFinished', () => {
                            console.log("📱 Browser closed, checking auth status");
                            // Refresh the page to check if user is now authenticated
                            window.location.reload();
                        });
                    } else {
                        throw new Error("Browser module not available");
                    }
                    
                } catch (browserError) {
                    console.log("📱 Browser plugin not available, falling back to window.open");
                    window.open(oauthUrl, '_self');
                }
            } else {
                // For web, redirect directly to OAuth
                window.location.href = oauthUrl;
            }
        } catch (err) {
            console.error("❌ Google sign-in failed:", err);
            setError("Google sign-in failed. Please try again.");
        }
    };

    if (status === "loading") {
        console.log("🔄 Session status: loading");
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-3 text-gray-500">
                <img
                    src="/spinner.svg"
                    alt="Loading"
                    className="w-8 h-8 animate-spin"
                />
                <p>Checking your session...</p>
            </div>
        );
    }

    if (status === "authenticated") {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                Redirecting to your dashboard...
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6 sm:p-8 space-y-6">
                <h1 className="text-center text-xl font-bold">🔑 Login</h1>

                {error && <p className="text-red-600 text-sm text-center">{error}</p>}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <div className="text-right mt-1">
                            <button
                                type="button"
                                onClick={() => router.push("/reset")}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Forgot password?
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full">
                        Login
                    </button>
                </form>

                <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-gray-200" />
                    <span className="mx-2 text-gray-400 text-sm">or</span>
                    <div className="flex-grow border-t border-gray-200" />
                </div>

                {/* ✅ Google Sign-In (adaptive for web/app) */}
                <button
                    onClick={handleGoogleSignIn}
                    className="flex items-center justify-center w-full border border-gray-300 rounded-lg py-2 hover:bg-gray-50 transition"
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="h-5 w-5 mr-2"
                    />
                    Continue with Google
                </button>

                <div className="text-center mt-4">
                    <p className="text-sm">
                        New user?{" "}
                        <button
                            onClick={() => router.push("/signup")}
                            className="text-blue-600 hover:underline"
                        >
                            Sign up here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
