import React from "react";
import { cn } from "./cn";

interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
    label: React.ReactNode;
    value: React.ReactNode;
}

/** A title-block cell: a mono label over the value. */
const Stat: React.FC<StatProps> = ({ label, value, className, ...rest }) => (
    <div
        className={cn(
            "min-w-0 border border-line-2 bg-paper px-3 pt-2 pb-2.5",
            className,
        )}
        {...rest}
    >
        <p className="truncate font-mono text-[10px] uppercase leading-normal tracking-[0.1em] text-ink-3">
            {label}
        </p>
        <p
            className="mt-0.5 truncate text-lg font-semibold leading-snug tracking-[-0.02em] tabular-nums text-ink"
            title={
                typeof value === "string" || typeof value === "number"
                    ? String(value)
                    : undefined
            }
        >
            {value}
        </p>
    </div>
);

export default Stat;
