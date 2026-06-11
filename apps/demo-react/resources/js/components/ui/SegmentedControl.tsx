import React from "react";
import { cn } from "./cn";

interface SegmentedControlProps<T extends string> {
    options: { value: T; label: React.ReactNode }[];
    value: T;
    onChange: (value: T) => void;
    "aria-label"?: string;
    className?: string;
}

/** Pill-shaped exclusive choice group with a solid white active segment. */
function SegmentedControl<T extends string>({
    options,
    value,
    onChange,
    className,
    "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
    return (
        <div
            className={cn(
                "inline-flex items-center gap-1 p-1 rounded-lg bg-white/[0.02] border border-white/10",
                className,
            )}
            role="group"
            aria-label={ariaLabel}
        >
            {options.map((option) => {
                const isActive = option.value === value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        aria-pressed={isActive}
                        className={cn(
                            "px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-zinc-950",
                            isActive
                                ? "bg-white text-zinc-950"
                                : "text-zinc-400 hover:text-white hover:bg-white/5",
                        )}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}

export default SegmentedControl;
