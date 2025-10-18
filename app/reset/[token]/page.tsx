"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "../../../lib/api";

export default function ResetPasswordConfirm() {
    const router = useRouter();
    const { token } = useParams();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus("❌ Passwords do not match.");
            return;
        }

        try {
            const res = await api.post("/api/auth/reset/confirm", {
                token,
                newPassword: password,
            });

            if (res.status === 200) {
                setStatus("✅ Password successfully reset!");
                setTimeout(() => router.push("/login"), 3000);
            }
        } catch (err: any) {
            console.error("Reset failed:", err);
            setStatus("❌ Invalid or expired token.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6 sm:p-8 space-y-6">
                <h1 className="text-center text-xl font-bold">🔑 Set New Password</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                        </label>
                        <input
                            type="password"
                            className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full">
                        Reset Password
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
