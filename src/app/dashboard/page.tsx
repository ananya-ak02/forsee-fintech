"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    CreditCard,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    AlertTriangle,
    Sparkles,
    Target,
    PiggyBank,
    Plus,
    Receipt
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import {
    getMockSpendingByCategory,
    getMockPreviousMonthSpending,
    getMockAccountBalance,
    getMockMonthlyIncome,
    getMockInsights,
    getMockGoals,
    getMockTransactions,
    type MockInsight,
    type MockGoal,
    type MockTransaction
} from "@/lib/mock-data";

// Stagger animation container
const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
    },
} as const;

const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [spendingData, setSpendingData] = useState<{ name: string; amount: number; color: string; transactions: number }[]>([]);
    const [prevSpendingData, setPrevSpendingData] = useState<{ name: string; amount: number; color: string; transactions: number }[]>([]);
    const [balance, setBalance] = useState(0);
    const [income, setIncome] = useState(0);
    const [insights, setInsights] = useState<MockInsight[]>([]);
    const [goals, setGoals] = useState<MockGoal[]>([]);
    const [transactions, setTransactions] = useState<MockTransaction[]>([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSpendingData(getMockSpendingByCategory());
            setPrevSpendingData(getMockPreviousMonthSpending());
            setBalance(getMockAccountBalance());
            setIncome(getMockMonthlyIncome());
            setInsights(getMockInsights());
            setGoals(getMockGoals());
            setTransactions(getMockTransactions().slice(0, 7)); // Get latest 7 transactions
            setLoading(false);
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    const totalSpending = spendingData.reduce((sum, c) => sum + c.amount, 0);
    const savingsRate = income > 0 ? ((income - totalSpending) / income) * 100 : 0;
    const monthlySavings = income - totalSpending;

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            {/* Page Header w/ Balance */}
            <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
                <div>
                    <h1 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Balance</h1>
                    <div className="text-4xl lg:text-5xl font-semibold tracking-tight text-foreground">
                        {formatCurrency(balance)}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-10 text-sm font-medium px-4">
                        <ArrowDownRight className="w-4 h-4 mr-2" />
                        Receive
                    </Button>
                    <Button className="h-10 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium px-4 border-none shadow-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Record
                    </Button>
                </div>
            </motion.div>

            {/* Quick Stats — 4 cols */}
            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5 shadow-sm border-border">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-primary" />
                        </div>
                        <Badge variant="outline" className="text-emerald-500 bg-emerald-500/10 border-none font-medium px-2 py-0.5">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            +2.4%
                        </Badge>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Available Cash</p>
                        <p className="text-2xl font-semibold text-foreground mt-1">
                            {formatCurrency(balance * 0.7)}
                        </p>
                    </div>
                </Card>

                <Card className="p-5 shadow-sm border-border">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-blue-500" />
                        </div>
                        <Badge variant="outline" className="text-rose-500 bg-rose-500/10 border-none font-medium px-2 py-0.5">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +5.1%
                        </Badge>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Monthly Spending</p>
                        <p className="text-2xl font-semibold text-foreground mt-1">
                            {formatCurrency(totalSpending)}
                        </p>
                    </div>
                </Card>

                <Card className="p-5 shadow-sm border-border">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <PiggyBank className="w-5 h-5 text-emerald-500" />
                        </div>
                        <Badge variant="outline" className={savingsRate >= 20 ? "text-emerald-500 bg-emerald-500/10 border-none font-medium px-2 py-0.5" : "text-amber-500 bg-amber-500/10 border-none font-medium px-2 py-0.5"}>
                            {formatCurrency(monthlySavings)}/mo
                        </Badge>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Savings Rate</p>
                        <p className="text-2xl font-semibold text-foreground mt-1">
                            {savingsRate.toFixed(1)}%
                        </p>
                    </div>
                </Card>

                <Card className="p-5 shadow-sm border-border">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-violet-500" />
                        </div>
                        <Badge variant="outline" className="text-emerald-500 bg-emerald-500/10 border-none font-medium px-2 py-0.5">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            Stable
                        </Badge>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Monthly Income</p>
                        <p className="text-2xl font-semibold text-foreground mt-1">
                            {formatCurrency(income)}
                        </p>
                    </div>
                </Card>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Main Content Area (2 cols) */}
                <motion.div variants={item} className="xl:col-span-2 space-y-6">
                    {/* Recent Transactions */}
                    <Card className="overflow-hidden shadow-sm border-border">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-card/50 py-4">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wide text-muted-foreground">
                                <Receipt className="w-4 h-4" />
                                Recent Transactions
                            </CardTitle>
                            <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80 font-medium px-2 h-8">
                                View All
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/50">
                                {transactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-muted/5 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-muted/20 border border-border/50 flex items-center justify-center flex-shrink-0 group-hover:border-primary/20 transition-colors">
                                                <span className="text-xs font-semibold text-muted-foreground">
                                                    {tx.merchantName.substring(0, 2).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{tx.merchantName}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {tx.category}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-semibold ${tx.amount > 0 ? "text-emerald-500" : "text-foreground"}`}>
                                                {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                                            </p>
                                            {tx.pending && (
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mt-1">Pending</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Monthly Comparison */}
                    <Card className="shadow-sm border-border">
                        <CardHeader className="border-b border-border bg-card/50 py-4">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wide text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                Spending vs Last Month
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <MonthlyComparison current={spendingData} previous={prevSpendingData} />
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Right Sidebar (1 col) */}
                <motion.div variants={item} className="space-y-6">
                    {/* AI Insights Card */}
                    <Card className="shadow-sm border-border">
                        <CardHeader className="border-b border-border bg-card/50 py-4">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wide text-muted-foreground">
                                <Sparkles className="w-4 h-4" />
                                Smart Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            {insights.slice(0, 3).map((insight) => (
                                <div key={insight.id} className="p-4 rounded-xl border border-border bg-card-hover/40 flex items-start gap-3 shadow-sm transition-all hover:bg-card-hover/60">
                                    <div className={`mt-0.5 rounded-full p-2 flex-shrink-0
                                        ${insight.severity === "critical" ? "bg-rose-500/10 text-rose-500" :
                                            insight.severity === "warning" ? "bg-amber-500/10 text-amber-500" :
                                                "bg-blue-500/10 text-blue-500"}`}
                                    >
                                        {insight.severity === "critical" ? <AlertTriangle className="w-4 h-4" /> :
                                            insight.severity === "warning" ? <TrendingUp className="w-4 h-4" /> :
                                                <Sparkles className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{insight.title}</p>
                                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                                            {insight.message}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Goals Overview */}
                    <Card className="shadow-sm border-border">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-card/50 py-4">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wide text-muted-foreground">
                                <Target className="w-4 h-4" />
                                Top Goals
                            </CardTitle>
                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-primary/10 hover:text-primary">
                                <Plus className="w-4 h-4 text-muted-foreground hover:text-primary" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-5 space-y-5">
                            {goals.filter(g => !g.isCompleted).slice(0, 3).map((goal, index) => {
                                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                                const customColors = ["bg-blue-500", "bg-emerald-500", "bg-violet-500"];
                                const colorClass = customColors[index] || "bg-primary";

                                return (
                                    <div key={goal.id} className="space-y-2.5">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{goal.name}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                                                </p>
                                            </div>
                                            <span className="text-xs font-semibold text-foreground">{progress.toFixed(0)}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}

/* ===== Monthly Comparison Bar Chart ===== */
function MonthlyComparison({
    current,
    previous,
}: {
    current: { name: string; amount: number; color: string }[];
    previous: { name: string; amount: number; color: string }[];
}) {
    // Exclude rent for better visualization
    const categories = current.filter((c) => c.name !== "Rent").slice(0, 5);
    const maxAmount = Math.max(
        ...categories.map((c) => c.amount),
        ...previous.filter((p) => p.name !== "Rent").map((p) => p.amount)
    );

    return (
        <div className="space-y-5">
            {categories.map((cat) => {
                const prev = previous.find((p) => p.name === cat.name);
                const prevAmount = prev?.amount || 0;
                const change = prevAmount > 0 ? ((cat.amount - prevAmount) / prevAmount) * 100 : 0;
                const isUp = change > 0;

                return (
                    <div key={cat.name} className="group">
                        <div className="flex items-center justify-between mb-2.5">
                            <span className="text-sm text-foreground font-medium">{cat.name}</span>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-foreground">
                                    {formatCurrency(cat.amount)}
                                </span>
                                {change !== 0 && (
                                    <span className={`text-xs flex items-center gap-0.5 font-medium ${isUp ? "text-rose-500" : "text-emerald-500"}`}>
                                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {Math.abs(change).toFixed(0)}%
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-1 h-2.5">
                            {/* Current month */}
                            <div
                                className="h-full rounded-l-full transition-all duration-700 bg-primary"
                                style={{
                                    width: `${(cat.amount / maxAmount) * 100}%`,
                                }}
                            />
                            {/* Previous month */}
                            <div
                                className="h-full rounded-r-full transition-all duration-700 bg-muted/30"
                                style={{
                                    width: `${(prevAmount / maxAmount) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                );
            })}
            <div className="flex items-center gap-6 mt-6 pt-5 border-t border-border/50 justify-center">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">This Month</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted/30" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Month</span>
                </div>
            </div>
        </div>
    );
}

/* ===== Skeleton Loader ===== */
function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end pb-2">
                <div>
                    <Skeleton className="h-4 w-28 mb-3" />
                    <Skeleton className="h-12 w-56" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <Skeleton className="h-[450px] rounded-xl" />
                    <Skeleton className="h-[350px] rounded-xl" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-[380px] rounded-xl" />
                    <Skeleton className="h-[280px] rounded-xl" />
                </div>
            </div>
        </div>
    );
}
