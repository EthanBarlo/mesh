import React from "react";
import { cn } from "./cn";

export type BadgeColor =
    | "rose"
    | "orange"
    | "amber"
    | "emerald"
    | "cyan"
    | "blue"
    | "violet"
    | "slate";

// Semantic colors (rose/amber/emerald) keep a restrained text accent on a
// mono chip; decorative colors all collapse to the plain mono chip.
const mono = { badge: "bg-white/5 text-zinc-300 border-white/10", dot: "bg-zinc-500" };

const colors: Record<BadgeColor, { badge: string; dot: string }> = {
    rose: { badge: "bg-white/5 text-rose-400 border-white/10", dot: "bg-rose-500" },
    orange: mono,
    amber: { badge: "bg-white/5 text-amber-400 border-white/10", dot: "bg-amber-400" },
    emerald: { badge: "bg-white/5 text-emerald-400 border-white/10", dot: "bg-emerald-400" },
    cyan: mono,
    blue: mono,
    violet: mono,
    slate: mono,
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    color?: BadgeColor;
    /** Renders a small status dot before the label. */
    dot?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
    color = "slate",
    dot = false,
    className,
    children,
    ...rest
}) => (
    <span
        className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium",
            colors[color].badge,
            className,
        )}
        {...rest}
    >
        {dot && (
            <span
                className={cn("w-1.5 h-1.5 rounded-full", colors[color].dot)}
                aria-hidden="true"
            />
        )}
        {children}
    </span>
);

export default Badge;
