import { NextResponse } from "next/server";
import { getMockForecastData } from "@/lib/forecast";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    try {
        // Clamp to 30 or 60 days
        const forecastDays = days >= 45 ? 60 : 30;

        const forecastData = getMockForecastData(forecastDays);

        // Calculate key prediction metrics
        const predictedPoints = forecastData.filter((p) => p.predicted !== null);
        const lastPredicted = predictedPoints[predictedPoints.length - 1];
        const firstPredicted = predictedPoints[0];

        const projectedBalance = lastPredicted?.predicted || 0;
        const startBalance = firstPredicted?.predicted || 0;
        const projectedChange = projectedBalance - startBalance;
        const projectedChangePercent =
            startBalance !== 0
                ? ((projectedChange / startBalance) * 100).toFixed(1)
                : "0";

        // Find potential zero-balance date
        const zeroCrossing = predictedPoints.find(
            (p) => p.predicted !== null && p.predicted <= 0
        );

        return NextResponse.json({
            forecast: forecastData,
            summary: {
                forecastDays,
                currentBalance: startBalance,
                projectedBalance: Math.round(projectedBalance * 100) / 100,
                projectedChange: Math.round(projectedChange * 100) / 100,
                projectedChangePercent,
                zeroBalanceDate: zeroCrossing?.date || null,
                avgDailyBurn:
                    predictedPoints.length > 1
                        ? Math.round(
                            (Math.abs(projectedChange) /
                                predictedPoints.length) *
                            100
                        ) / 100
                        : 0,
            },
        });
    } catch (error) {
        console.error("Prediction error:", error);
        return NextResponse.json(
            { error: "Failed to generate predictions" },
            { status: 500 }
        );
    }
}
