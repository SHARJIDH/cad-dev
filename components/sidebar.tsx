"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Home,
    LayoutDashboard,
    FileBox,
    Settings,
    Users,
    BarChart3,
    Building2,
    ChevronLeft,
    ChevronRight,
    Wand2,
    LineChart,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div
            className={cn(
                "border-r border-gray-200/80 h-screen bg-white relative transition-all duration-300",
                collapsed ? "w-16" : "w-64"
            )}
        >
            <div className="h-16 border-b border-gray-200/80 flex items-center px-4 justify-between bg-gradient-to-r from-purple-50/50 to-blue-50/50">
                <div
                    className={cn(
                        "flex items-center gap-2",
                        collapsed && "justify-center w-full"
                    )}
                >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30 animate-glow-pulse">
                        <Wand2 className="h-5 w-5 text-white" />
                    </div>
                    {!collapsed && (
                        <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">DesignCraft AI</span>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "absolute -right-4 top-16 rounded-full border border-gray-200 bg-white shadow-md hover:shadow-lg transition-shadow z-50",
                        collapsed && "rotate-180"
                    )}
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-4rem)]">
                <div className="py-4">
                    <nav className="space-y-1 px-2">
                        <NavItem
                            href="/"
                            icon={<Home className="h-5 w-5" />}
                            label="Home"
                            active={pathname === "/"}
                            collapsed={collapsed}
                        />
                        <NavItem
                            href="/dashboard"
                            icon={<LayoutDashboard className="h-5 w-5" />}
                            label="Dashboard"
                            active={pathname === "/dashboard"}
                            collapsed={collapsed}
                        />
                        <NavItem
                            href="/projects"
                            icon={<FileBox className="h-5 w-5" />}
                            label="Projects"
                            active={pathname.startsWith("/project")}
                            collapsed={collapsed}
                        />
                        <NavItem
                            href="/cad-generator"
                            icon={<Building2 className="h-5 w-5" />}
                            label="CAD Generator"
                            active={pathname.startsWith("/cad-generator")}
                            collapsed={collapsed}
                        />
                        <NavItem
                            href="/cad-test"
                            icon={<Building2 className="h-5 w-5" />}
                            label="CAD Test"
                            active={pathname.startsWith("/cad-test")}
                            collapsed={collapsed}
                        />
                        <NavItem
                            href="/analytics"
                            icon={<BarChart3 className="h-5 w-5" />}
                            label="Analytics"
                            active={pathname.startsWith("/analytics")}
                            collapsed={collapsed}
                        />
                        <NavItem
                            href="/team"
                            icon={<Users className="h-5 w-5" />}
                            label="Team"
                            active={pathname.startsWith("/team")}
                            collapsed={collapsed}
                        />

                        <div
                            className={cn(
                                "my-6 px-4",
                                collapsed && "px-0 flex justify-center"
                            )}
                        >
                            {collapsed ? <hr className="w-6 border-gray-200" /> : <hr className="border-gray-200" />}
                        </div>

                        <NavItem
                            href="/settings"
                            icon={<Settings className="h-5 w-5" />}
                            label="Settings"
                            active={pathname.startsWith("/settings")}
                            collapsed={collapsed}
                        />
                    </nav>

                    {!collapsed && (
                        <div className="mt-8 px-4 py-4">
                            <div className="rounded-xl border border-purple-200/60 bg-gradient-to-br from-purple-50 to-blue-50 p-4 shadow-sm">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-md">
                                        <Sparkles className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800">
                                            Usage Stats
                                        </h4>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="text-gray-500">
                                                Projects
                                            </span>
                                            <span className="font-medium text-gray-700">3/10</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-white/80 overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 w-[30%] rounded-full" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1.5">
                                            <span className="text-gray-500">
                                                AI Credits
                                            </span>
                                            <span className="font-medium text-gray-700">450/1000</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-white/80 overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 w-[45%] rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

function NavItem({
    href,
    icon,
    label,
    active,
    collapsed,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    active: boolean;
    collapsed: boolean;
}) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                active
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md shadow-purple-500/25"
                    : "text-gray-600 hover:bg-purple-50 hover:text-purple-700",
                collapsed && "justify-center px-2"
            )}
        >
            {icon}
            {!collapsed && <span>{label}</span>}
        </Link>
    );
}
