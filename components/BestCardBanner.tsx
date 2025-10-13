"use client";
import { motion } from "framer-motion";

interface BestCardBannerProps {
    card: {
        card_name: string;
        expected_reward: string;
        reasoning?: string;
        category?: string;
        store?: string;
        currentQuarter?: string;
    };
}

function BestCardBanner({ card }: BestCardBannerProps) {
    // Extract values safely
    const category = card?.category?.toLowerCase?.() || "";
    const store = card?.store || "";
    const quarter = card?.currentQuarter || "";
    const cardName = card?.card_name || "Your Card";

    // Choose emoji and tone dynamically
    let emoji = "💳";
    let tone = "smart saver";

    if (category.includes("grocery") || category.includes("supermarket")) {
        emoji = "🛒";
        tone = "smart shopper";
    } else if (category.includes("dining") || category.includes("restaurant")) {
        emoji = "🍽️";
        tone = "foodie";
    } else if (category.includes("travel") || category.includes("airline")) {
        emoji = "✈️";
        tone = "travel enthusiast";
    } else if (category.includes("gas") || category.includes("fuel")) {
        emoji = "⛽";
        tone = "road tripper";
    } else if (category.includes("online") || category.includes("amazon")) {
        emoji = "🛍️";
        tone = "online shopper";
    } else if (category.includes("entertainment") || category.includes("stream")) {
        emoji = "🎬";
        tone = "entertainment lover";
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            // 🎨 auto light/dark gradient for readability
            className="
                p-4 sm:p-6 rounded-xl
                bg-gradient-to-r from-blue-100 via-blue-200 to-indigo-100
                dark:from-blue-700 dark:via-indigo-800 dark:to-gray-900
                text-gray-900 dark:text-gray-100
                border border-blue-200 dark:border-indigo-700
                shadow-md dark:shadow-lg
            "
        >
            <h2 className="text-base sm:text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">
                ⭐ Best Card Recommendation
            </h2>

            <h3 className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100">
                {cardName}
            </h3>

            <p className="mt-2 text-sm sm:text-lg font-medium text-gray-800 dark:text-gray-200">
                Reward: {card.expected_reward}
            </p>

            {card.reasoning && (
                <p className="mt-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    {card.reasoning}
                </p>
            )}

            {/* Personalized dynamic message */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="
                    mt-4
                    bg-white/60 dark:bg-white/10
                    backdrop-blur-md rounded-lg p-3 sm:p-4
                    shadow-inner
                "
            >
                <p className="text-sm sm:text-base leading-relaxed text-gray-800 dark:text-gray-200">
                    {emoji} Hey {tone}!{" "}
                    <strong className="text-blue-800 dark:text-blue-300">{cardName}</strong>{" "}
                    is your top pick right now, earning{" "}
                    <strong className="text-blue-700 dark:text-blue-300">
                        {card.expected_reward}
                    </strong>
                    {store && (
                        <>
                            {" "}
                            at{" "}
                            <strong className="text-blue-700 dark:text-blue-300">
                                {store}
                            </strong>
                        </>
                    )}
                    {quarter && (
                        <>
                            {" "}
                            during{" "}
                            <strong className="text-blue-700 dark:text-blue-300">
                                {quarter}
                            </strong>
                        </>
                    )}
                    . Keep using it for maximum rewards! 💸
                </p>

                {category && (
                    <p className="text-xs sm:text-sm mt-2 text-blue-700 dark:text-blue-300 italic">
                        Because this merchant falls under{" "}
                        <strong className="capitalize">{category}</strong>, your rewards
                        potential is higher than usual.
                    </p>
                )}
            </motion.div>
        </motion.div>
    );
}

export default BestCardBanner;
