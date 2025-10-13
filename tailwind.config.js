/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-inter)", "sans-serif"],
            },
            colors: {
                brand: {
                    blue: "#2563eb", // primary
                    green: "#16a34a", // success
                    red: "#dc2626", // danger
                    gray: "#6b7280", // neutral
                },
            },
        },
    },
    plugins: [],
};
