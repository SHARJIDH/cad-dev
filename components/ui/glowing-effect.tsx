"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const GlowingEffect = ({
    children,
    className,
    containerClassName,
    glowColor = "rgba(147, 51, 234, 0.4)",
    borderRadius = "1rem",
}: {
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
    glowColor?: string;
    borderRadius?: string;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <div
            ref={containerRef}
            className={cn("relative group", containerClassName)}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Glow border */}
            <div
                className="absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
                style={{
                    background: isHovered
                        ? `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}, transparent 60%)`
                        : "transparent",
                    borderRadius,
                }}
            />
            <div
                className="absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: isHovered
                        ? `radial-gradient(200px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}, transparent 60%)`
                        : "transparent",
                    borderRadius,
                }}
            />
            <div className={cn("relative z-10", className)}>
                {children}
            </div>
        </div>
    );
};
