import React from "react";
import { cn } from "./cn";

interface SegmentedControlProps<T extends string> {
    options: { value: T; label: React.ReactNode }[];
    value: T;
    onChange: (value: T) => void;
    "aria-label"?: string;
    className?: string;
}

/**
 * An exclusive choice drawn like the docs' renderer switch: an ink frame of
 * equal mono cells, with a solid ink block that slides to the active one.
 */
function SegmentedControl<T extends string>({
    options,
    value,
    onChange,
    className,
    "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
    const active = options.findIndex((option) => option.value === value);

    return (
        <div
            className={cn(
                "relative isolate inline-grid auto-cols-fr grid-flow-col border border-ink bg-paper",
                className,
            )}
            role="group"
            aria-label={ariaLabel}
        >
            <span
                aria-hidden="true"
                className={cn(
                    "absolute inset-y-0 left-0 -z-10 bg-ink transition-transform duration-320 ease-(--ease-spring) motion-reduce:transition-none",
                    active < 0 && "opacity-0",
                )}
                style={{
                    width: `${100 / Math.max(options.length, 1)}%`,
                    transform: `translateX(${Math.max(active, 0) * 100}%)`,
                }}
            />
            {options.map((option, index) => {
                const isActive = index === active;
                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        aria-pressed={isActive}
                        className={cn(
                            "min-h-10 whitespace-nowrap px-3 font-mono text-[11px] uppercase tracking-[0.06em] transition-colors duration-240 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none sm:min-h-8",
                            isActive ? "text-paper" : "text-ink-2 hover:text-ink",
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
