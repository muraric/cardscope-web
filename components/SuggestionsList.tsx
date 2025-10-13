"use client";
import { motion } from "framer-motion";

function SuggestionsList({ suggestions }: { suggestions: any[] }) {
    return (
        <div className="space-y-3 sm:space-y-4">
            {suggestions.map((card, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className="p-3 sm:p-4 rounded-lg shadow bg-white border border-gray-100 hover:shadow-md transition"
                >
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                        {card.card_name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                        <span className="font-medium">Reward:</span> {card.expected_reward}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        {card.reasoning}
                    </p>
                </motion.div>
            ))}
        </div>
    );
}

export default SuggestionsList;
