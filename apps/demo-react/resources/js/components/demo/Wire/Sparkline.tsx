import React from "react";
import { cn } from "@/components/ui";

const W = 600;
const H = 120;
const PAD = 6;

export interface SparklineProps {
    values: number[];
    direction: "up" | "down" | null;
    ariaLabel: string;
    className?: string;
}

/** Hand-rolled sparkline — no chart library, just a polyline. */
const Sparkline: React.FC<SparklineProps> = ({
    values,
    direction,
    ariaLabel,
    className,
}) => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const coords = values.map((p, i) => {
        const x =
            values.length > 1
                ? PAD + (i / (values.length - 1)) * (W - PAD * 2)
                : W / 2;
        const y = PAD + (1 - (p - min) / range) * (H - PAD * 2);
        return [x, y] as const;
    });
    const points = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const area = `${PAD},${H - PAD} ${points} ${(W - PAD).toFixed(1)},${H - PAD}`;
    const [lastX, lastY] = coords[coords.length - 1];

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className={cn("w-full h-28", className)}
            role="img"
            aria-label={ariaLabel}
        >
            <defs>
                <linearGradient id="price-watcher-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fafafa" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#fafafa" stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={area} fill="url(#price-watcher-fill)" />
            <polyline
                points={points}
                fill="none"
                stroke="#a1a1aa"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
            />
            <circle
                cx={lastX}
                cy={lastY}
                r="4"
                fill={direction === "down" ? "#fb7185" : "#34d399"}
                stroke="#09090b"
                strokeWidth="2"
            />
        </svg>
    );
};

export default Sparkline;
