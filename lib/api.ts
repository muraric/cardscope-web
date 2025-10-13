import axios from "axios";

// Dynamically pick backend URL based on environment
const getApiBaseUrl = () => {
    if (typeof window === "undefined") {
        // Server-side (during SSR or build)
        return process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
    }

    const hostname = window.location.hostname;

    // If accessed from local dev or emulator
    if (hostname === "localhost" || hostname === "127.0.0.1") {
        return process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
    }

    // If using Android/iOS simulator (special localhost mappings)
    if (hostname.includes("10.0.2.2")) {
        // Android emulator loopback
        return "http://10.0.2.2:8080";
    }

    if (hostname.includes("192.168.") || hostname.includes("172.")) {
        // Local LAN access (for mobile devices)
        return `http://${hostname}:8080`;
    }

    // Fallback to production URL
    return process.env.NEXT_PUBLIC_API_BASE || "https://your-production-api.com";
};

const API_BASE = getApiBaseUrl();
console.log("API Base URL →", API_BASE);

// Create axios instance
const api = axios.create({
    baseURL: API_BASE,
    headers: { "Content-Type": "application/json" },
});

// Optional interceptors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;
