"use client";

interface RadialGaugeProps {
    value: number; // 0–100
    size?: number;
    strokeWidth?: number;
    label?: string;
    sublabel?: string;
    color?: string;
}

export function RadialGauge({
    value,
    size = 160,
    strokeWidth = 12,
    label,
    sublabel,
    color = "#00F5A0",
}: RadialGaugeProps) {
    const clampedValue = Math.min(Math.max(value, 0), 100);
    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - clampedValue / 100);

    // Color gradient based on value
    const getColor = () => {
        if (color) return color;
        if (clampedValue >= 80) return "#00F5A0";
        if (clampedValue >= 60) return "#B8FF2E";
        if (clampedValue >= 40) return "#FBBF24";
        if (clampedValue >= 20) return "#FB923C";
        return "#EF4444";
    };

    const activeColor = getColor();

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="transform -rotate-90"
                >
                    {/* Background track */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="#1E293B"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                    />

                    {/* Active arc */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke={activeColor}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1500 ease-out"
                        style={{
                            filter: `drop-shadow(0 0 6px ${activeColor}60)`,
                        }}
                    />

                    {/* Glow effect */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke={activeColor}
                        strokeWidth={strokeWidth + 4}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        opacity="0.15"
                        className="transition-all duration-1500 ease-out"
                    />
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                        className="text-3xl font-bold"
                        style={{ color: activeColor }}
                    >
                        {clampedValue}
                    </span>
                    {sublabel && (
                        <span className="text-[10px] text-muted uppercase tracking-wider mt-0.5">
                            {sublabel}
                        </span>
                    )}
                </div>
            </div>

            {label && (
                <span className="text-sm font-medium text-foreground mt-3">
                    {label}
                </span>
            )}
        </div>
    );
}
