"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import { getAuth } from "../../lib/auth";
import Layout from "../../components/Layout";
import { AnimatePresence, motion } from "framer-motion";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

interface RewardDetails {
    cardReward?: Record<string, any>;
}

interface UserCard {
    issuer: string;
    cardProduct: string;
    rewardDetails: RewardDetails;
}

interface Profile {
    id?: number;
    name: string;
    email: string;
    passwordHash?: string;
    userCards: UserCard[];
}

export default function Settings() {
    const router = useRouter();
    const [email, setEmail] = useState<string | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [issuer, setIssuer] = useState("");
    const [cardProduct, setCardProduct] = useState("");
    const [issuerSuggestions, setIssuerSuggestions] = useState<string[]>([]);
    const [productSuggestions, setProductSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedCard, setExpandedCard] = useState<string | null>(null);

    // ✅ Android StatusBar fix
    useEffect(() => {
        if (Capacitor.getPlatform() === "android") {
            (async () => {
                try {
                    await StatusBar.setOverlaysWebView({ overlay: false });
                    await StatusBar.setStyle({ style: Style.Dark });
                    await StatusBar.setBackgroundColor({ color: "#ffffff" });
                } catch {
                    /* ignore */
                }
            })();
        }
    }, []);

    useEffect(() => {
        const { email: storedEmail } = getAuth();
        if (!storedEmail) {
            router.push("/login");
        } else {
            setEmail(storedEmail);
            fetchProfile(storedEmail);
        }
    }, [router]);

    const fetchProfile = async (email: string) => {
        setLoading(true);
        try {
            const res = await api.get(`/api/user/${encodeURIComponent(email)}`);
            setProfile(res.data);
        } catch (err) {
            console.error("❌ Failed to load profile:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchIssuerSuggestions = async (query: string) => {
        if (!query.trim()) return setIssuerSuggestions([]);
        try {
            const res = await api.get(
                `/api/cards/issuers?search=${encodeURIComponent(query)}`
            );
            setIssuerSuggestions(res.data || []);
        } catch (err) {
            console.error("❌ Failed to fetch issuers:", err);
        }
    };

    const fetchProductSuggestions = async (issuer: string, query: string) => {
        if (!issuer || !query.trim()) return setProductSuggestions([]);
        try {
            const res = await api.get(
                `/api/cards/products?issuer=${encodeURIComponent(
                    issuer
                )}&search=${encodeURIComponent(query)}`
            );
            setProductSuggestions(res.data || []);
        } catch (err) {
            console.error("❌ Failed to fetch products:", err);
        }
    };

    const saveProfile = async () => {
        if (!email || !profile) return;
        setLoading(true);
        try {
            const payload = {
                name: profile.name,
                userCards: profile.userCards.map((uc) => ({
                    issuer: uc.issuer,
                    cardProduct: uc.cardProduct,
                })),
            };
            const res = await api.put(`/api/user/${encodeURIComponent(email)}`, payload);
            setProfile(res.data);
        } catch (err) {
            console.error("❌ Failed to save profile:", err);
        } finally {
            setLoading(false);
        }
    };

    const addCard = () => {
        if (profile && issuer.trim() && cardProduct.trim()) {
            const newCard: UserCard = {
                issuer: issuer.trim(),
                cardProduct: cardProduct.trim(),
                rewardDetails: {},
            };
            setProfile({
                ...profile,
                userCards: [...profile.userCards, newCard],
            });
            setIssuer("");
            setCardProduct("");
            setIssuerSuggestions([]);
            setProductSuggestions([]);
        }
    };

    const removeCard = (idx: number) => {
        if (profile) {
            setProfile({
                ...profile,
                userCards: profile.userCards.filter((_, i) => i !== idx),
            });
        }
    };

    const toggleExpand = (key: string) => {
        setExpandedCard(expandedCard === key ? null : key);
    };

    if (!email) return null;

    return (
        <Layout>
            <div className="max-w-lg mx-auto w-full px-4 space-y-6 pt-safe-plus">
                {loading && <LoadingSpinner />}

                {profile && !loading && (
                    <>
                        {/* Profile Section */}
                        <div className="bg-white shadow rounded-lg p-4 sm:p-6 space-y-4">
                            <h2>👤 Profile</h2>
                            <input
                                className="w-full border p-2 sm:p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                placeholder="Full Name"
                                value={profile.name}
                                onChange={(e) =>
                                    setProfile({ ...profile, name: e.target.value })
                                }
                            />
                            <input
                                className="w-full border p-2 sm:p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                placeholder="Email"
                                value={profile.email}
                                disabled
                            />
                            <button
                                onClick={saveProfile}
                                className="btn btn-success w-full"
                            >
                                Save Profile
                            </button>
                        </div>

                        {/* Cards Section */}
                        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
                            <h2>💳 Manage Cards</h2>

                            {/* Add card form */}
                            <div className="flex flex-col sm:flex-row gap-2 mb-4">
                                {/* Issuer autocomplete */}
                                <div className="relative w-full sm:w-1/2">
                                    <input
                                        className="w-full border p-2 sm:p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                        placeholder="Card Issuer (e.g., Chase, Amex)"
                                        value={issuer}
                                        onChange={(e) => {
                                            setIssuer(e.target.value);
                                            fetchIssuerSuggestions(e.target.value);
                                        }}
                                    />
                                    {issuerSuggestions.length > 0 && (
                                        <ul className="absolute z-10 bg-white border rounded-lg shadow mt-1 max-h-40 overflow-y-auto w-full">
                                            {issuerSuggestions.map((sug, i) => (
                                                <li
                                                    key={i}
                                                    className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-sm"
                                                    onClick={() => {
                                                        setIssuer(sug);
                                                        setIssuerSuggestions([]);
                                                    }}
                                                >
                                                    {sug}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Card product autocomplete */}
                                <div className="relative w-full sm:w-1/2">
                                    <input
                                        className="w-full border p-2 sm:p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                        placeholder="Card Product (e.g., Sapphire Preferred)"
                                        value={cardProduct}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setCardProduct(val);
                                            fetchProductSuggestions(issuer, val);
                                        }}
                                        disabled={!issuer}
                                    />
                                    {productSuggestions.length > 0 && (
                                        <ul className="absolute z-10 bg-white border rounded-lg shadow mt-1 max-h-40 overflow-y-auto w-full">
                                            {productSuggestions.map((prod, i) => (
                                                <li
                                                    key={i}
                                                    className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-sm"
                                                    onClick={() => {
                                                        setCardProduct(prod);
                                                        setProductSuggestions([]);
                                                    }}
                                                >
                                                    {prod}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <button
                                    onClick={addCard}
                                    className="btn btn-primary w-full sm:w-auto"
                                >
                                    Add
                                </button>
                            </div>

                            {/* Existing cards list */}
                            <ul className="space-y-2 sm:space-y-3">
                                <AnimatePresence>
                                    {profile.userCards.map((uc, idx) => {
                                        const reward = uc.rewardDetails?.cardReward;
                                        const cardKey = `${uc.issuer}-${uc.cardProduct}-${idx}`;

                                        return (
                                            <motion.li
                                                key={cardKey}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className="bg-gray-50 border rounded-lg p-3 sm:p-4"
                                            >
                                                <div
                                                    className="flex justify-between items-center cursor-pointer"
                                                    onClick={() => toggleExpand(cardKey)}
                                                >
                          <span className="text-sm sm:text-base font-medium">
                            {uc.issuer} {uc.cardProduct}
                          </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeCard(idx);
                                                        }}
                                                        className="btn btn-danger text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>

                                                {/* Reward details expanded */}
                                                {expandedCard === cardKey && reward && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="mt-3 text-sm bg-white border rounded-lg p-3 space-y-2"
                                                    >
                                                        <p><strong>Base Rate:</strong> {reward.base_rate}</p>
                                                        {reward.bonus_categories?.length > 0 && (
                                                            <div>
                                                                <strong>Bonus Categories:</strong>
                                                                <ul className="list-disc pl-5">
                                                                    {reward.bonus_categories.map((b: any, i: number) => (
                                                                        <li key={i}>
                                                                            {b.category} — {b.rate}
                                                                            {b.cap && <span> (Cap: {b.cap})</span>}
                                                                            {b.after_cap_rate && (
                                                                                <span>, After Cap: {b.after_cap_rate}</span>
                                                                    )}
                                                                    {b.exclusions?.length > 0 && (
                                                                        <span> | Exclusions: {b.exclusions.join(", ")}</span>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    </div>
                                                    )}
                                                {reward.user_choice_categories?.length > 0 && (
                                                    <div>
                                                        <strong>User Choice Categories:</strong>
                                                        <ul className="list-disc pl-5">
                                                            {reward.user_choice_categories.map((u: any, i: number) => (
                                                                <li key={i}>
                                                                    {u.rate} on {u.options.join(", ")}{" "}
                                                                    {u.notes && `(${u.notes})`}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {reward.rotating_categories && (
                                                    <div>
                                                        <strong>Rotating Categories:</strong>
                                                        {Object.entries(reward.rotating_categories as Record<string, any[]>).map(
                                                            ([quarter, cats]: [string, any[]]) =>
                                                                cats.length > 0 && (
                                                                    <div key={quarter} className="mt-1">
                                                                        <p className="font-semibold">{quarter}</p>
                                                                        <ul className="list-disc pl-5">
                                                                            {cats.map((c, i) => (
                                                                                <li key={i}>
                                                                                    {c.category} — {c.rate}
                                                                                    {c.notes && ` (${c.notes})`}
                                                                                    {c.exclusions?.length > 0 && (
                                                                                        <span>
                                                  {" "} | Exclusions: {c.exclusions.join(", ")}
                                                </span>
                                                                                    )}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )
                                                        )}
                                                    </div>
                                                )}
                                                {reward.redeem_as && (
                                                    <p><strong>Redeem As:</strong> {reward.redeem_as}</p>
                                                )}
                                                {reward.annual_fee && (
                                                    <p>
                                                        <strong>Annual Fee:</strong>{" "}
                                                        {reward.annual_fee.first_year} (Then{" "}
                                                        {reward.annual_fee.thereafter})
                                                    </p>
                                                )}
                                                {reward.notes && (
                                                    <p className="italic text-gray-600">{reward.notes}</p>
                                                )}
                                            </motion.div>
                                        )}
                                    </motion.li>
                                    );
                                    })}
                                </AnimatePresence>
                            </ul>

                            <button
                                onClick={saveProfile}
                                className="btn btn-success w-full mt-4"
                            >
                                Save Cards
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
}
