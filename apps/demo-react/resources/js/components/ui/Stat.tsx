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
            "p-3 rounded-xl bg-slate-900/50 border border-white/5 text-center",
            className,
        )}
        {...rest}
    >
        <p
            className="text-lg font-bold text-white tabular-nums truncate"
            title={
                typeof value === "string" || typeof value === "number"
                    ? String(value)
                    : undefined
            }
        >
            {value}
        </p>
        <p className="mt-0.5 text-[11px] uppercase tracking-wider text-slate-500">
            {label}
        </p>
    </div>
);

export default Stat;
