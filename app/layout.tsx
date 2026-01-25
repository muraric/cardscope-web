import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "../contexts/AuthContext";
import AppUrlListener from "../components/AppUrlListener";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "CardScope",
    description: "CardScope — your personalized credit card rewards advisor",
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="font-sans bg-gray-50 text-gray-900 antialiased">
                <AuthProvider>
                    <AppUrlListener />
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
