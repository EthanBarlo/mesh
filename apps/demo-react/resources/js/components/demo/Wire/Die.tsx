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

/** A single die face: a square drawn in ink with pips on a 3x3 grid. */
const Die: React.FC<DieProps> = ({ value, className }) => (
    <div
        className={cn(
            "grid size-14 grid-cols-3 grid-rows-3 border border-ink bg-paper p-2.5",
            className,
        )}
        role="img"
        aria-label={`Die showing ${value}`}
    >
        {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className="flex items-center justify-center">
                {(PIPS[value] ?? []).includes(i) && (
                    <span className="size-2 rounded-full bg-ink" />
                )}
            </span>
        ))}
    </div>
);

export default Die;
