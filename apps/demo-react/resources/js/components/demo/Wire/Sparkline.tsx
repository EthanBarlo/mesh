import React from "react";
import { cn } from "@/components/ui";

const W = 600;
const H = 120;
const PAD_X = 6;
const PAD_Y = 10;

export interface SparklineProps {
    values: number[];
    direction: "up" | "down" | null;
    ariaLabel: string;
    className?: string;
}

/**
 * Hand-rolled sparkline, no chart library: a polyline drawn with the
 * drafting line classes (tokens, not hex), high/low ticks on the y-axis,
 * and the current value as the one accent mark. The mark is HTML, not SVG,
 * so it stays square while the plot stretches to fit.
 */
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
                ? PAD_X + (i / (values.length - 1)) * (W - PAD_X * 2)
                : W / 2;
        const y = PAD_Y + (1 - (p - min) / range) * (H - PAD_Y * 2);
        return [x, y] as const;
    });
    const points = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const [firstX] = coords[0];
    const [lastX, lastY] = coords[coords.length - 1];
    const area = `${firstX.toFixed(1)},${H} ${points} ${lastX.toFixed(1)},${H}`;

    const pct = (n: number, of: number) => `${((n / of) * 100).toFixed(3)}%`;

    return (
        <div className={cn("spark", className)} role="img" aria-label={ariaLabel}>
            <span
                className="spark__axis"
                style={{ top: pct(PAD_Y, H) }}
                aria-hidden="true"
            >
                {max.toFixed(2)}
            </span>
            <span
                className="spark__axis"
                style={{ top: pct(H - PAD_Y, H) }}
                aria-hidden="true"
            >
                {min.toFixed(2)}
            </span>

            <div className="spark__plot">
                <svg
                    viewBox={`0 0 ${W} ${H}`}
                    preserveAspectRatio="none"
                    className="spark__svg"
                    data-draw=""
                    aria-hidden="true"
                >
                    <polygon className="fill-paper-2" points={area} />
                    <polyline className="ln" points={points} />
                </svg>
                <span
                    className="spark__mark"
                    data-direction={direction ?? "flat"}
                    style={{ left: pct(lastX, W), top: pct(lastY, H) }}
                    aria-hidden="true"
                />
            </div>
        </div>
    );
};

export default Sparkline;
