"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../lib/api";
import { setAuth } from "../../lib/auth";
import { Capacitor } from "@capacitor/core";

export default function Login() {
    const router = useRouter();
    const { user, isLoading } = useAuth();
    const redirected = useRef(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // ✅ Redirect once after successful login
    useEffect(() => {
        if (user && !isLoading && !redirected.current) {
            redirected.current = true;
            console.log("✅ Login success → redirecting to /");
            router.replace("/");
        }
    }, [user, isLoading, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email) {
            setError("Please enter your email");
            return;
        }

        try {
            const response = await api.post("/api/auth/login", { email, password });
            
            // Create user object compatible with our AuthContext
            const userData = {
                id: email, // Use email as ID for manual login
                name: response.data?.name || email.split('@')[0], // Use name from response or email prefix
                email: email,
                picture: null // No picture for manual login
            };
            
            // Store in localStorage for AuthContext
            localStorage.setItem('cardscope_user', JSON.stringify(userData));
            console.log("✅ Stored user in localStorage:", userData);
            
            // Trigger auth update event multiple times to ensure it's caught
            window.dispatchEvent(new Event('authUpdated'));
            
            // Give React time to process the state update
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Trigger again to be safe
            window.dispatchEvent(new Event('authUpdated'));
            
            console.log("✅ Manual login successful:", email);
            
            // Use window.location for a hard redirect to ensure clean state
            window.location.href = '/';
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
            const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
                `client_id=488875684334-urrslagsla2btuuri02acrunqum7d2bk.apps.googleusercontent.com&` +
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
                            
                            // Check localStorage for user data periodically
                            const checkAuth = setInterval(() => {
                                const storedUser = localStorage.getItem('cardscope_user');
                                console.log("📱 Checking localStorage for user data...");
                                
                                if (storedUser) {
                                    console.log("✅ User data found in localStorage!");
                                    clearInterval(checkAuth);
                                    window.location.reload();
                                }
                            }, 500);
                            
                            // Stop checking after 10 seconds
                            setTimeout(() => {
                                clearInterval(checkAuth);
                                console.log("⏰ Stopped checking for auth data");
                            }, 10000);
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

    if (isLoading) {
        console.log("🔄 Auth status: loading");
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

    if (user) {
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
