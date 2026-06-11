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

const colors: Record<BadgeColor, { badge: string; dot: string }> = {
    rose: { badge: "bg-rose-500/10 text-rose-300 border-rose-500/30", dot: "bg-rose-400" },
    orange: { badge: "bg-orange-500/10 text-orange-300 border-orange-500/30", dot: "bg-orange-400" },
    amber: { badge: "bg-amber-500/10 text-amber-300 border-amber-500/30", dot: "bg-amber-400" },
    emerald: { badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30", dot: "bg-emerald-400" },
    cyan: { badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30", dot: "bg-cyan-400" },
    blue: { badge: "bg-blue-500/10 text-blue-300 border-blue-500/30", dot: "bg-blue-400" },
    violet: { badge: "bg-violet-500/10 text-violet-300 border-violet-500/30", dot: "bg-violet-400" },
    slate: { badge: "bg-slate-500/10 text-slate-300 border-slate-500/30", dot: "bg-slate-400" },
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
