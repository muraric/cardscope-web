"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";

export default function ResetPassword() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("");
    const router = useRouter();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("Sending reset link...");

        try {
            const res = await api.post("/api/auth/reset", { email });

            if (res.status === 200) {
                setStatus("✅ Password reset link sent to your email!");
                setTimeout(() => router.push("/login"), 3000);
            }
        } catch (err: any) {
            console.error("Reset failed:", err);
            setStatus("❌ Could not send reset link. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6 sm:p-8 space-y-6">
                <h1 className="text-center text-xl font-bold">🔒 Reset Password</h1>

                <form onSubmit={handleReset} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                    >
                        Send Reset Link
                    </button>
                </form>

                {status && <p className="text-sm text-center mt-2">{status}</p>}

                <div className="text-center text-sm mt-4">
                    <button
                        className="text-blue-600 hover:underline"
                        onClick={() => router.push("/login")}
                    >
                        ← Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
}
