"use client";
import { motion } from "framer-motion";

function TipBanner({ text }: { text: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="p-4 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md text-center"
        >
            {text}
        </motion.div>
    );
}

export default TipBanner;
