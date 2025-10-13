"use client";

import {useRouter} from "next/navigation";
import {clearAuth, getAuth} from "../lib/auth";

export default function Header() {
    const router = useRouter();
    const {email} = getAuth();

    const handleSignOut = () => {
        clearAuth();
        router.push("/login");
    };

    return (
        <header style={{paddingTop: "60px"}}
            // className="safe-area flex justify-between items-center py-4 border-b bg-white z-50">
                className="pt-safe-plus bg-white border-b shadow-sm grid grid-cols-3 items-center px-4">
            <h1
                className="text-xl font-bold cursor-pointer"
                onClick={() => router.push("/")}
            >
                💳 Credit Card Advisor
            </h1>
            <div className="flex items-center gap-4">
                {email && <span className="text-sm text-gray-600">{email}</span>}
                {email ? (
                    <button
                        onClick={handleSignOut}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Sign Out
                    </button>
                ) : (
                    <button
                        onClick={() => router.push("/login")}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Login
                    </button>
                )}
            </div>
        </header>
    );
}
