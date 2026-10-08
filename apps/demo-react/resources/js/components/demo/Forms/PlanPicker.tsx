import React from "react";
import { cn } from "@/components/ui";

export interface Plan {
    id: "starter" | "pro" | "team";
    label: string;
    price: string;
    blurb: string;
}

interface PlanPickerProps {
    plans: Plan[];
    value: string;
    onChange: (id: Plan["id"]) => void;
    className?: string;
}

/** Option boxes for picking a plan — sr-only radios behind drawn labels. */
const PlanPicker: React.FC<PlanPickerProps> = ({
    plans,
    value,
    onChange,
    className,
}) => (
    <fieldset className={cn(className)}>
        <legend className="mb-1.5 block font-mono text-[0.6875rem] leading-normal tracking-[0.1em] text-ink-2 uppercase">
            Plan
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {plans.map((p) => {
                const selected = value === p.id;
                return (
                    <label
                        key={p.id}
                        data-selected={selected}
                        className={cn(
                            "plan-opt relative block cursor-pointer border p-4 transition-colors duration-150 motion-reduce:transition-none",
                            selected
                                ? "border-ink bg-paper-2"
                                : "border-line-2 bg-paper hover:border-line-3",
                        )}
                    >
                        <input
                            type="radio"
                            name="plan"
                            value={p.id}
                            checked={selected}
                            onChange={() => onChange(p.id)}
                            className="sr-only"
                        />
                        <span className="flex items-center gap-2.5">
                            <span className="plan-opt__box" aria-hidden="true" />
                            <span className="text-sm font-semibold text-ink">
                                {p.label}
                            </span>
                            <span
                                className={cn(
                                    "ml-auto font-mono text-xs tabular-nums",
                                    selected ? "text-ink" : "text-ink-3",
                                )}
                            >
                                {p.price}
                            </span>
                        </span>
                        <span className="mt-1.5 block pl-6 text-xs leading-snug text-ink-3">
                            {p.blurb}
                        </span>
                    </label>
                );
            })}
        </div>
    </fieldset>
);

export default PlanPicker;
