"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface TagProps {
    label: string;
    color?: string;
    removable?: boolean;
    onRemove?: () => void;
    size?: "sm" | "md";
    className?: string;
}

export function Tag({
    label,
    color = "#64748B",
    removable = false,
    onRemove,
    size = "sm",
    className,
}: TagProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full font-medium border transition-all duration-200",
                size === "sm"
                    ? "px-2.5 py-0.5 text-[10px]"
                    : "px-3 py-1 text-xs",
                className
            )}
            style={{
                backgroundColor: `${color}15`,
                borderColor: `${color}30`,
                color: color,
            }}
        >
            <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
            />
            {label}
            {removable && onRemove && (
                <button
                    onClick={onRemove}
                    className="ml-0.5 hover:opacity-70 transition-opacity cursor-pointer"
                >
                    <X className="w-3 h-3" />
                </button>
            )}
        </span>
    );
}
