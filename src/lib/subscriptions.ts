// Subscription Detection & Savings Logic
// Works with both real DB data and mock data

export interface TransactionData {
    id: string;
    merchantName: string;
    amount: number;
    date: Date | string;
    category: string;
}

export interface DetectedSubscription {
    merchantName: string;
    amount: number;
    frequency: string;
    lastCharged: Date;
    occurrences: number;
    isActive: boolean;
}

/**
 * Detects subscriptions by grouping transactions by merchant name
 * and flagging those that appear monthly with similar amounts.
 */
export function detectSubscriptions(
    transactions: TransactionData[]
): DetectedSubscription[] {
    const merchantGroups = new Map<
        string,
        { amounts: number[]; dates: Date[] }
    >();

    // Group transactions by merchant
    for (const tx of transactions) {
        const key = tx.merchantName.toLowerCase().trim();
        if (!merchantGroups.has(key)) {
            merchantGroups.set(key, { amounts: [], dates: [] });
        }
        const group = merchantGroups.get(key)!;
        group.amounts.push(Math.abs(tx.amount));
        group.dates.push(new Date(tx.date));
    }

    const subscriptions: DetectedSubscription[] = [];

    for (const [merchant, group] of Array.from(merchantGroups.entries())) {
        // Need at least 2 occurrences to detect a pattern
        if (group.amounts.length < 2) continue;

        // Check if amounts are similar (within 10% variance)
        const avgAmount =
            group.amounts.reduce((a, b) => a + b, 0) / group.amounts.length;
        const allSimilar = group.amounts.every(
            (a) => Math.abs(a - avgAmount) / avgAmount < 0.1
        );

        if (!allSimilar) continue;

        // Check if dates are roughly monthly (25-35 day intervals)
        const sortedDates = group.dates.sort((a, b) => a.getTime() - b.getTime());
        let isMonthly = true;

        for (let i = 1; i < sortedDates.length; i++) {
            const daysBetween =
                (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) /
                (1000 * 60 * 60 * 24);
            if (daysBetween < 25 || daysBetween > 35) {
                isMonthly = false;
                break;
            }
        }

        if (!isMonthly && group.amounts.length < 3) continue;

        // Format merchant name nicely
        const displayName = merchant
            .split(" ")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

        subscriptions.push({
            merchantName: displayName,
            amount: Math.round(avgAmount * 100) / 100,
            frequency: isMonthly ? "monthly" : "recurring",
            lastCharged: sortedDates[sortedDates.length - 1],
            occurrences: group.amounts.length,
            isActive: true,
        });
    }

    return subscriptions.sort((a, b) => b.amount - a.amount);
}

/**
 * Calculate total potential monthly savings from active subscriptions
 */
export function calculateSavings(
    subscriptions: DetectedSubscription[]
): number {
    return subscriptions
        .filter((s) => s.isActive)
        .reduce((total, sub) => total + sub.amount, 0);
}

/**
 * Mock subscription data for demo purposes
 */
export function getMockSubscriptions(): DetectedSubscription[] {
    return [
        {
            merchantName: "Netflix",
            amount: 15.99,
            frequency: "monthly",
            lastCharged: new Date("2026-02-15"),
            occurrences: 6,
            isActive: true,
        },
        {
            merchantName: "Spotify",
            amount: 9.99,
            frequency: "monthly",
            lastCharged: new Date("2026-02-18"),
            occurrences: 8,
            isActive: true,
        },
        {
            merchantName: "Adobe Creative Cloud",
            amount: 54.99,
            frequency: "monthly",
            lastCharged: new Date("2026-02-20"),
            occurrences: 4,
            isActive: true,
        },
        {
            merchantName: "Gym Membership",
            amount: 39.99,
            frequency: "monthly",
            lastCharged: new Date("2026-02-01"),
            occurrences: 10,
            isActive: true,
        },
        {
            merchantName: "ChatGPT Plus",
            amount: 20.0,
            frequency: "monthly",
            lastCharged: new Date("2026-02-22"),
            occurrences: 5,
            isActive: true,
        },
        {
            merchantName: "iCloud Storage",
            amount: 2.99,
            frequency: "monthly",
            lastCharged: new Date("2026-02-10"),
            occurrences: 12,
            isActive: true,
        },
        {
            merchantName: "YouTube Premium",
            amount: 13.99,
            frequency: "monthly",
            lastCharged: new Date("2026-02-25"),
            occurrences: 3,
            isActive: true,
        },
    ];
}
