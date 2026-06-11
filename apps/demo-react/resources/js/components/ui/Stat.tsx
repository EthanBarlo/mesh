import React from "react";
import { cn } from "./cn";

interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
    label: React.ReactNode;
    value: React.ReactNode;
}

/** Compact value-over-label stat tile. */
const Stat: React.FC<StatProps> = ({ label, value, className, ...rest }) => (
    <div
        className={cn(
            "p-3 rounded-lg bg-white/[0.02] border border-white/5 text-center",
            className,
        )}
        {...rest}
    >
        <p
            className="text-lg font-semibold text-white tabular-nums truncate"
            title={
                typeof value === "string" || typeof value === "number"
                    ? String(value)
                    : undefined
            }
        >
            {value}
        </p>
        <p className="mt-0.5 text-[11px] font-medium uppercase tracking-widest text-zinc-500">
            {label}
        </p>
    </div>
);

export default Stat;
