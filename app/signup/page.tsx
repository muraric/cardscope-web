"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import { Capacitor } from "@capacitor/core";

export default function Signup() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // Google OAuth handler for signup
    const handleGoogleSignUp = async () => {
        try {
            console.log("🔍 Starting Google sign-up...");
            console.log("📱 Is native platform:", Capacitor.isNativePlatform());
            
            // Build OAuth URL for both mobile and web
            // Use localhost callback for dev, Vercel for production
            const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const redirectUri = isDev 
                ? 'http://localhost:3000/auth/callback'
                : 'https://cardscope-web.vercel.app/auth/callback';
            
            const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
                `client_id=488875684334-urrslagsla2btuuri02acrunqum7d2bk.apps.googleusercontent.com&` +
                `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                `response_type=code&` +
                `scope=openid%20email%20profile&` +
                `access_type=offline`;
            
            console.log("📱 OAuth URL:", oauthUrl);
            
            if (Capacitor.isNativePlatform()) {
                // For mobile iOS, redirect WebView to OAuth URL
                // The callback will redirect back to cardscope:// scheme
                console.log("📱 Navigating WebView to OAuth URL");
                window.location.href = oauthUrl;
            } else {
                // For web, redirect directly to OAuth
                window.location.href = oauthUrl;
            }
        } catch (err) {
            console.error("❌ Google sign-up failed:", err);
            setError("Google sign-up failed. Please try again.");
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name || !email || !password) {
            setError("Please fill all required fields");
            return;
        }

        try {
            const res = await api.post("/api/auth/signup", {
                name,
                email,
                password: password, // ⚡ Backend will hash this properly
            });

            if (res.status === 200) {
                // Create user object compatible with our AuthContext
                const userData = {
                    id: email, // Use email as ID for manual signup
                    name: name,
                    email: email,
                    picture: null // No picture for manual signup
                };
                
                // Store in localStorage for AuthContext
                localStorage.setItem('cardscope_user', JSON.stringify(userData));
                
                // Trigger auth update event
                window.dispatchEvent(new Event('authUpdated'));
                
                console.log("✅ Manual signup successful:", email);
                router.push("/settings");
            }
        } catch (err: any) {
            console.error("❌ Signup failed:", err);
            setError(err.response?.data?.error || "Signup failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6 sm:p-8 space-y-6">
                <h1 className="text-center text-xl font-bold">📝 Sign Up</h1>

                {error && <p className="text-red-600 text-sm text-center">{error}</p>}

                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="Full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

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
                    </div>

                    <button type="submit" className="btn btn-primary w-full">
                        Sign Up
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-gray-200" />
                    <span className="mx-2 text-gray-400 text-sm">or</span>
                    <div className="flex-grow border-t border-gray-200" />
                </div>

                {/* Google Sign Up button */}
                <button
                    onClick={handleGoogleSignUp}
                    className="flex items-center justify-center w-full border border-gray-300 rounded-lg py-2 hover:bg-gray-50 transition"
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="h-5 w-5 mr-2"
                    />
                    Continue with Google
                </button>

                {/* Existing login link */}
                <div className="text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <button
                        className="text-blue-600 font-medium hover:underline"
                        onClick={() => router.push("/login")}
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
}
