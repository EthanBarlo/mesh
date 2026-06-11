import React from "react";
import { cn } from "./cn";

interface ProgressBarProps {
    /** Percentage, 0–100. */
    value: number;
    className?: string;
    "aria-label"?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    className,
    "aria-label": ariaLabel,
}) => (
    <div
        className={cn(
            "h-2.5 overflow-hidden rounded-full bg-white/5",
            className,
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
    >
        <div
            className="h-full rounded-full bg-white transition-[width] duration-200"
            style={{ width: `${value}%` }}
        />
    </div>
);

export default ProgressBar;
