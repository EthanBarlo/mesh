import React, { useRef, useState } from "react";
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    MeasuringStrategy,
    PointerSensor,
    closestCorners,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useEntangle, useWire } from "@mesh/react";
import Column from "./Column";
import { CardFace } from "./CardItem";
import type { Card, Column as ColumnType } from "./types";

interface KanbanProps {
    syncCount: number;
    lastSyncAt: string;
}

interface KanbanWire {
    moveCard: (cardId: string, fromCol: string, toCol: string, position: number) => Promise<void>;
    resetBoard: () => Promise<void>;
}

/** Find the column that *is* the id, or the column *containing* the card id. */
const findColumn = (columns: ColumnType[], id: string): ColumnType | undefined =>
    columns.find((column) => column.id === id) ??
    columns.find((column) => column.cards.some((card) => card.id === id));

const Kanban: React.FC<KanbanProps> = ({ syncCount, lastSyncAt }) => {
    // Single source of board state, two-way bound to the Livewire property.
    // Deferred: local drags update instantly, then batch with the moveCard call.
    const [columns, setColumns] = useEntangle<ColumnType[]>("columns");
    const wire = useWire<KanbanWire>();

    const [activeCard, setActiveCard] = useState<Card | null>(null);
    const [resetting, setResetting] = useState(false);
    const originColumnRef = useRef<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const board = columns ?? [];

    const handleDragStart = ({ active }: DragStartEvent) => {
        const activeId = String(active.id);
        const column = findColumn(board, activeId);

        originColumnRef.current = column?.id ?? null;
        setActiveCard(column?.cards.find((card) => card.id === activeId) ?? null);
    };

    // Move the card between columns *while* dragging so the target list opens up.
    const handleDragOver = ({ active, over }: DragOverEvent) => {
        if (!over) return;

        const activeId = String(active.id);
        const overId = String(over.id);

        setColumns((current) => {
            const fromColumn = findColumn(current, activeId);
            const toColumn = findColumn(current, overId);

            if (!fromColumn || !toColumn || fromColumn.id === toColumn.id) {
                return current;
            }

            const card = fromColumn.cards.find((c) => c.id === activeId);
            if (!card) return current;

            const overIndex = toColumn.cards.findIndex((c) => c.id === overId);
            const insertAt = overIndex >= 0 ? overIndex : toColumn.cards.length;

            return current.map((column) => {
                if (column.id === fromColumn.id) {
                    return { ...column, cards: column.cards.filter((c) => c.id !== activeId) };
                }
                if (column.id === toColumn.id) {
                    const cards = [...column.cards];
                    cards.splice(insertAt, 0, card);
                    return { ...column, cards };
                }
                return column;
            });
        });
    };

    const handleDragEnd = async ({ active, over }: DragEndEvent) => {
        setActiveCard(null);

        const fromColumnId = originColumnRef.current;
        originColumnRef.current = null;

        if (!over || !fromColumnId) return;

        const activeId = String(active.id);
        const overId = String(over.id);

        // By drop time, cross-column moves already happened in handleDragOver —
        // the card now lives in its destination column.
        const column = findColumn(board, activeId);
        if (!column) return;

        const oldIndex = column.cards.findIndex((card) => card.id === activeId);
        const overIndex = column.cards.findIndex((card) => card.id === overId);

        let position = oldIndex;

        if (overIndex >= 0 && overIndex !== oldIndex) {
            // Reorder within the destination column for instant feedback.
            position = overIndex;
            setColumns((current) =>
                current.map((c) =>
                    c.id === column.id ? { ...c, cards: arrayMove(c.cards, oldIndex, overIndex) } : c,
                ),
            );
        }

        // Dropped back exactly where it started — nothing to confirm.
        if (fromColumnId === column.id && (overIndex === -1 || overIndex === oldIndex)) {
            return;
        }

        // Confirm server-side: the deferred entangle batches with this call, then
        // moveCard normalizes, persists to the session, and bumps the sync badge.
        await wire.$call("moveCard", activeId, fromColumnId, column.id, position);
    };

    const handleDragCancel = () => {
        setActiveCard(null);
        originColumnRef.current = null;
    };

    const handleReset = async () => {
        setResetting(true);
        try {
            // The server reseeds $columns; the entangle $watch pushes the fresh
            // board back into React state — no manual refetch needed.
            await wire.$call("resetBoard");
        } finally {
            setResetting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400">
                    <span
                        className={`h-1.5 w-1.5 rounded-full ${syncCount > 0 ? "bg-emerald-400" : "bg-slate-500"}`}
                        aria-hidden="true"
                    />
                    {syncCount > 0 ? (
                        <span>
                            Synced <span className="font-semibold text-slate-200 tabular-nums">{syncCount}</span>{" "}
                            {syncCount === 1 ? "move" : "moves"} · last{" "}
                            <span className="font-mono text-slate-300">{lastSyncAt}</span>
                        </span>
                    ) : (
                        <span>No moves synced yet — drag a card</span>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleReset}
                    disabled={resetting}
                    className="px-4 py-2 rounded-xl bg-slate-800/80 border border-white/10 text-sm font-medium text-slate-300 hover:bg-slate-700/80 hover:text-white active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                    {resetting ? "Resetting…" : "Reset board"}
                </button>
            </div>

            {/* Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {board.map((column) => (
                        <Column key={column.id} column={column} />
                    ))}
                </div>

                <DragOverlay>{activeCard ? <CardFace card={activeCard} lifted /> : null}</DragOverlay>
            </DndContext>

            <p className="text-xs text-slate-500">
                Keyboard: <kbd className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono">Tab</kbd> to a
                card, <kbd className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono">Space</kbd> to
                lift, <kbd className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono">↑ ↓ ← →</kbd> to
                move, <kbd className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono">Space</kbd> to
                drop.
            </p>
        </div>
    );
};

export default Kanban;
