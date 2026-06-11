import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/components/ui";
import CardItem from "./CardItem";
import type { Column as ColumnType } from "./types";

const ACCENTS: Record<string, string> = {
    backlog: "bg-slate-400",
    "in-progress": "bg-amber-400",
    done: "bg-emerald-400",
};

interface ColumnProps {
    column: ColumnType;
}

const Column: React.FC<ColumnProps> = ({ column }) => {
    // The column itself is a droppable so cards can land in an empty list.
    const { setNodeRef, isOver } = useDroppable({ id: column.id });

    return (
        <div className="flex flex-col rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden">
            <header className="flex items-center gap-2.5 px-4 py-3 border-b border-white/5">
                <span
                    className={cn("h-2 w-2 rounded-full", ACCENTS[column.id] ?? "bg-slate-400")}
                    aria-hidden="true"
                />
                <h3 className="text-sm font-semibold text-white">{column.title}</h3>
                <span className="ml-auto px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-medium tabular-nums text-slate-400">
                    {column.cards.length}
                </span>
            </header>

            <SortableContext items={column.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
                <ul
                    ref={setNodeRef}
                    className={cn(
                        "flex-1 p-3 space-y-2.5 min-h-36 transition-colors duration-150",
                        isOver && "bg-rose-500/5",
                    )}
                    aria-label={`${column.title} column`}
                >
                    {column.cards.map((card) => (
                        <CardItem key={card.id} card={card} />
                    ))}

                    {column.cards.length === 0 && (
                        <li className="flex items-center justify-center h-24 rounded-xl border border-dashed border-white/10 text-xs text-slate-500">
                            Drop cards here
                        </li>
                    )}
                </ul>
            </SortableContext>
        </div>
    );
};

export default Column;
