"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    MessageSquare,
    Link2,
    TrendingUp,
    Sparkles,
    Target,
    Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Transactions",
        href: "/transactions",
        icon: Receipt,
    },
    {
        label: "Goals",
        href: "/goals",
        icon: Target,
    },
    {
        label: "AI Copilot",
        href: "/copilot",
        icon: MessageSquare,
    },
    {
        label: "Connect Bank",
        href: "/connect",
        icon: Link2,
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-[260px] border-r border-border bg-card/50 backdrop-blur-xl flex flex-col">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
                <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm border border-primary/20">
                        <TrendingUp className="w-5 h-5 text-primary-foreground" />
                    </div>
                </div>
                <div>
                    <h1 className="text-lg font-bold text-foreground tracking-tight">
                        Foresee
                    </h1>
                    <p className="text-[10px] text-muted uppercase tracking-[0.2em]">
                        AI Autopilot
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => {
                    const isActive =
                        pathname === item.href || pathname?.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary/10 text-primary border border-primary/20"
                                    : "text-muted hover:text-foreground hover:bg-card-hover"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "w-5 h-5 transition-colors",
                                    isActive ? "text-primary" : "text-muted"
                                )}
                            />
                            {item.label}
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-4 py-4 border-t border-border">
                <div className="glass-card p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-primary">PRO</span>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">
                        AI insights powered by GPT-4. Connect your bank to get started.
                    </p>
                </div>
            </div>
        </aside>
    );
}
