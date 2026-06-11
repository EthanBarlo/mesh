import React, { useState } from "react";
import { useWire } from "@mesh/react";
import { cn } from "@/components/ui";
import {
    announceDragEnd,
    readPayload,
    useKanbanDrag,
} from "@/components/demo/Kanban/dnd";

interface ColumnProps {
    columnId: string;
    title: string;
    count: number;
}

const ACCENTS: Record<string, string> = {
    backlog: "bg-slate-400",
    "in-progress": "bg-amber-400",
    done: "bg-emerald-400",
};

/**
 * One island per column. Mesh wrappers are display:contents, so this
 * fragment's two elements — the header and the `order-1` drop tail —
 * become direct flex items of the Blade column cell, and the Blade-
 * rendered card islands (order 0) slot visually between them.
 */
const Column: React.FC<ColumnProps> = ({ columnId, title, count }) => {
    const wire = useWire();
    const drag = useKanbanDrag();
    const [over, setOver] = useState(false);

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        if (!drag) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setOver(true);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setOver(false);

        const payload = readPayload(event.dataTransfer) ?? drag;
        if (!payload) return;
        // Already the last card of this column — nothing to move.
        if (payload.fromColumnId === columnId && payload.fromPosition === count - 1) {
            announceDragEnd();
            return;
        }

        // Append; the Board clamps the position server-side.
        wire.$dispatch("kanban.card-moved", {
            cardId: payload.cardId,
            title: payload.title,
            fromColumnId: payload.fromColumnId,
            toColumnId: columnId,
            position: count,
        });
    };

    return (
        <>
            <header className="flex items-center gap-2.5 px-4 py-3 border-b border-white/5">
                <span
                    className={cn("h-2 w-2 rounded-full", ACCENTS[columnId] ?? "bg-slate-400")}
                    aria-hidden="true"
                />
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                {/* Live count — a reactive prop straight from the Board. */}
                <span className="ml-auto px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-medium tabular-nums text-slate-400">
                    {count}
                </span>
            </header>

            {/* Catch-all drop target: order-1 sorts it after every card,
                flex-1 stretches it over the column's remaining space. */}
            <div
                data-drop-tail={columnId}
                onDragOver={handleDragOver}
                onDragLeave={() => setOver(false)}
                onDrop={handleDrop}
                className={cn(
                    "order-1 flex-1 m-3 min-h-14 rounded-xl flex items-center justify-center transition-colors duration-150",
                    (drag || count === 0) && "border border-dashed border-white/10",
                    over && "border-rose-400/60 bg-rose-500/10",
                )}
            >
                {(drag || count === 0) && (
                    <span className="text-xs text-slate-500 pointer-events-none">
                        {drag ? "Drop here" : "No cards — drag one in"}
                    </span>
                )}
            </div>
        </>
    );
};

export default Column;
