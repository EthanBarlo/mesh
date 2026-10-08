import React, { useState } from "react";
import { useWire } from "@mesh/react";
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
            <header className="lane__head">
                <span className="lane__mark" data-lane={columnId} aria-hidden="true" />
                <h3 className="lane__title">{title}</h3>
                {/* Live count: a reactive prop straight from the Board. */}
                <span className="lane__count" title={`${count} cards`}>
                    {String(count).padStart(2, "0")}
                </span>
            </header>

            {/* Catch-all drop target: order-1 sorts it after every card,
                flex-1 stretches it over the column's remaining space. */}
            <div
                data-drop-tail={columnId}
                onDragOver={handleDragOver}
                onDragLeave={() => setOver(false)}
                onDrop={handleDrop}
                className="lane__tail"
                data-armed={drag || count === 0 ? "" : undefined}
                data-over={over ? "" : undefined}
            >
                {(drag || count === 0) && (
                    <span className="k k--caps pointer-events-none">
                        {drag ? "Drop here" : "No cards. Drag one in."}
                    </span>
                )}
            </div>
        </>
    );
};

export default Column;
