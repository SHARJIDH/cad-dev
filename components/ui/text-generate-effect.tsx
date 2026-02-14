"use client";

import React from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export const TextGenerateEffect = ({
    words,
    className,
    filter = true,
    duration = 0.5,
}: {
    words: string;
    className?: string;
    filter?: boolean;
    duration?: number;
}) => {
    const [scope, animate] = useAnimate();
    const wordsArray = words.split(" ");

    // Separate gradient/text classes from layout classes
    const gradientClasses = (className || "")
        .split(" ")
        .filter((c) => c.startsWith("bg-") || c.startsWith("text-transparent") || c.startsWith("bg-clip"))
        .join(" ");
    const layoutClasses = (className || "")
        .split(" ")
        .filter((c) => !c.startsWith("bg-") && !c.startsWith("text-transparent") && !c.startsWith("bg-clip"))
        .join(" ");

    useEffect(() => {
        animate(
            "span",
            {
                opacity: 1,
                filter: filter ? "blur(0px)" : "none",
            },
            {
                duration: duration || 0.5,
                delay: stagger(0.1),
            }
        );
    }, [scope, animate, duration, filter]);

    return (
        <div className={cn("font-bold", layoutClasses)}>
            <motion.div ref={scope}>
                {wordsArray.map((word, idx) => {
                    return (
                        <motion.span
                            key={word + idx}
                            className={cn("opacity-0", gradientClasses)}
                            style={{
                                filter: filter ? "blur(10px)" : "none",
                            }}
                        >
                            {word}{" "}
                        </motion.span>
                    );
                })}
            </motion.div>
        </div>
    );
};
