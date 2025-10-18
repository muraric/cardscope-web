import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SessionProviderWrapper from "../components/SessionProviderWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "CardScope",
    description: "CardScope — your personalized credit card rewards advisor",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable}>
        <body className="font-sans bg-gray-50 text-gray-900 antialiased">
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
        </body>
        </html>
    );
}
