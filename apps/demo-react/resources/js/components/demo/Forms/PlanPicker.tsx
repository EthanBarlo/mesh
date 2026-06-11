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

/** Radio-card grid for picking a plan — sr-only radios behind styled labels. */
const PlanPicker: React.FC<PlanPickerProps> = ({
    plans,
    value,
    onChange,
    className,
}) => (
    <fieldset className={cn(className)}>
        <legend className="block text-sm font-medium text-zinc-300 mb-1.5">
            Plan
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {plans.map((p) => {
                const selected = value === p.id;
                return (
                    <label
                        key={p.id}
                        className={cn(
                            "relative cursor-pointer rounded-lg border p-4 transition-colors duration-150",
                            selected
                                ? "border-white/20 bg-white/[0.05]"
                                : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]",
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
                        <span className="flex items-baseline justify-between">
                            <span
                                className={cn(
                                    "text-sm font-semibold",
                                    selected ? "text-white" : "text-zinc-300",
                                )}
                            >
                                {p.label}
                            </span>
                            <span
                                className={cn(
                                    "text-xs font-medium tabular-nums",
                                    selected ? "text-white" : "text-zinc-500",
                                )}
                            >
                                {p.price}
                            </span>
                        </span>
                        <span className="mt-1 block text-xs text-zinc-500 leading-snug">
                            {p.blurb}
                        </span>
                        {selected && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] text-zinc-950">
                                ✓
                            </span>
                        )}
                    </label>
                );
            })}
        </div>
    </fieldset>
);

export default PlanPicker;
