"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Target,
    Plus,
    Plane,
    Shield,
    Laptop,
    TrendingUp,
    Calendar,
    CheckCircle2,
    X,
    Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface GoalData {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string | null;
    icon: string;
    color: string;
    isCompleted: boolean;
    progress: number;
    remaining: number;
    estimatedCompletion: string;
    monthsToComplete: number;
    daysUntilDeadline: number | null;
    isOnTrack: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    Plane,
    Shield,
    Laptop,
    TrendingUp,
    Target,
};

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
} as const;

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const GOAL_COLORS = ["#00F5A0", "#38BDF8", "#A78BFA", "#FB923C", "#F43F5E", "#B8FF2E"];
const GOAL_ICONS = [
    { name: "Target", label: "General" },
    { name: "Plane", label: "Travel" },
    { name: "Shield", label: "Emergency" },
    { name: "Laptop", label: "Tech" },
    { name: "TrendingUp", label: "Investment" },
];

export default function GoalsPage() {
    const [goals, setGoals] = useState<GoalData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newGoal, setNewGoal] = useState({
        name: "",
        targetAmount: "",
        deadline: "",
        icon: "Target",
        color: "#00F5A0",
    });

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const res = await fetch("/api/goals");
            const data = await res.json();
            setGoals(data.goals);
        } catch (err) {
            console.error("Failed to fetch goals:", err);
        } finally {
            setLoading(false);
        }
    };

    const createGoal = async () => {
        if (!newGoal.name || !newGoal.targetAmount) return;

        try {
            await fetch("/api/goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newGoal.name,
                    targetAmount: parseFloat(newGoal.targetAmount),
                    deadline: newGoal.deadline || null,
                    icon: newGoal.icon,
                    color: newGoal.color,
                }),
            });

            setNewGoal({ name: "", targetAmount: "", deadline: "", icon: "Target", color: "#00F5A0" });
            setShowCreate(false);
            fetchGoals();
        } catch (err) {
            console.error("Failed to create goal:", err);
        }
    };

    const deleteGoal = async (id: string) => {
        try {
            await fetch(`/api/goals?id=${id}`, { method: "DELETE" });
            fetchGoals();
        } catch (err) {
            console.error("Failed to delete goal:", err);
        }
    };

    const activeGoals = goals.filter((g) => !g.isCompleted);
    const completedGoals = goals.filter((g) => g.isCompleted);
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);

    if (loading) {
        return (
            <div>
                <Skeleton className="h-10 w-48 mb-2" />
                <Skeleton className="h-5 w-64 mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 rounded-2xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-48 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div variants={container} initial="hidden" animate="show">
            {/* Header */}
            <motion.div variants={item} className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-1">Savings Goals</h1>
                    <p className="text-muted">
                        Track your progress and reach your financial targets
                    </p>
                </div>
                <Button
                    variant="mint"
                    onClick={() => setShowCreate(true)}
                    className="gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Goal
                </Button>
            </motion.div>

            {/* Summary Stats */}
            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-mint/10 flex items-center justify-center">
                        <Target className="w-6 h-6 text-mint" />
                    </div>
                    <div>
                        <p className="text-sm text-muted">Active Goals</p>
                        <p className="text-2xl font-bold text-foreground">{activeGoals.length}</p>
                    </div>
                </Card>

                <Card className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-lime/10 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-lime" />
                    </div>
                    <div>
                        <p className="text-sm text-muted">Total Saved</p>
                        <p className="text-2xl font-bold text-foreground">{formatCurrency(totalSaved)}</p>
                    </div>
                </Card>

                <Card className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#A78BFA]/10 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-[#A78BFA]" />
                    </div>
                    <div>
                        <p className="text-sm text-muted">Overall Progress</p>
                        <p className="text-2xl font-bold text-foreground">
                            {totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%
                        </p>
                    </div>
                </Card>
            </motion.div>

            {/* Create Goal Modal */}
            {showCreate && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Card className="p-6 border-mint/20">
                        <div className="flex items-center justify-between mb-6">
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="w-5 h-5 text-mint" />
                                Create New Goal
                            </CardTitle>
                            <button
                                onClick={() => setShowCreate(false)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-background transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4 text-muted" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                            <div>
                                <label className="text-sm text-muted mb-1.5 block">Goal Name</label>
                                <input
                                    type="text"
                                    value={newGoal.name}
                                    onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                                    placeholder="e.g., Save for Travel"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-mint/40 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-muted mb-1.5 block">Target Amount ($)</label>
                                <input
                                    type="number"
                                    value={newGoal.targetAmount}
                                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                                    placeholder="50000"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-mint/40 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-muted mb-1.5 block">Deadline (optional)</label>
                                <input
                                    type="date"
                                    value={newGoal.deadline}
                                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint/40 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-muted mb-1.5 block">Icon</label>
                                <div className="flex gap-2">
                                    {GOAL_ICONS.map((gi) => {
                                        const IconComp = ICON_MAP[gi.name] || Target;
                                        return (
                                            <button
                                                key={gi.name}
                                                onClick={() => setNewGoal({ ...newGoal, icon: gi.name })}
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer ${newGoal.icon === gi.name
                                                    ? "bg-mint/20 border border-mint/40"
                                                    : "bg-background border border-border hover:border-mint/20"
                                                    }`}
                                            >
                                                <IconComp className={`w-4 h-4 ${newGoal.icon === gi.name ? "text-mint" : "text-muted"}`} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className="text-sm text-muted mb-1.5 block">Color</label>
                            <div className="flex gap-2">
                                {GOAL_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setNewGoal({ ...newGoal, color: c })}
                                        className={`w-8 h-8 rounded-full transition-all cursor-pointer ${newGoal.color === c ? "ring-2 ring-offset-2 ring-offset-card" : ""}`}
                                        style={{ backgroundColor: c, ringColor: c }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowCreate(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="mint"
                                onClick={createGoal}
                                disabled={!newGoal.name || !newGoal.targetAmount}
                            >
                                Create Goal
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Active Goals */}
            {activeGoals.length > 0 && (
                <motion.div variants={item} className="mb-8">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Active Goals</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeGoals.map((goal) => {
                            const IconComp = ICON_MAP[goal.icon] || Target;
                            return (
                                <Card key={goal.id} className="p-5 group relative">
                                    <button
                                        onClick={() => deleteGoal(goal.id)}
                                        className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-background transition-all cursor-pointer"
                                    >
                                        <X className="w-3.5 h-3.5 text-muted" />
                                    </button>

                                    <div className="flex items-start gap-4 mb-4">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: `${goal.color}15` }}
                                        >
                                            <IconComp className="w-6 h-6" style={{ color: goal.color }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-semibold text-foreground truncate">
                                                {goal.name}
                                            </h3>
                                            <p className="text-sm text-muted">
                                                {formatCurrency(goal.currentAmount)}{" "}
                                                <span className="text-muted/50">of</span>{" "}
                                                {formatCurrency(goal.targetAmount)}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={goal.isOnTrack ? "success" : "warning"}
                                            className="flex-shrink-0"
                                        >
                                            {goal.isOnTrack ? "On Track" : "Behind"}
                                        </Badge>
                                    </div>

                                    <ProgressBar
                                        value={goal.currentAmount}
                                        max={goal.targetAmount}
                                        color={goal.color}
                                        size="md"
                                    />

                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-1.5 text-xs text-muted">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {goal.daysUntilDeadline !== null
                                                ? `${goal.daysUntilDeadline} days left`
                                                : "No deadline"}
                                        </div>
                                        <span className="text-xs text-muted">
                                            Est. {goal.monthsToComplete}mo to complete
                                        </span>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
                <motion.div variants={item}>
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-mint" />
                        Completed
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {completedGoals.map((goal) => {
                            const IconComp = ICON_MAP[goal.icon] || Target;
                            return (
                                <Card key={goal.id} className="p-5 opacity-60 relative group">
                                    <button
                                        onClick={() => deleteGoal(goal.id)}
                                        className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-background transition-all cursor-pointer"
                                    >
                                        <X className="w-3.5 h-3.5 text-muted" />
                                    </button>
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                                            style={{ backgroundColor: `${goal.color}15` }}
                                        >
                                            <IconComp className="w-5 h-5" style={{ color: goal.color }} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-semibold text-foreground line-through">
                                                {goal.name}
                                            </h3>
                                            <p className="text-xs text-muted">
                                                {formatCurrency(goal.targetAmount)} — Completed!
                                            </p>
                                        </div>
                                        <CheckCircle2 className="w-5 h-5 text-mint" />
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
