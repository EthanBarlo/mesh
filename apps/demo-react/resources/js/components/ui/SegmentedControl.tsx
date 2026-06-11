import React from "react";
import { cn } from "./cn";

interface SegmentedControlProps<T extends string> {
    options: { value: T; label: React.ReactNode }[];
    value: T;
    onChange: (value: T) => void;
    "aria-label"?: string;
    className?: string;
}

/** Pill-shaped exclusive choice group with a gradient active segment. */
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
                "inline-flex items-center gap-1 p-1 rounded-xl bg-slate-800/80 border border-white/10",
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
                            "px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-900",
                            isActive
                                ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/25"
                                : "text-slate-400 hover:text-white hover:bg-white/5",
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
