import React from "react";
import { cn } from "./cn";

interface ProgressBarProps {
    /** Percentage, 0–100. */
    value: number;
    className?: string;
    "aria-label"?: string;
    /** The fill: the accent (default) or ink. */
    tone?: "accent" | "ink";
}

/** A ruler: a hairline baseline with quarter ticks and a filled bar along it. */
const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    className,
    "aria-label": ariaLabel,
    tone = "accent",
}) => (
    <div
        className={cn("relative h-2.5", className)}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
    >
        <span
            aria-hidden="true"
            className="ui-progress__ticks absolute inset-x-0 bottom-0 h-[5px]"
        />
        <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-px bg-line-3"
        />
        <span
            aria-hidden="true"
            className={cn(
                "absolute bottom-0 left-0 h-1 transition-[width] duration-200 ease-(--ease-out) motion-reduce:transition-none",
                tone === "ink" ? "bg-ink" : "bg-accent",
            )}
            style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
    </div>
);

export default ProgressBar;
