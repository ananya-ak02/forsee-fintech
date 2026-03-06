import { NextResponse } from "next/server";
import {
    getMockSpendingByCategory,
    getMockPreviousMonthSpending,
    getMockMonthlyIncome,
    getMockInsights,
} from "@/lib/mock-data";

export async function GET() {
    try {
        const currentSpending = getMockSpendingByCategory();
        const previousSpending = getMockPreviousMonthSpending();
        const monthlyIncome = getMockMonthlyIncome();
        const totalSpending = currentSpending.reduce((sum, c) => sum + c.amount, 0);

        // Calculate savings rate
        const savingsRate = ((monthlyIncome - totalSpending) / monthlyIncome) * 100;

        // Overspending detection (categories that increased >15%)
        const overspendingAlerts = currentSpending
            .map((cat) => {
                const prev = previousSpending.find((p) => p.name === cat.name);
                if (!prev) return null;
                const change = ((cat.amount - prev.amount) / prev.amount) * 100;
                if (change > 15) {
                    return {
                        category: cat.name,
                        current: cat.amount,
                        previous: prev.amount,
                        changePercent: Math.round(change * 10) / 10,
                    };
                }
                return null;
            })
            .filter(Boolean);

        // Monthly comparison data
        const monthlyComparison = currentSpending.map((cat) => {
            const prev = previousSpending.find((p) => p.name === cat.name);
            return {
                category: cat.name,
                current: cat.amount,
                previous: prev?.amount || 0,
                color: cat.color,
            };
        });

        // Financial health score components
        const budgetAdherence =
            ((currentSpending.length - overspendingAlerts.length) /
                currentSpending.length) *
            100;
        const trendDirection = savingsRate > 15 ? 0.5 : savingsRate > 10 ? 0 : -0.5;

        const healthScore = Math.round(
            Math.min(
                (Math.min(savingsRate * 2, 40)) +
                ((budgetAdherence / 100) * 30) +
                (((trendDirection + 1) / 2) * 15) +
                (Math.min(currentSpending.length * 2.5, 15)),
                100
            )
        );

        // Use OpenAI for enhanced insights if available
        const apiKey = process.env.OPENAI_API_KEY;
        let aiInsights = getMockInsights();

        if (apiKey) {
            try {
                const openaiResponse = await fetch(
                    "https://api.openai.com/v1/chat/completions",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${apiKey}`,
                        },
                        body: JSON.stringify({
                            model: "gpt-4",
                            messages: [
                                {
                                    role: "system",
                                    content:
                                        "You are a financial advisor AI. Analyze the user's spending data and return exactly 5 insights as a JSON array. Each insight should have: type (overspending|saving|trend|health|fraud), title (short), message (1-2 sentences with specific numbers), severity (info|warning|critical), icon (a lucide-react icon name). Focus on actionable advice.",
                                },
                                {
                                    role: "user",
                                    content: `Monthly income: $${monthlyIncome}. Current month spending: ${JSON.stringify(currentSpending)}. Previous month: ${JSON.stringify(previousSpending)}. Savings rate: ${savingsRate.toFixed(1)}%. Health score: ${healthScore}/100.`,
                                },
                            ],
                            temperature: 0.7,
                            max_tokens: 500,
                        }),
                    }
                );

                const data = await openaiResponse.json();
                if (data.choices?.[0]?.message?.content) {
                    try {
                        const parsed = JSON.parse(data.choices[0].message.content);
                        if (Array.isArray(parsed)) {
                            aiInsights = parsed.map((item: Record<string, string>, i: number) => ({
                                id: `ai-insight-${i}`,
                                ...item,
                            }));
                        }
                    } catch {
                        // Fall back to mock insights
                    }
                }
            } catch {
                // Fall back to mock insights
            }
        }

        return NextResponse.json({
            healthScore,
            savingsRate: Math.round(savingsRate * 10) / 10,
            monthlyIncome,
            totalSpending: Math.round(totalSpending * 100) / 100,
            monthlySavings: Math.round((monthlyIncome - totalSpending) * 100) / 100,
            overspendingAlerts,
            monthlyComparison,
            insights: aiInsights,
        });
    } catch (error) {
        console.error("Insights error:", error);
        return NextResponse.json(
            { error: "Failed to generate insights" },
            { status: 500 }
        );
    }
}
