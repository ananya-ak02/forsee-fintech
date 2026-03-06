"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
    value: number; // 0–100
    max?: number;
    color?: string;
    showLabel?: boolean;
    size?: "sm" | "md" | "lg";
    className?: string;
    animated?: boolean;
}

export function ProgressBar({
    value,
    max = 100,
    color = "#00F5A0",
    showLabel = true,
    size = "md",
    className,
    animated = true,
}: ProgressBarProps) {
    const percentage = Math.min(Math.round((value / max) * 100), 100);

    const heights = {
        sm: "h-1.5",
        md: "h-2.5",
        lg: "h-4",
    };

    return (
        <div className={cn("w-full", className)}>
            {showLabel && (
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-muted">Progress</span>
                    <span className="text-xs font-semibold text-foreground">
                        {percentage}%
                    </span>
                </div>
            )}
            <div
                className={cn(
                    "w-full rounded-full bg-background overflow-hidden",
                    heights[size]
                )}
            >
                <div
                    className={cn(
                        "h-full rounded-full",
                        animated && "transition-all duration-1000 ease-out"
                    )}
                    style={{
                        width: `${percentage}%`,
                        background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                        boxShadow: `0 0 12px ${color}40`,
                    }}
                />
            </div>
        </div>
    );
}
