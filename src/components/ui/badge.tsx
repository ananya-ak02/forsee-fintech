import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors",
    {
        variants: {
            variant: {
                default: "bg-primary/10 text-primary border border-primary/20",
                mint: "bg-primary/10 text-primary border border-primary/20",
                lime: "bg-secondary/10 text-secondary border border-secondary/20",
                outline: "bg-transparent border border-border text-foreground",
                destructive: "bg-red-500/10 text-red-500 border border-red-500/20",
                warning: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
                success: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
