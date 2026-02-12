"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, HelpCircle, LogOut, Search, Settings, User } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export function Header() {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            message: "Agent feedback available on Office Building project",
            time: "Just now",
        },
        {
            id: 2,
            message: "Budget analysis complete for Residential Complex",
            time: "2 hours ago",
        },
    ]);

    return (
        <header className="border-b border-gray-200/80 bg-white h-16 flex items-center px-4 lg:px-6">
            {/* Search bar */}
            <div className="flex-1 max-w-md">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search projects, designs..."
                        className="pl-10 bg-gray-50/80 border-gray-200 focus:bg-white focus:border-purple-300 focus:ring-purple-200 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center justify-end space-x-2 ml-4">
                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative hover:bg-purple-50 transition-colors"
                        >
                            <Bell className="h-5 w-5 text-gray-600" />
                            {notifications.length > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-lg shadow-purple-500/40">
                                    {notifications.length}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 bg-white border-gray-200">
                        <DropdownMenuLabel className="text-gray-800">Notifications</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className="flex flex-col items-start py-3 hover:bg-purple-50 cursor-pointer"
                            >
                                <span className="text-gray-700">{notification.message}</span>
                                <span className="text-xs text-gray-400 mt-1">
                                    {notification.time}
                                </span>
                            </DropdownMenuItem>
                        ))}
                        {notifications.length === 0 && (
                            <DropdownMenuItem
                                disabled
                                className="text-center py-4"
                            >
                                No new notifications
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-center cursor-pointer justify-center text-purple-600 hover:bg-purple-50 font-medium">
                            Mark all as read
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Help */}
                <Button variant="ghost" size="icon" className="hover:bg-purple-50 transition-colors">
                    <HelpCircle className="h-5 w-5 text-gray-600" />
                </Button>

                {/* Settings */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-purple-50 transition-colors">
                            <Settings className="h-5 w-5 text-gray-600" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-gray-200">
                        <DropdownMenuItem className="hover:bg-purple-50">Account Settings</DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-purple-50">Team Management</DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-purple-50">Billing & Plans</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User Profile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="gap-2 hover:bg-purple-50 transition-colors px-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-purple-500/30 text-sm">
                                JD
                            </div>
                            <span className="hidden sm:inline-block text-gray-700 font-medium">
                                John Doe
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-gray-200">
                        <DropdownMenuLabel className="text-gray-800">My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 hover:bg-purple-50">
                            <User className="h-4 w-4" /> Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-red-600 hover:bg-red-50">
                            <LogOut className="h-4 w-4" /> Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
