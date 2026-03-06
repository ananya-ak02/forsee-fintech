import { NextResponse } from "next/server";

export async function POST() {
    const clientId = process.env.PLAID_CLIENT_ID;
    const secret = process.env.PLAID_SECRET;
    const plaidEnv = process.env.PLAID_ENV || "sandbox";

    if (!clientId || !secret) {
        return NextResponse.json(
            {
                error: "Plaid credentials not configured",
                linkToken: "sandbox-demo-token",
                demo: true,
            },
            { status: 200 }
        );
    }

    try {
        const baseUrl =
            plaidEnv === "production"
                ? "https://production.plaid.com"
                : plaidEnv === "development"
                    ? "https://development.plaid.com"
                    : "https://sandbox.plaid.com";

        const response = await fetch(`${baseUrl}/link/token/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                client_id: clientId,
                secret: secret,
                user: { client_user_id: "demo-user" },
                client_name: "Foresee",
                products: ["transactions"],
                country_codes: ["US"],
                language: "en",
            }),
        });

        const data = await response.json();

        if (data.link_token) {
            return NextResponse.json({ linkToken: data.link_token });
        } else {
            return NextResponse.json(
                { error: "Failed to create link token", details: data },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Plaid error:", error);
        return NextResponse.json(
            { error: "Failed to create link token" },
            { status: 500 }
        );
    }
}
