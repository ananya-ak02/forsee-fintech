import { NextResponse } from "next/server";
import { getMockGoals } from "@/lib/mock-data";

// In-memory store for demo (in production, use Prisma)
let goals = getMockGoals();

export async function GET() {
    try {
        const now = new Date();

        const goalsWithEstimates = goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const remaining = goal.targetAmount - goal.currentAmount;

            // Estimate completion based on average monthly savings ($1,144/mo mock)
            const avgMonthlySavings = 1144;
            const monthsToComplete =
                remaining > 0 ? Math.ceil(remaining / avgMonthlySavings) : 0;

            const estimatedCompletion = new Date(now);
            estimatedCompletion.setMonth(
                estimatedCompletion.getMonth() + monthsToComplete
            );

            const daysUntilDeadline = goal.deadline
                ? Math.ceil(
                    (new Date(goal.deadline).getTime() - now.getTime()) /
                    (1000 * 60 * 60 * 24)
                )
                : null;

            const isOnTrack =
                daysUntilDeadline === null
                    ? true
                    : monthsToComplete * 30 <= daysUntilDeadline;

            return {
                ...goal,
                progress: Math.round(progress * 10) / 10,
                remaining: Math.round(remaining * 100) / 100,
                estimatedCompletion: estimatedCompletion.toISOString(),
                monthsToComplete,
                daysUntilDeadline,
                isOnTrack,
            };
        });

        return NextResponse.json({ goals: goalsWithEstimates });
    } catch (error) {
        console.error("Goals fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch goals" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, targetAmount, deadline, icon, color } = body;

        if (!name || !targetAmount) {
            return NextResponse.json(
                { error: "Name and target amount are required" },
                { status: 400 }
            );
        }

        const newGoal = {
            id: `goal-${Date.now()}`,
            name,
            targetAmount,
            currentAmount: 0,
            deadline: deadline || null,
            icon: icon || "target",
            color: color || "#00F5A0",
            isCompleted: false,
        };

        goals.push(newGoal);

        return NextResponse.json({ goal: newGoal }, { status: 201 });
    } catch (error) {
        console.error("Goal create error:", error);
        return NextResponse.json(
            { error: "Failed to create goal" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, currentAmount, name, targetAmount, deadline } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Goal ID is required" },
                { status: 400 }
            );
        }

        const goalIndex = goals.findIndex((g) => g.id === id);
        if (goalIndex === -1) {
            return NextResponse.json(
                { error: "Goal not found" },
                { status: 404 }
            );
        }

        if (currentAmount !== undefined) goals[goalIndex].currentAmount = currentAmount;
        if (name) goals[goalIndex].name = name;
        if (targetAmount) goals[goalIndex].targetAmount = targetAmount;
        if (deadline) goals[goalIndex].deadline = deadline;

        // Check if completed
        if (goals[goalIndex].currentAmount >= goals[goalIndex].targetAmount) {
            goals[goalIndex].isCompleted = true;
        }

        return NextResponse.json({ goal: goals[goalIndex] });
    } catch (error) {
        console.error("Goal update error:", error);
        return NextResponse.json(
            { error: "Failed to update goal" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Goal ID is required" },
                { status: 400 }
            );
        }

        const goalIndex = goals.findIndex((g) => g.id === id);
        if (goalIndex === -1) {
            return NextResponse.json(
                { error: "Goal not found" },
                { status: 404 }
            );
        }

        goals = goals.filter((g) => g.id !== id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Goal delete error:", error);
        return NextResponse.json(
            { error: "Failed to delete goal" },
            { status: 500 }
        );
    }
}
