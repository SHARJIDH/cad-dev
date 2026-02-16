"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
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

const navItems = [
    { name: "Dashboard", link: "/dashboard" },
    { name: "Projects", link: "/projects" },
    { name: "CAD Generator", link: "/cad-generator" },
    // { name: "Analytics", link: "/analytics" },
    // { name: "Team", link: "/team" },
    { name: "Settings", link: "/settings" },
];

export function AppNavbar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <Navbar className="top-0">
            {/* Desktop Nav */}
            <NavBody className="border border-gray-200/60">
                {/* Logo */}
                <Link
                    href="/dashboard"
                    className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1"
                >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <Wand2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-purple-600 via-violet-500 to-blue-600 bg-clip-text text-transparent tracking-tight">
                        ArcForge
                    </span>
                </Link>

                {/* Nav Items */}
                <NavItems items={navItems} />

                {/* Right Side — Notifications + Auth */}
                <div className="relative z-20 flex items-center gap-2">
                    <button className="relative p-2 rounded-full hover:bg-purple-50 transition-colors">
                        <Bell className="h-5 w-5 text-gray-600" />
                        <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-lg shadow-purple-500/40">
                            2
                        </span>
                    </button>

                    <SignedIn>
                        <UserButton
                            afterSignOutUrl="/sign-in"
                            appearance={{
                                elements: {
                                    avatarBox:
                                        "w-8 h-8 ring-2 ring-purple-200 ring-offset-1",
                                },
                            }}
                        />
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="redirect">
                            <NavbarButton as="button" variant="gradient" className="!bg-gradient-to-r !from-purple-600 !to-blue-600">
                                Sign In
                            </NavbarButton>
                        </SignInButton>
                    </SignedOut>
                </div>
            </NavBody>

            {/* Mobile Nav */}
            <MobileNav className="!bg-white/90">
                <MobileNavHeader>
                    <Link
                        href="/dashboard"
                        className="flex items-center space-x-2"
                    >
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-md">
                            <Wand2 className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-bold bg-gradient-to-r from-purple-600 via-violet-500 to-blue-600 bg-clip-text text-transparent tracking-tight">
                            ArcForge
                        </span>
                    </Link>
                    <div className="flex items-center gap-2">
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
                    className="!bg-white"
                >
                    {navItems.map((item) => (
                        <Link
                            key={item.link}
                            href={item.link}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                                "w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                pathname?.startsWith(item.link)
                                    ? "bg-purple-50 text-purple-700"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <SignedOut>
                        <SignInButton mode="redirect">
                            <button className="w-full mt-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                                Sign In
                            </button>
                        </SignInButton>
                    </SignedOut>
                </MobileNavMenu>
            </MobileNav>
        </Navbar>
    );
}
