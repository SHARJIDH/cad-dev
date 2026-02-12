"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const MovingBorder = ({
    children,
    duration = 2000,
    className,
    containerClassName,
    borderClassName,
    as: Component = "button",
    ...otherProps
}: {
    children: React.ReactNode;
    duration?: number;
    className?: string;
    containerClassName?: string;
    borderClassName?: string;
    as?: React.ElementType;
    [key: string]: unknown;
}) => {
    return (
        <Component
            className={cn(
                "relative inline-flex h-12 overflow-hidden rounded-xl p-[2px] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-white",
                containerClassName
            )}
            {...otherProps}
        >
            <span
                className={cn(
                    "absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#9333ea_0%,#3b82f6_50%,#9333ea_100%)]",
                    borderClassName
                )}
                style={{
                    animationDuration: `${duration}ms`,
                }}
            />
            <span
                className={cn(
                    "inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl bg-white px-6 py-2 text-sm font-medium backdrop-blur-3xl gap-2",
                    className
                )}
            >
                {children}
            </span>
        </Component>
    );
};
