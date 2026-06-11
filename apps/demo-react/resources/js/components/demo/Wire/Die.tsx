import React from "react";
import { cn } from "@/components/ui";

// Pip positions on a 3x3 grid for each die face.
const PIPS: Record<number, number[]> = {
    1: [4],
    2: [2, 6],
    3: [2, 4, 6],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
};

export interface DieProps {
    value: number;
    className?: string;
}

/** A single die face rendered as pips on a 3x3 grid. */
const Die: React.FC<DieProps> = ({ value, className }) => (
    <div
        className={cn(
            "w-14 h-14 rounded-xl bg-slate-700/60 border border-white/10 grid grid-cols-3 grid-rows-3 p-2.5 shadow-inner",
            className,
        )}
        role="img"
        aria-label={`Die showing ${value}`}
    >
        {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className="flex items-center justify-center">
                {(PIPS[value] ?? []).includes(i) && (
                    <span className="w-2 h-2 rounded-full bg-white" />
                )}
            </span>
        ))}
    </div>
);

export default Die;
