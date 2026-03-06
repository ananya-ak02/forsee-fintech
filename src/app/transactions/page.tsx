"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    AlertTriangle,
    Calendar,
    Receipt,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/components/ui/tag";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, getCategoryColor, getTagColor } from "@/lib/utils";
import { getMockTransactions, type MockTransaction } from "@/lib/mock-data";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
} as const;

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const CATEGORIES = [
    "All",
    "Dining",
    "Groceries",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Subscriptions",
    "Utilities",
    "Rent",
    "Income",
];

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<MockTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
    const [dateRange, setDateRange] = useState(30);
    const [page, setPage] = useState(1);
    const perPage = 20;

    useEffect(() => {
        const timer = setTimeout(() => {
            setTransactions(getMockTransactions());
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // Filtered transactions
    const filtered = useMemo(() => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - dateRange);

        return transactions.filter((tx) => {
            if (new Date(tx.date) < cutoff) return false;
            if (categoryFilter !== "All" && tx.category !== categoryFilter) return false;
            if (typeFilter !== "all" && tx.type !== typeFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                if (
                    !tx.merchantName.toLowerCase().includes(q) &&
                    !tx.category.toLowerCase().includes(q) &&
                    !tx.tags.some((t) => t.toLowerCase().includes(q))
                ) {
                    return false;
                }
            }
            return true;
        });
    }, [transactions, search, categoryFilter, typeFilter, dateRange]);

    const paginated = filtered.slice((page - 1) * perPage, page * perPage);
    const totalPages = Math.ceil(filtered.length / perPage);

    const totalIncome = filtered
        .filter((tx) => tx.type === "income")
        .reduce((sum, tx) => sum + tx.amount, 0);

    const totalExpense = filtered
        .filter((tx) => tx.type === "expense")
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    if (loading) {
        return (
            <div>
                <Skeleton className="h-10 w-48 mb-2" />
                <Skeleton className="h-5 w-64 mb-8" />
                <Skeleton className="h-12 w-full mb-4 rounded-xl" />
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full mb-2 rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <motion.div variants={container} initial="hidden" animate="show">
            {/* Header */}
            <motion.div variants={item} className="mb-6">
                <h1 className="text-3xl font-bold text-foreground mb-1">Transactions</h1>
                <p className="text-muted">
                    {filtered.length} transactions in the last {dateRange} days
                </p>
            </motion.div>

            {/* Summary Cards */}
            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-mint/10 flex items-center justify-center">
                        <ArrowUpRight className="w-5 h-5 text-mint" />
                    </div>
                    <div>
                        <p className="text-xs text-muted">Income</p>
                        <p className="text-lg font-bold text-mint">{formatCurrency(totalIncome)}</p>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <ArrowDownRight className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                        <p className="text-xs text-muted">Expenses</p>
                        <p className="text-lg font-bold text-red-400">{formatCurrency(totalExpense)}</p>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-lime/10 flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-lime" />
                    </div>
                    <div>
                        <p className="text-xs text-muted">Net</p>
                        <p className={`text-lg font-bold ${totalIncome - totalExpense >= 0 ? "text-mint" : "text-red-400"}`}>
                            {formatCurrency(totalIncome - totalExpense)}
                        </p>
                    </div>
                </Card>
            </motion.div>

            {/* Filters */}
            <motion.div variants={item} className="mb-6">
                <Card className="p-4">
                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Search merchants, categories, tags..."
                                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-mint/40 transition-colors"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-muted" />
                            <select
                                value={categoryFilter}
                                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                                className="bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint/40 transition-colors cursor-pointer"
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Type Filter */}
                        <div className="flex rounded-xl border border-border overflow-hidden">
                            {(["all", "income", "expense"] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => { setTypeFilter(t); setPage(1); }}
                                    className={`px-3 py-2 text-xs font-medium capitalize transition-colors cursor-pointer ${typeFilter === t
                                        ? "bg-mint/10 text-mint"
                                        : "text-muted hover:text-foreground"
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        {/* Date Range */}
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-muted" />
                            <select
                                value={dateRange}
                                onChange={(e) => { setDateRange(parseInt(e.target.value)); setPage(1); }}
                                className="bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint/40 transition-colors cursor-pointer"
                            >
                                <option value={7}>7 days</option>
                                <option value={30}>30 days</option>
                                <option value={60}>60 days</option>
                                <option value={90}>90 days</option>
                            </select>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Transaction List */}
            <motion.div variants={item}>
                <Card className="p-0 overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-border text-xs font-medium text-muted uppercase tracking-wider">
                        <div className="col-span-4">Merchant</div>
                        <div className="col-span-2">Category</div>
                        <div className="col-span-2">Date</div>
                        <div className="col-span-2">Tags</div>
                        <div className="col-span-2 text-right">Amount</div>
                    </div>

                    {/* Rows */}
                    {paginated.map((tx, idx) => (
                        <div
                            key={tx.id}
                            className={`grid grid-cols-12 gap-3 px-5 py-3.5 items-center transition-colors hover:bg-card-hover/50 ${idx < paginated.length - 1 ? "border-b border-border/50" : ""
                                }`}
                        >
                            {/* Merchant */}
                            <div className="col-span-4 flex items-center gap-3 min-w-0">
                                <div
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: getCategoryColor(tx.category) }}
                                />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {tx.merchantName}
                                    </p>
                                    {tx.pending && (
                                        <span className="text-[10px] text-yellow-500">Pending</span>
                                    )}
                                </div>
                                {tx.isFlagged && (
                                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                )}
                            </div>

                            {/* Category */}
                            <div className="col-span-2">
                                <Badge
                                    variant="outline"
                                    className="text-[10px]"
                                    style={{
                                        borderColor: `${getCategoryColor(tx.category)}40`,
                                        color: getCategoryColor(tx.category),
                                    }}
                                >
                                    {tx.category}
                                </Badge>
                            </div>

                            {/* Date */}
                            <div className="col-span-2">
                                <span className="text-sm text-muted">{formatDate(tx.date)}</span>
                            </div>

                            {/* Tags */}
                            <div className="col-span-2 flex flex-wrap gap-1">
                                {tx.tags.slice(0, 2).map((tag) => (
                                    <Tag
                                        key={tag}
                                        label={tag}
                                        color={getTagColor(tag)}
                                        size="sm"
                                    />
                                ))}
                                {tx.tags.length > 2 && (
                                    <span className="text-[10px] text-muted">+{tx.tags.length - 2}</span>
                                )}
                            </div>

                            {/* Amount */}
                            <div className="col-span-2 text-right">
                                <span
                                    className={`text-sm font-semibold ${tx.amount >= 0 ? "text-mint" : "text-foreground"
                                        }`}
                                >
                                    {tx.amount >= 0 ? "+" : ""}
                                    {formatCurrency(Math.abs(tx.amount))}
                                </span>
                            </div>
                        </div>
                    ))}

                    {paginated.length === 0 && (
                        <div className="px-5 py-12 text-center text-muted">
                            No transactions found matching your filters.
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
                <motion.div variants={item} className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted">
                        Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
                    </p>
                    <div className="flex gap-1.5">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="px-3 py-1.5 rounded-lg text-sm border border-border text-muted hover:text-foreground hover:border-mint/20 disabled:opacity-30 transition-colors cursor-pointer"
                        >
                            Prev
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors cursor-pointer ${page === pageNum
                                        ? "bg-mint/10 text-mint border border-mint/30"
                                        : "border border-border text-muted hover:text-foreground"
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1.5 rounded-lg text-sm border border-border text-muted hover:text-foreground hover:border-mint/20 disabled:opacity-30 transition-colors cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
