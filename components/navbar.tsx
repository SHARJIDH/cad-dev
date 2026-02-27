"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    SignedIn,
    SignedOut,
    SignInButton,
    UserButton,
} from "@clerk/nextjs";
import {
    Navbar,
    NavBody,
    NavItems,
    MobileNav,
    MobileNavHeader,
    MobileNavMenu,
    MobileNavToggle,
    NavbarButton,
} from "@/components/ui/resizable-navbar";
import { Wand2, Bell, Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ModeToggle } from "@/components/mode-toggle";

const navItems = [
    { name: "Dashboard", link: "/dashboard" },
    { name: "Projects", link: "/projects" },
    { name: "Interior Designer", link: "/interior-designer" },
    { name: "CAD Generator", link: "/cad-generator" },
    { name: "Settings", link: "/settings" },
];

export function AppNavbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleNotificationClick = () => {
        router.push('/settings?tab=notifications');
    };

    const handleInteriorDesignerClick = () => {
        // Clear any existing model from localStorage to ensure fresh start
        localStorage.removeItem('currentModel');
        // Navigate to interior designer for a fresh design session
        router.push('/interior-designer');
    };

    return (
        <Navbar className="top-0">
            {/* Desktop Nav */}
            <NavBody className="border border-orange-200/60 dark:border-dark-border dark:bg-dark-surface/95">
                {/* Logo */}
                <Link
                    href="/dashboard"
                    className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1"
                >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                        <Wand2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 bg-clip-text text-transparent tracking-tight">
                        DesignForge
                    </span>
                </Link>

                {/* Nav Items */}
                <NavItems items={navItems} onSpecialClick={handleInteriorDesignerClick} />

                {/* Right Side — Theme Toggle + Notifications + Auth */}
                <div className="relative z-20 flex items-center gap-2">
                    <ModeToggle />
                    
                    <button 
                        onClick={handleNotificationClick}
                        className="relative p-2 rounded-full hover:bg-orange-50 dark:hover:bg-dark-accent transition-colors group"
                        title="Notifications"
                    >
                        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors" />
                    </button>

                    <SignedIn>
                        <UserButton
                            afterSignOutUrl="/sign-in"
                            appearance={{
                                elements: {
                                    avatarBox:
                                        "w-8 h-8 ring-2 ring-orange-200 dark:ring-orange-500/30 ring-offset-1",
                                },
                            }}
                        />
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="redirect">
                            <NavbarButton as="button" variant="gradient" className="!bg-gradient-to-r !from-orange-500 !to-amber-500">
                                Sign In
                            </NavbarButton>
                        </SignInButton>
                    </SignedOut>
                </div>
            </NavBody>

            {/* Mobile Nav */}
            <MobileNav className="!bg-white/90 dark:!bg-dark-surface/95">
                <MobileNavHeader>
                    <Link
                        href="/dashboard"
                        className="flex items-center space-x-2"
                    >
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
                            <Wand2 className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 bg-clip-text text-transparent tracking-tight">
                            DesignForge
                        </span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <ModeToggle />
                        <SignedIn>
                            <UserButton
                                afterSignOutUrl="/sign-in"
                                appearance={{
                                    elements: {
                                        avatarBox: "w-7 h-7",
                                    },
                                }}
                            />
                        </SignedIn>
                        <MobileNavToggle
                            isOpen={isMobileMenuOpen}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        />
                    </div>
                </MobileNavHeader>

                <MobileNavMenu
                    isOpen={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                    className="!bg-white dark:!bg-dark-surface"
                >
                    {navItems.map((item) => (
                        item.name === "Interior Designer" ? (
                            <button
                                key={item.name}
                                onClick={() => {
                                    handleInteriorDesignerClick();
                                    setIsMobileMenuOpen(false);
                                }}
                                className={cn(
                                    "w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                                    pathname?.startsWith(item.link)
                                        ? "bg-orange-50 dark:bg-dark-accent text-orange-600 dark:text-orange-400"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-accent hover:text-gray-900 dark:hover:text-gray-200"
                                )}
                            >
                                {item.name}
                            </button>
                        ) : (
                            <Link
                                key={item.link}
                                href={item.link}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    pathname?.startsWith(item.link)
                                        ? "bg-orange-50 dark:bg-dark-accent text-orange-600 dark:text-orange-400"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-accent hover:text-gray-900 dark:hover:text-gray-200"
                                )}
                            >
                                {item.name}
                            </Link>
                        )
                    ))}
                    <SignedOut>
                        <SignInButton mode="redirect">
                            <button className="w-full mt-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                                Sign In
                            </button>
                        </SignInButton>
                    </SignedOut>
                </MobileNavMenu>
            </MobileNav>
        </Navbar>
    );
}
