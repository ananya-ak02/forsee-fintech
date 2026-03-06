import { NextResponse } from "next/server";
import { getMockTransactions } from "@/lib/mock-data";
import { detectFraudulentTransactions, getMockFraudAlerts } from "@/lib/fraud-detection";

export async function POST() {
    try {
        const transactions = getMockTransactions();

        // Run fraud detection on all transactions
        const alerts = detectFraudulentTransactions(
            transactions.map((tx) => ({
                id: tx.id,
                merchantName: tx.merchantName,
                amount: tx.amount,
                category: tx.category,
                date: tx.date,
            }))
        );

        // If no alerts found from real analysis, use mock alerts for demo
        const finalAlerts = alerts.length > 0 ? alerts : getMockFraudAlerts();

        return NextResponse.json({
            alerts: finalAlerts,
            totalFlagged: finalAlerts.length,
            highRisk: finalAlerts.filter((a) => a.riskLevel === "high").length,
            mediumRisk: finalAlerts.filter((a) => a.riskLevel === "medium").length,
            lowRisk: finalAlerts.filter((a) => a.riskLevel === "low").length,
        });
    } catch (error) {
        console.error("Fraud detection error:", error);
        return NextResponse.json(
            { error: "Failed to run fraud detection" },
            { status: 500 }
        );
    }
}
