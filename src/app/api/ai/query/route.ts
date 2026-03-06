import { NextResponse } from "next/server";
import { getMockTransactions, getMockSpendingByCategory } from "@/lib/mock-data";

export async function POST(request: Request) {
    try {
        const { question } = await request.json();

        if (!question) {
            return NextResponse.json(
                { error: "Question is required" },
                { status: 400 }
            );
        }

        // Gather financial context
        const transactions = getMockTransactions().slice(0, 100);
        const categories = getMockSpendingByCategory();

        const totalSpending = categories.reduce((sum, c) => sum + c.amount, 0);

        const contextSummary = `
User's Financial Summary (Last 30 Days):
- Total Spending: $${totalSpending.toFixed(2)}
- Categories: ${categories.map((c) => `${c.name}: $${c.amount.toFixed(2)} (${c.transactions} transactions)`).join(", ")}
- Recent Transactions: ${transactions.slice(0, 20).map((t) => `${t.merchantName}: $${Math.abs(t.amount).toFixed(2)} on ${new Date(t.date).toLocaleDateString()}`).join("; ")}
`;

        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            // Demo mode: provide a smart mock response
            const answer = generateMockResponse(question, categories, totalSpending);
            return NextResponse.json({ answer });
        }

        // Call OpenAI
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
                            content: `You are Foresee AI, a friendly and insightful financial assistant. You help users understand their spending habits, find savings opportunities, and make better financial decisions. You have access to the user's transaction data. Be concise, use specific numbers from the data, and give actionable advice. Format currency as USD. Keep responses under 150 words.`,
                        },
                        {
                            role: "user",
                            content: `Here is my financial data:\n${contextSummary}\n\nMy question: ${question}`,
                        },
                    ],
                    temperature: 0.7,
                    max_tokens: 300,
                }),
            }
        );

        const data = await openaiResponse.json();

        if (data.choices?.[0]?.message?.content) {
            return NextResponse.json({
                answer: data.choices[0].message.content,
            });
        }

        return NextResponse.json(
            { error: "Failed to get AI response" },
            { status: 500 }
        );
    } catch (error) {
        console.error("AI query error:", error);
        return NextResponse.json(
            { error: "Failed to process your question" },
            { status: 500 }
        );
    }
}

function generateMockResponse(
    question: string,
    categories: { name: string; amount: number; transactions: number }[],
    totalSpending: number
): string {
    const q = question.toLowerCase();

    if (q.includes("uber") || q.includes("transportation") || q.includes("ride")) {
        const transport = categories.find((c) => c.name === "Transportation");
        return `Based on your transaction history, you've spent **$${transport?.amount.toFixed(2) || "342.50"}** on transportation this month across ${transport?.transactions || 18} rides. That's about **${((transport?.amount || 342.5) / totalSpending * 100).toFixed(1)}%** of your total spending. Consider using public transit or carpooling to save around $150-200/month. 🚗💡`;
    }

    if (q.includes("grocery") || q.includes("groceries") || q.includes("food")) {
        const groceries = categories.find((c) => c.name === "Groceries");
        const dining = categories.find((c) => c.name === "Dining");
        return `Your food spending breakdown: **Groceries: $${groceries?.amount.toFixed(2) || "487.32"}** (${groceries?.transactions || 12} trips) and **Dining Out: $${dining?.amount.toFixed(2) || "278.90"}** (${dining?.transactions || 14} orders). That's **$${((groceries?.amount || 0) + (dining?.amount || 0)).toFixed(2)}** total on food. Try meal prepping to cut dining expenses by 40%! 🥗`;
    }

    if (q.includes("save") || q.includes("saving") || q.includes("cut")) {
        return `Here are your top saving opportunities:\n\n1. **Subscriptions**: You're paying ~$157.94/month. Cancel unused ones to save ~$60/month\n2. **Dining Out**: $278.90 this month — cooking more could save $150+\n3. **Transportation**: $342.50 — mixing in public transit could save $100+\n\nTotal potential savings: **$310+/month** or **$3,720/year**! 💰`;
    }

    if (q.includes("spend") || q.includes("spending") || q.includes("expense")) {
        return `Your total spending this month is **$${totalSpending.toFixed(2)}**. Your top 3 categories are:\n\n1. 🏠 **Rent**: $2,100 (${(2100 / totalSpending * 100).toFixed(1)}%)\n2. 🛒 **Groceries**: $487.32 (${(487.32 / totalSpending * 100).toFixed(1)}%)\n3. 🚗 **Transportation**: $342.50 (${(342.5 / totalSpending * 100).toFixed(1)}%)\n\nYour non-essential spending is well within a healthy range. Keep it up! ✨`;
    }

    if (q.includes("subscription") || q.includes("netflix") || q.includes("recurring")) {
        return `I've detected **7 active subscriptions** totaling **$157.94/month**:\n\n• Adobe Creative Cloud: $54.99\n• Gym Membership: $39.99\n• ChatGPT Plus: $20.00\n• Netflix: $15.99\n• YouTube Premium: $13.99\n• Spotify: $9.99\n• iCloud Storage: $2.99\n\nConsider reviewing if you actively use all of them! 📋`;
    }

    return `Great question! Based on your financial data, your total monthly spending is **$${totalSpending.toFixed(2)}** across ${categories.length} categories. Your largest expenses are Rent ($2,100), Groceries ($487.32), and Transportation ($342.50). Would you like me to dig deeper into any specific category or help you find ways to save? 📊`;
}
