import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "DesignCraft AI - Intelligent Design Studio",
    description:
        "Transform your ideas into reality with AI-powered design tools. Create, visualize, and refine your projects with intelligent assistance.",
    icons: {
        icon: [
            { url: "/logo.svg", type: "image/svg+xml" }, // Add SVG logo as primary favicon
            { url: "/favicon.ico" }, // Keep .ico as fallback for older browsers
            { url: "/icon.png", type: "image/png", sizes: "32x32" },
            { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
            { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
        ],
        apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} min-h-screen bg-background`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    forcedTheme="light"
                >
                    <Providers>
                        <div className="flex h-screen overflow-hidden">
                            <Sidebar />
                            <div className="flex flex-col flex-1 w-0 overflow-hidden">
                                <Header />
                                <main className="relative flex-1 overflow-y-auto focus:outline-none">
                                    {children}
                                </main>
                            </div>
                        </div>
                        <Toaster />
                    </Providers>
                </ThemeProvider>
            </body>
        </html>
    );
}
