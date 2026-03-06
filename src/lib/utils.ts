import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(amount);
}

export function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(date));
}

export function formatDateShort(date: Date | string): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
    }).format(new Date(date));
}

export function formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
}

export function getRelativeTime(date: Date | string): string {
    const now = new Date();
    const d = new Date(date);
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
}

export function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
        "Food": "#FF922B",
        "Transport": "#00F5A0",
        "Transportation": "#00F5A0",
        "Groceries": "#B8FF2E",
        "Rent": "#FF6B6B",
        "Entertainment": "#845EF7",
        "Dining": "#FF922B",
        "Subscriptions": "#22B8CF",
        "Shopping": "#F06595",
        "Utilities": "#20C997",
        "Bills": "#38BDF8",
        "Investments": "#A78BFA",
        "Health": "#FB7185",
        "Education": "#FBBF24",
        "Income": "#00F5A0",
        "Other": "#64748B",
    };
    return colors[category] || colors["Other"];
}

export function getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
        "Food": "UtensilsCrossed",
        "Transport": "Car",
        "Transportation": "Car",
        "Groceries": "ShoppingCart",
        "Rent": "Home",
        "Entertainment": "Tv",
        "Dining": "UtensilsCrossed",
        "Subscriptions": "CreditCard",
        "Shopping": "ShoppingBag",
        "Utilities": "Zap",
        "Bills": "Receipt",
        "Investments": "TrendingUp",
        "Health": "Heart",
        "Education": "GraduationCap",
        "Income": "DollarSign",
        "Other": "MoreHorizontal",
    };
    return icons[category] || icons["Other"];
}

export function getTagColor(tag: string): string {
    const colors: Record<string, string> = {
        "work": "#38BDF8",
        "personal": "#A78BFA",
        "travel": "#FB923C",
        "essential": "#22C55E",
        "luxury": "#F43F5E",
        "recurring": "#06B6D4",
    };
    return colors[tag.toLowerCase()] || "#64748B";
}

/**
 * Calculates a financial health score (0–100) based on spending patterns.
 */
export function calculateHealthScore(params: {
    savingsRate: number;     // % of income saved (0–100)
    budgetAdherence: number; // % of categories within budget (0–100)
    trendDirection: number;  // -1 (worsening) to 1 (improving)
    diversification: number; // number of spending categories (higher = better)
}): number {
    const { savingsRate, budgetAdherence, trendDirection, diversification } = params;

    // Weighted scoring
    const savingsScore = Math.min(savingsRate * 2, 40);        // Max 40 pts
    const budgetScore = (budgetAdherence / 100) * 30;          // Max 30 pts
    const trendScore = ((trendDirection + 1) / 2) * 15;        // Max 15 pts
    const diversityScore = Math.min(diversification * 2.5, 15); // Max 15 pts

    return Math.round(Math.min(savingsScore + budgetScore + trendScore + diversityScore, 100));
}

export function getHealthScoreLabel(score: number): { label: string; color: string } {
    if (score >= 80) return { label: "Excellent", color: "#00F5A0" };
    if (score >= 60) return { label: "Good", color: "#B8FF2E" };
    if (score >= 40) return { label: "Fair", color: "#FBBF24" };
    if (score >= 20) return { label: "Needs Work", color: "#FB923C" };
    return { label: "Critical", color: "#EF4444" };
}

export function getDaysUntil(date: Date | string): number {
    const target = new Date(date);
    const now = new Date();
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
