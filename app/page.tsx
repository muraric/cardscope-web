"use client";
export const dynamic = "force-dynamic";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useAuth} from "../contexts/AuthContext";
import Layout from "../components/Layout";
import SuggestionsList from "../components/SuggestionsList";
import BestCardBanner from "../components/BestCardBanner";
import LoadingSpinner from "../components/LoadingSpinner";
import TipBanner from "../components/TipBanner";
import api from "../lib/api";
import {getAuth} from "../lib/auth";
import {Capacitor} from "@capacitor/core";
import {StatusBar, Style} from "@capacitor/status-bar";

type Suggestion = {
    card_name: string;
    expected_reward: string;
    reasoning: string;
};

type StoreInfo = {
    name: string;
    category: string;
};

export default function Suggestions() {
    const router = useRouter();
    const {user, isLoading} = useAuth();

    // Auth
    const [email, setEmail] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("there");
    const [hasCards, setHasCards] = useState<boolean>(true); // default true until checked

    // UI
    const [storeInput, setStoreInput] = useState("");
    const [storeOptions, setStoreOptions] = useState<StoreInfo[]>([]);
    const [showModal, setShowModal] = useState(false);

    // Data
    const [detectedStore, setDetectedStore] = useState<string | null>(null);
    const [category, setCategory] = useState<string | null>(null);
    const [currentQuarter, setCurrentQuarter] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [bestCard, setBestCard] = useState<Suggestion | null>(null);

    // UX
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState<string | null>(null);

    // Status bar (keep Capacitor intact)
    useEffect(() => {
        const run = async () => {
            try {
                if (!Capacitor.isNativePlatform()) return;
                const platform = Capacitor.getPlatform();
                
                if (platform === "android") {
                    await StatusBar.setOverlaysWebView({overlay: false});
                    await StatusBar.setStyle({style: Style.Dark});
                    await StatusBar.setBackgroundColor({color: "#ffffff"});
                } else if (platform === "ios") {
                    await StatusBar.setOverlaysWebView({overlay: false});
                    await StatusBar.setStyle({style: Style.Light});
                }
            } catch {
                /* ignore */
            }
        };
        run();
    }, []);

    // Unified auth guard
    useEffect(() => {
        console.log("🔍 Page.tsx - Auth check - isLoading:", isLoading, "user:", user);
        
        if (isLoading) {
            console.log("⏳ Still loading, waiting...");
            return;
        }

        if (!user) {
            // Try to get user from URL parameters (for OAuth deep link)
            const urlParams = new URLSearchParams(window.location.search);
            const status = urlParams.get('status');
            const userDataParam = urlParams.get('userData');
            
            console.log("📱 Checking URL params - status:", status, "userData:", userDataParam ? "exists" : "none");
            
            if (status === 'success' && userDataParam) {
                try {
                    const userData = JSON.parse(decodeURIComponent(userDataParam));
                    console.log("✅ Found user data in URL, storing...", userData);
                    localStorage.setItem('cardscope_user', JSON.stringify(userData));
                    window.dispatchEvent(new Event('authUpdated'));
                    // Refresh to trigger auth check again
                    window.location.href = '/';
                    return;
                } catch (error) {
                    console.error("❌ Failed to parse user data from URL:", error);
                }
            }
            
            console.log("❌ No auth found, redirecting to login");
            router.push("/login");
            return;
        }

        console.log("✅ Auth found in page.tsx:", user.email, "name:", user.name);
        setEmail(user.email);
        setUserName(user.name || "there");
    }, [isLoading, user, router]);

    // Fetch profile (name + hasCards)
    useEffect(() => {
        if (!email) return;

        (async () => {
            try {
                const emailParam = encodeURIComponent(email);
                const res = await api.get(`/api/user/${emailParam}`);
                const fetchedName = res.data?.name;
                const userCards = Array.isArray(res.data?.userCards) ? res.data.userCards : [];
                setHasCards(userCards.length > 0);

                if (fetchedName) {
                    const formatted = fetchedName
                        .split(" ")
                        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                        .join(" ");
                    setUserName(formatted);
                }
            } catch (err) {
                console.error("❌ Failed to load profile/name:", err);
            }
        })();
    }, [email]);

    // Helpers
    const applyResponse = (data: any) => {
        const returnedStore = data?.store ?? null;
        const returnedCategory = data?.category ?? null;
        const returnedQuarter = data?.currentQuarter ?? null;
        const list: Suggestion[] = Array.isArray(data?.suggestions) ? data.suggestions : [];

        setDetectedStore(returnedStore);
        setCategory(returnedCategory);
        setCurrentQuarter(returnedQuarter);
        setSuggestions(list);
        setBestCard(list.length > 0 ? list[0] : null);

        if (returnedStore) setStoreInput(returnedStore);
    };

    // Actions
    const ensureHasCards = () => {
        if (!hasCards) {
            setErrMsg("Please add cards in Settings before getting suggestions.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (storeName: string, cat?: string) => {
        if (!email) return;
        if (!ensureHasCards()) return;
        if (!storeName.trim()) {
            setErrMsg("Please Enter store name");
            return;
        }

        setErrMsg(null);
        setLoading(true);

        const start = Date.now();
        try {
            const res = await api.post("/api/get-card-suggestions", {
                email,
                store: storeName.trim(),
                category: cat || "general",
            });
            applyResponse(res.data);
        } catch (err: any) {
            console.error("❌ Suggestion error:", err);
            setErrMsg("Failed to get suggestions. Please try again.");
        } finally {
            const elapsed = Date.now() - start;
            const remaining = 1000 - elapsed;
            if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
            setLoading(false);
            setShowModal(false);
        }
    };

    const handleDetectStore = async () => {
        if (!email) return;
        if (!ensureHasCards()) return;

        const isNative = Capacitor.isNativePlatform();
        let latitude: number, longitude: number;

        setErrMsg(null);
        setLoading(true);

        try {
            if (isNative) {
                // Use Capacitor Geolocation plugin for native apps
                const {Geolocation} = await import('@capacitor/geolocation');
                
                console.log("📱 Requesting location permissions on native platform...");
                const permissions = await Geolocation.checkPermissions();
                
                if (permissions.location !== 'granted') {
                    console.log("📱 Location not granted, requesting...");
                    const requestResult = await Geolocation.requestPermissions();
                    
                    if (requestResult.location !== 'granted') {
                        setLoading(false);
                        setErrMsg("Location permission is required to detect nearby stores. Please enable it in your device settings.");
                        return;
                    }
                }
                
                console.log("📱 Getting current position...");
                const position = await Geolocation.getCurrentPosition({timeout: 10000});
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
                console.log("📍 Got position:", latitude, longitude);
            } else {
                // Use browser geolocation for web
                if (!navigator.geolocation) {
                    setErrMsg("Geolocation is not supported by your browser.");
                    setLoading(false);
                    return;
                }

                console.log("🌐 Requesting geolocation from browser...");
                const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        timeout: 10000,
                        enableHighAccuracy: true
                    });
                });
                
                latitude = pos.coords.latitude;
                longitude = pos.coords.longitude;
                console.log("📍 Got position:", latitude, longitude);
            }

            // Fetch stores from API
            console.log("🏬 Fetching nearby stores...");
            const res = await api.get("/api/google/detect-stores-v1", {
                params: {latitude, longitude},
            });

            let stores: StoreInfo[] = [];
            if (res.data?.stores?.places && Array.isArray(res.data.stores.places)) {
                stores = res.data.stores.places.map((p: any) => ({
                    name: p.displayName?.text || "Unknown",
                    category: p.primaryType || "general",
                }));
            } else if (Array.isArray(res.data?.stores)) {
                stores = res.data.stores.map((s: any) => ({
                    name: s.name,
                    category: s.category,
                }));
            }

            if (stores.length === 0) {
                await handleSubmit("Unknown Store", "general");
            } else {
                setStoreOptions(stores);
                setShowModal(true);
            }
        } catch (err: any) {
            console.error("❌ Location error:", err);
            setLoading(false);
            
            if (err.message?.includes('denied') || err.code === 1) {
                setErrMsg("Location access denied. Please enable location services in your device settings.");
            } else if (err.message?.includes('timeout') || err.code === 3) {
                setErrMsg("Location request timed out. Please try again.");
            } else if (err.message?.includes('unavailable')) {
                setErrMsg("Location services are unavailable. Please try again later.");
            } else {
                setErrMsg("Unable to get your location. Please check your device settings.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Force redirect to login after timeout if still loading
    useEffect(() => {
        if (!isLoading) return;
        
        const timer = setTimeout(() => {
            console.log('⏱️ Auth check timeout, redirecting to login');
            if (!user) {
                router.push('/login');
            }
        }, 3000); // 3 second timeout
        
        return () => clearTimeout(timer);
    }, [isLoading, user, router]);

    // Show nothing while verifying auth
    if (isLoading || (!email && !user)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-3">
                <LoadingSpinner />
                <p className="text-gray-500 text-sm">Checking authentication...</p>
            </div>
        );
    }

    // If truly unauthenticated, redirect to login
    if (!user) {
        console.log('❌ No user found, redirecting to login');
        router.push('/login');
        return null;
    }

    const getCategoryColor = (cat: string | null) => {
        const normalized = cat ? cat.toLowerCase() : "";
        switch (normalized) {
            case "groceries":
                return "text-green-600";
            case "online":
                return "text-blue-600";
            case "department_store":
                return "text-purple-600";
            case "dining":
            case "restaurant":
                return "text-orange-600";
            case "travel":
                return "text-indigo-600";
            default:
                return "text-gray-600";
        }
    };

    const hour = new Date().getHours();
    let greeting = "Hello";
    let emoji = "💡";
    if (hour < 12) {
        greeting = "Good morning";
        emoji = "🌅";
    } else if (hour < 18) {
        greeting = "Good afternoon";
        emoji = "🌇";
    } else {
        greeting = "Good evening";
        emoji = "🌙";
    }

    return (
        <Layout>
            <div className="max-w-lg mx-auto w-full px-4 space-y-6 pt-safe-plus">
                <div className="space-y-1 mb-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                        {emoji} {greeting}, {userName}!
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600">
                        Let’s find the{" "}
                        <span className="font-medium text-blue-600">best credit card</span>{" "}
                        for your next purchase — personalized just for you.
                    </p>
                </div>

                <button
                    onClick={handleDetectStore}
                    className="btn btn-primary w-full"
                    disabled={loading}
                >
                    📍 Detect My Store & Get Suggestions
                </button>

                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <input
                        className="flex-1 border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter store name (e.g. Walmart, Patel Brothers)"
                        value={storeInput}
                        onChange={(e) => setStoreInput(e.target.value)}
                    />
                    <button
                        onClick={() => handleSubmit(storeInput, "general")}
                        className="btn btn-primary w-full sm:w-auto"
                    >
                        Get Suggestions
                    </button>
                </div>

                {/*<TipBanner text="Pro Tip: Add your cards in Settings to get more accurate recommendations."/>*/}

                {errMsg && (
                    <div className="flex flex-col items-center p-5 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-center shadow-sm space-y-2">
                        <div className="text-3xl">⚠️</div>
                        <div>
                            <p className="font-semibold mb-1">
                                {errMsg.includes("Please Enter store name") ? "Store name required" : 
                                 errMsg.includes("add cards") ? "Add cards to get started" :
                                 errMsg.includes("Geolocation") || errMsg.includes("location") ? "Location access needed" :
                                 "Action required"}
                            </p>
                            <p className="text-sm">{errMsg}</p>
                        </div>
                        {errMsg.includes("add cards") ? (
                            <button
                                onClick={() => router.push("/settings")}
                                className="btn btn-primary w-full sm:w-auto"
                            >
                                Go to Settings
                            </button>
                        ) : errMsg.includes("location") || errMsg.includes("Geolocation") ? (
                            <button
                                onClick={() => handleDetectStore()}
                                className="btn btn-primary w-full sm:w-auto"
                            >
                                Try Again
                            </button>
                        ) : null}
                    </div>
                )}


                {loading && <LoadingSpinner/>}

                {!loading && detectedStore && (
                    <div className="p-4 rounded-lg bg-gray-100 border text-sm text-gray-700 space-y-1">
                        <div>
                            🏬 Store: <span className="font-medium">{detectedStore}</span>
                        </div>
                        {category && (
                            <div>
                                🏷️ Category:{" "}
                                <span className={`capitalize font-medium ${getCategoryColor(category)}`}>
                  {category}
                </span>
                            </div>
                        )}
                        {currentQuarter && (
                            <div>
                                📅 Current Quarter: <span className="font-medium">{currentQuarter}</span>
                            </div>
                        )}
                    </div>
                )}

                {!loading && bestCard && <BestCardBanner card={bestCard}/>}

                {!loading && suggestions.length > 0 && (
                    <SuggestionsList suggestions={suggestions}/>
                )}
            </div>

            {showModal && storeOptions.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 text-center">
                            Select your store
                        </h2>
                        <ul className="space-y-2">
                            {storeOptions.map((s, idx) => (
                                <li key={idx}>
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            setLoading(true);
                                            setTimeout(() => handleSubmit(s.name, s.category), 100);
                                        }}
                                        className="w-full text-left px-4 py-2 border rounded-lg hover:bg-gray-50"
                                    >
                                        {s.name}{" "}
                                        <span
                                            className={`text-xs font-medium ml-1 ${getCategoryColor(
                                                s.category
                                            )}`}
                                        >
                      ({s.category})
                    </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setShowModal(false)} className="btn btn-danger w-full mt-4">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </Layout>
    );
}
