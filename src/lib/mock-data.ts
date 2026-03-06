// Mock spending data for demo when no DB is configured

export interface SpendingCategory {
    name: string;
    amount: number;
    color: string;
    transactions: number;
}

export interface MockTransaction {
    id: string;
    merchantName: string;
    amount: number;
    type: "income" | "expense";
    category: string;
    date: string;
    pending: boolean;
    tags: string[];
    isFlagged: boolean;
}

export interface MockGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    icon: string;
    color: string;
    isCompleted: boolean;
}

export interface MockInsight {
    id: string;
    type: "overspending" | "saving" | "trend" | "health" | "fraud";
    title: string;
    message: string;
    severity: "info" | "warning" | "critical";
    icon: string;
}

export function getMockSpendingByCategory(): SpendingCategory[] {
    return [
        { name: "Rent", amount: 2100, color: "#FF6B6B", transactions: 1 },
        { name: "Groceries", amount: 487.32, color: "#B8FF2E", transactions: 12 },
        { name: "Transportation", amount: 342.5, color: "#00F5A0", transactions: 18 },
        { name: "Dining", amount: 278.9, color: "#FF922B", transactions: 14 },
        { name: "Entertainment", amount: 189.97, color: "#845EF7", transactions: 7 },
        { name: "Subscriptions", amount: 157.94, color: "#22B8CF", transactions: 7 },
        { name: "Shopping", amount: 234.56, color: "#F06595", transactions: 5 },
        { name: "Utilities", amount: 165.0, color: "#20C997", transactions: 3 },
    ];
}

export function getMockPreviousMonthSpending(): SpendingCategory[] {
    return [
        { name: "Rent", amount: 2100, color: "#FF6B6B", transactions: 1 },
        { name: "Groceries", amount: 412.10, color: "#B8FF2E", transactions: 10 },
        { name: "Transportation", amount: 298.75, color: "#00F5A0", transactions: 15 },
        { name: "Dining", amount: 345.60, color: "#FF922B", transactions: 18 },
        { name: "Entertainment", amount: 220.00, color: "#845EF7", transactions: 9 },
        { name: "Subscriptions", amount: 157.94, color: "#22B8CF", transactions: 7 },
        { name: "Shopping", amount: 189.99, color: "#F06595", transactions: 4 },
        { name: "Utilities", amount: 155.00, color: "#20C997", transactions: 3 },
    ];
}

export function getMockTransactions(): MockTransaction[] {
    const transactions: MockTransaction[] = [];
    const now = new Date();

    const merchants = [
        { name: "Uber", category: "Transportation", range: [8, 35] },
        { name: "Lyft", category: "Transportation", range: [10, 28] },
        { name: "Whole Foods", category: "Groceries", range: [25, 85] },
        { name: "Trader Joe's", category: "Groceries", range: [30, 65] },
        { name: "Chipotle", category: "Dining", range: [12, 22] },
        { name: "Starbucks", category: "Dining", range: [5, 12] },
        { name: "DoorDash", category: "Dining", range: [18, 45] },
        { name: "Amazon", category: "Shopping", range: [15, 120] },
        { name: "Netflix", category: "Subscriptions", range: [15.99, 15.99] },
        { name: "Spotify", category: "Subscriptions", range: [9.99, 9.99] },
        { name: "Adobe Creative Cloud", category: "Subscriptions", range: [54.99, 54.99] },
        { name: "AMC Theatres", category: "Entertainment", range: [15, 30] },
        { name: "Steam", category: "Entertainment", range: [20, 60] },
        { name: "Con Edison", category: "Utilities", range: [85, 120] },
        { name: "Verizon", category: "Utilities", range: [45, 45] },
    ];

    const tagOptions = ["work", "personal", "travel", "essential", "luxury"];

    // Seed random for consistency
    let seed = 42;
    const seededRandom = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
    };

    for (let day = 0; day < 90; day++) {
        const date = new Date(now);
        date.setDate(date.getDate() - day);

        // 2-5 transactions per day
        const txCount = 2 + Math.floor(seededRandom() * 4);
        for (let t = 0; t < txCount; t++) {
            const merchant = merchants[Math.floor(seededRandom() * merchants.length)];
            const amount = merchant.range[0] + seededRandom() * (merchant.range[1] - merchant.range[0]);

            // Random tags (0-2 tags)
            const numTags = Math.floor(seededRandom() * 3);
            const txTags: string[] = [];
            for (let i = 0; i < numTags; i++) {
                const tag = tagOptions[Math.floor(seededRandom() * tagOptions.length)];
                if (!txTags.includes(tag)) txTags.push(tag);
            }

            transactions.push({
                id: `tx-${day}-${t}`,
                merchantName: merchant.name,
                amount: -Math.round(amount * 100) / 100,
                type: "expense",
                category: merchant.category,
                date: date.toISOString(),
                pending: day === 0 && seededRandom() > 0.7,
                tags: txTags,
                isFlagged: false,
            });
        }

        // Add rent on the 1st
        if (date.getDate() === 1) {
            transactions.push({
                id: `tx-rent-${day}`,
                merchantName: "Landlord - Rent",
                amount: -2100,
                type: "expense",
                category: "Rent",
                date: date.toISOString(),
                pending: false,
                tags: ["essential"],
                isFlagged: false,
            });
        }

        // Add income on the 15th (salary)
        if (date.getDate() === 15) {
            transactions.push({
                id: `tx-salary-${day}`,
                merchantName: "Employer - Salary",
                amount: 5200,
                type: "income",
                category: "Income",
                date: date.toISOString(),
                pending: false,
                tags: ["work"],
                isFlagged: false,
            });
        }
    }

    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getMockAccountBalance(): number {
    return 8247.63;
}

export function getMockMonthlyIncome(): number {
    return 5200;
}

export function getMockAccounts() {
    return [
        {
            id: "acc-1",
            name: "Chase Checking",
            type: "checking",
            balance: 5847.63,
            institution: "Chase",
        },
        {
            id: "acc-2",
            name: "Chase Savings",
            type: "savings",
            balance: 2400.0,
            institution: "Chase",
        },
    ];
}

export function getMockGoals(): MockGoal[] {
    return [
        {
            id: "goal-1",
            name: "Travel Fund",
            targetAmount: 50000,
            currentAmount: 22500,
            deadline: "2026-09-01",
            icon: "Plane",
            color: "#00F5A0",
            isCompleted: false,
        },
        {
            id: "goal-2",
            name: "Emergency Fund",
            targetAmount: 100000,
            currentAmount: 67000,
            deadline: "2026-12-31",
            icon: "Shield",
            color: "#38BDF8",
            isCompleted: false,
        },
        {
            id: "goal-3",
            name: "New Laptop",
            targetAmount: 15000,
            currentAmount: 15000,
            deadline: "2026-02-01",
            icon: "Laptop",
            color: "#A78BFA",
            isCompleted: true,
        },
        {
            id: "goal-4",
            name: "Investment Portfolio",
            targetAmount: 200000,
            currentAmount: 45000,
            deadline: "2027-06-01",
            icon: "TrendingUp",
            color: "#B8FF2E",
            isCompleted: false,
        },
    ];
}

export function getMockInsights(): MockInsight[] {
    return [
        {
            id: "insight-1",
            type: "overspending",
            title: "Dining spending up 23%",
            message: "You've spent $278.90 on dining this month, up from $226.75 last month. Consider meal prepping to save ~$120/month.",
            severity: "warning",
            icon: "TrendingUp",
        },
        {
            id: "insight-2",
            type: "saving",
            title: "Cancel unused subscriptions",
            message: "You have 3 subscriptions you haven't used in 30+ days. Cancelling could save $86.97/month.",
            severity: "info",
            icon: "Scissors",
        },
        {
            id: "insight-3",
            type: "trend",
            title: "Groceries trending lower",
            message: "Your grocery spending decreased 8% this month. Great job sticking to your list! 🎉",
            severity: "info",
            icon: "TrendingDown",
        },
        {
            id: "insight-4",
            type: "health",
            title: "Savings rate: 22%",
            message: "You're saving $1,144 per month. That's above the recommended 20% threshold. Keep it up!",
            severity: "info",
            icon: "Heart",
        },
        {
            id: "insight-5",
            type: "fraud",
            title: "Unusual activity detected",
            message: "A $1,249.99 purchase at 'Luxury Electronics Co.' is significantly above your typical shopping spend.",
            severity: "critical",
            icon: "AlertTriangle",
        },
    ];
}

export function getMockTags() {
    return [
        { id: "tag-1", name: "work", color: "#38BDF8" },
        { id: "tag-2", name: "personal", color: "#A78BFA" },
        { id: "tag-3", name: "travel", color: "#FB923C" },
        { id: "tag-4", name: "essential", color: "#22C55E" },
        { id: "tag-5", name: "luxury", color: "#F43F5E" },
        { id: "tag-6", name: "recurring", color: "#06B6D4" },
    ];
}
