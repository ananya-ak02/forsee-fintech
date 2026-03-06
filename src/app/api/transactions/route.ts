import { NextResponse } from "next/server";
import { getMockTransactions, getMockSpendingByCategory } from "@/lib/mock-data";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view"); // "category" | "list"
    const days = parseInt(searchParams.get("days") || "30");

    try {
        // In production, this would query the database:
        // const transactions = await prisma.transaction.findMany({ ... });

        const allTransactions = getMockTransactions();

        // Filter by date range
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const filtered = allTransactions.filter(
            (tx) => new Date(tx.date) >= cutoffDate
        );

        if (view === "category") {
            const categoryData = getMockSpendingByCategory();
            return NextResponse.json({ categories: categoryData });
        }

        return NextResponse.json({
            transactions: filtered.slice(0, 50),
            total: filtered.length,
            totalSpending: filtered
                .filter((tx) => tx.amount < 0)
                .reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
        });
    } catch (error) {
        console.error("Transaction fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch transactions" },
            { status: 500 }
        );
    }
}
