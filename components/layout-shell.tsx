"use client";

import { usePathname } from "next/navigation";
import { AppNavbar } from "@/components/navbar";

const NO_NAVBAR_ROUTES = ["/sign-in", "/sign-up"];

export function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isNoNavbarRoute = NO_NAVBAR_ROUTES.some((route) =>
        pathname?.startsWith(route)
    );

    // Landing page (/) and auth routes get full-screen treatment
    if (pathname === "/" || isNoNavbarRoute) {
        return <>{children}</>;
    }

    // All other app routes get the navbar
    return (
        <div className="min-h-screen bg-white">
            <AppNavbar />
            <main className="pt-20">
                {children}
            </main>
        </div>
    );
}
