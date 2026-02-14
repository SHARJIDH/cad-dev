import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { LayoutShell } from "@/components/layout-shell";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "ArcForge — AI Design Studio",
    description:
        "Transform your ideas into reality with AI-powered design tools. Create, visualize, and refine your projects with intelligent assistance.",
    icons: {
        icon: [
            { url: "/logo.svg", type: "image/svg+xml" },
            { url: "/favicon.ico" },
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
        <ClerkProvider>
            <html lang="en" suppressHydrationWarning>
                <body className={`${inter.className} min-h-screen bg-background`}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        forcedTheme="light"
                    >
                        <Providers>
                            <LayoutShell>{children}</LayoutShell>
                            <Toaster />
                        </Providers>
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
