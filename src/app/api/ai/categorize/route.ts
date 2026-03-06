import { NextResponse } from "next/server";

// Rule-based category mapping
const MERCHANT_CATEGORIES: Record<string, string> = {
    // Food & Dining
    "uber eats": "Food",
    "doordash": "Food",
    "grubhub": "Food",
    "starbucks": "Food",
    "chipotle": "Food",
    "mcdonald": "Food",
    "subway": "Food",
    "pizza": "Food",
    "restaurant": "Food",
    "cafe": "Food",
    "bakery": "Food",

    // Groceries
    "whole foods": "Food",
    "trader joe": "Food",
    "walmart": "Shopping",
    "target": "Shopping",
    "costco": "Food",
    "kroger": "Food",

    // Transport
    "uber": "Transport",
    "lyft": "Transport",
    "gas": "Transport",
    "shell": "Transport",
    "chevron": "Transport",
    "parking": "Transport",
    "transit": "Transport",
    "metro": "Transport",

    // Entertainment
    "netflix": "Entertainment",
    "spotify": "Entertainment",
    "youtube": "Entertainment",
    "hulu": "Entertainment",
    "disney": "Entertainment",
    "amc": "Entertainment",
    "steam": "Entertainment",
    "playstation": "Entertainment",
    "xbox": "Entertainment",

    // Shopping
    "amazon": "Shopping",
    "ebay": "Shopping",
    "etsy": "Shopping",
    "apple": "Shopping",
    "best buy": "Shopping",
    "nike": "Shopping",
    "zara": "Shopping",

    // Bills
    "electric": "Bills",
    "water": "Bills",
    "internet": "Bills",
    "phone": "Bills",
    "insurance": "Bills",
    "verizon": "Bills",
    "at&t": "Bills",
    "comcast": "Bills",
    "con edison": "Bills",
    "rent": "Bills",
    "landlord": "Bills",

    // Investments
    "robinhood": "Investments",
    "fidelity": "Investments",
    "vanguard": "Investments",
    "coinbase": "Investments",
    "schwab": "Investments",

    // Health
    "pharmacy": "Health",
    "cvs": "Health",
    "walgreens": "Health",
    "hospital": "Health",
    "doctor": "Health",
    "gym": "Health",

    // Subscriptions
    "adobe": "Entertainment",
    "chatgpt": "Entertainment",
    "icloud": "Bills",
    "google storage": "Bills",
};

function categorizeByRules(merchantName: string): string | null {
    const lower = merchantName.toLowerCase();

    for (const [keyword, category] of Object.entries(MERCHANT_CATEGORIES)) {
        if (lower.includes(keyword)) {
            return category;
        }
    }

    return null;
}

export async function POST(request: Request) {
    try {
        const { transactions } = await request.json();

        if (
            !transactions ||
            !Array.isArray(transactions) ||
            transactions.length === 0
        ) {
            return NextResponse.json(
                { error: "Transactions array is required" },
                { status: 400 }
            );
        }

        // First pass: rule-based categorization
        const results = transactions.map(
            (tx: { merchantName: string; amount: number; id?: string }) => {
                const ruleCategory = categorizeByRules(tx.merchantName);
                return {
                    id: tx.id,
                    merchantName: tx.merchantName,
                    amount: tx.amount,
                    suggestedCategory: ruleCategory || "Other",
                    confidence: ruleCategory ? 0.9 : 0.3,
                    method: ruleCategory ? "rule" : "unknown",
                };
            }
        );

        // Second pass: use OpenAI for uncategorized transactions
        const apiKey = process.env.OPENAI_API_KEY;
        const unknowns = results.filter((r) => r.method === "unknown");

        if (apiKey && unknowns.length > 0) {
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
                                        'You are a transaction categorizer. Categorize each merchant into exactly one of: Food, Transport, Shopping, Entertainment, Bills, Investments, Health, Education, Other. Return a JSON array of objects with {merchantName, category}.',
                                },
                                {
                                    role: "user",
                                    content: `Categorize these merchants: ${unknowns.map((u) => u.merchantName).join(", ")}`,
                                },
                            ],
                            temperature: 0.3,
                            max_tokens: 300,
                        }),
                    }
                );

                const data = await openaiResponse.json();
                if (data.choices?.[0]?.message?.content) {
                    try {
                        const parsed = JSON.parse(data.choices[0].message.content);
                        if (Array.isArray(parsed)) {
                            for (const item of parsed) {
                                const match = results.find(
                                    (r) =>
                                        r.merchantName.toLowerCase() ===
                                        item.merchantName?.toLowerCase()
                                );
                                if (match) {
                                    match.suggestedCategory = item.category;
                                    match.confidence = 0.75;
                                    match.method = "ai";
                                }
                            }
                        }
                    } catch {
                        // Keep rule-based results
                    }
                }
            } catch {
                // Keep rule-based results
            }
        }

        return NextResponse.json({ categorized: results });
    } catch (error) {
        console.error("Categorization error:", error);
        return NextResponse.json(
            { error: "Failed to categorize transactions" },
            { status: 500 }
        );
    }
}
