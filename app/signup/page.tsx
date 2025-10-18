"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react"; // 👈 added for Google signup
import api from "../../lib/api";
import { setAuth } from "../../lib/auth";

export default function Signup() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

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
                setAuth({ email });
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
                    onClick={() => signIn("google", { callbackUrl: "/settings" })}
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
