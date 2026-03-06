// Fraud / Unusual Spending Detection Engine

export interface TransactionForFraud {
    id: string;
    merchantName: string;
    amount: number;
    category: string;
    date: Date | string;
}

export interface FraudAlert {
    transactionId: string;
    merchantName: string;
    amount: number;
    date: string;
    riskLevel: "low" | "medium" | "high";
    reasons: string[];
    category: string;
}

/**
 * Detects unusual or potentially fraudulent transactions.
 * Uses statistical analysis to flag anomalies.
 */
export function detectFraudulentTransactions(
    transactions: TransactionForFraud[]
): FraudAlert[] {
    const alerts: FraudAlert[] = [];
    if (transactions.length < 5) return alerts;

    // Group by category to compute per-category stats
    const categoryStats = new Map<string, { amounts: number[]; mean: number; stdDev: number }>();

    for (const tx of transactions) {
        const cat = tx.category;
        if (!categoryStats.has(cat)) {
            categoryStats.set(cat, { amounts: [], mean: 0, stdDev: 0 });
        }
        categoryStats.get(cat)!.amounts.push(Math.abs(tx.amount));
    }

    // Calculate mean and std deviation per category
    for (const [, stats] of Array.from(categoryStats.entries())) {
        const n = stats.amounts.length;
        stats.mean = stats.amounts.reduce((a, b) => a + b, 0) / n;
        const variance =
            stats.amounts.reduce((sum, val) => sum + Math.pow(val - stats.mean, 2), 0) / n;
        stats.stdDev = Math.sqrt(variance);
    }

    // Track merchant frequency per day
    const merchantDayCount = new Map<string, Map<string, number>>();
    // Track seen categories
    const seenCategories = new Set<string>();
    const orderedTxs = [...transactions].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (const tx of orderedTxs) {
        const reasons: string[] = [];
        const absAmount = Math.abs(tx.amount);
        const dateStr = new Date(tx.date).toISOString().split("T")[0];

        // 1. Amount anomaly (Z-score > 2)
        const stats = categoryStats.get(tx.category);
        if (stats && stats.stdDev > 0) {
            const zScore = (absAmount - stats.mean) / stats.stdDev;
            if (zScore > 2) {
                reasons.push(
                    `Amount $${absAmount.toFixed(2)} is ${zScore.toFixed(1)}x standard deviations above the average $${stats.mean.toFixed(2)} for ${tx.category}`
                );
            }
        } else if (stats && absAmount > stats.mean * 3 && stats.amounts.length > 1) {
            reasons.push(
                `Amount $${absAmount.toFixed(2)} is 3x above the category average of $${stats.mean.toFixed(2)}`
            );
        }

        // 2. Frequency anomaly (>3 transactions to same merchant in one day)
        const merchantKey = tx.merchantName.toLowerCase();
        if (!merchantDayCount.has(merchantKey)) {
            merchantDayCount.set(merchantKey, new Map());
        }
        const dayMap = merchantDayCount.get(merchantKey)!;
        dayMap.set(dateStr, (dayMap.get(dateStr) || 0) + 1);
        const dayCount = dayMap.get(dateStr)!;

        if (dayCount > 3) {
            reasons.push(
                `${dayCount} transactions to ${tx.merchantName} on the same day`
            );
        }

        // 3. New category anomaly
        if (!seenCategories.has(tx.category) && seenCategories.size > 3) {
            reasons.push(`First-time spending in category "${tx.category}"`);
        }
        seenCategories.add(tx.category);

        // Only create alert if we found reasons
        if (reasons.length > 0) {
            const riskLevel: FraudAlert["riskLevel"] =
                reasons.length >= 3
                    ? "high"
                    : reasons.length >= 2
                        ? "medium"
                        : "low";

            alerts.push({
                transactionId: tx.id,
                merchantName: tx.merchantName,
                amount: absAmount,
                date: new Date(tx.date).toISOString(),
                riskLevel,
                reasons,
                category: tx.category,
            });
        }
    }

    // Sort by risk level (high first) then by amount
    const riskOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
    return alerts
        .sort((a, b) => riskOrder[b.riskLevel] - riskOrder[a.riskLevel] || b.amount - a.amount)
        .slice(0, 10); // Return top 10 alerts
}

/**
 * Mock fraud alerts for demo
 */
export function getMockFraudAlerts(): FraudAlert[] {
    return [
        {
            transactionId: "fraud-1",
            merchantName: "Luxury Electronics Co.",
            amount: 1249.99,
            date: new Date(Date.now() - 2 * 86400000).toISOString(),
            riskLevel: "high",
            reasons: [
                "Amount $1249.99 is 4.2x standard deviations above average for Shopping",
                'First-time spending in category "Electronics"',
            ],
            category: "Shopping",
        },
        {
            transactionId: "fraud-2",
            merchantName: "Unknown ATM",
            amount: 500.0,
            date: new Date(Date.now() - 1 * 86400000).toISOString(),
            riskLevel: "medium",
            reasons: [
                "Amount $500.00 is 2.8x standard deviations above average withdrawal",
            ],
            category: "ATM",
        },
        {
            transactionId: "fraud-3",
            merchantName: "DoorDash",
            amount: 89.50,
            date: new Date().toISOString(),
            riskLevel: "low",
            reasons: [
                "4 transactions to DoorDash on the same day",
            ],
            category: "Dining",
        },
    ];
}
