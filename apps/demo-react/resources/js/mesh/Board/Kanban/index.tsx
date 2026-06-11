import React, { useState } from "react";
import { DndContext, DragOverlay, MeasuringStrategy, closestCorners } from "@dnd-kit/core";
import { useEntangle, useWire } from "@mesh/react";
import { Badge, Button, Kbd, cn } from "@/components/ui";
import Column from "./Column";
import { CardFace } from "./CardItem";
import { useBoardDrag } from "./useBoardDrag";
import type { Column as ColumnType } from "./types";

interface KanbanProps {
    syncCount: number;
    lastSyncAt: string;
}

interface KanbanWire {
    moveCard: (cardId: string, fromCol: string, toCol: string, position: number) => Promise<void>;
    resetBoard: () => Promise<void>;
}

const Kanban: React.FC<KanbanProps> = ({ syncCount, lastSyncAt }) => {
    // Single source of board state, two-way bound to the Livewire property.
    // Deferred: local drags update instantly, then batch with the moveCard call.
    const [columns, setColumns] = useEntangle<ColumnType[]>("columns");
    const wire = useWire<KanbanWire>();

    const [resetting, setResetting] = useState(false);

    const board = columns ?? [];

    // The dnd-kit mechanics live in useBoardDrag; the board only declares what
    // a confirmed move means.
    const { sensors, activeCard, handlers } = useBoardDrag({
        board,
        setColumns,
        // Confirm server-side: the deferred entangle batches with this call, then
        // moveCard normalizes, persists to the session, and bumps the sync badge.
        onMove: (cardId, fromCol, toCol, position) =>
            wire.$call("moveCard", cardId, fromCol, toCol, position),
    });

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
                <Badge
                    color="slate"
                    className="gap-2 px-3 py-1.5 bg-white/5 border-white/10 font-normal text-zinc-400"
                >
                    <span
                        className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            syncCount > 0 ? "bg-emerald-400" : "bg-zinc-500",
                        )}
                        aria-hidden="true"
                    />
                    {syncCount > 0 ? (
                        <span>
                            Synced <span className="font-semibold text-zinc-200 tabular-nums">{syncCount}</span>{" "}
                            {syncCount === 1 ? "move" : "moves"} · last{" "}
                            <span className="font-mono text-zinc-300">{lastSyncAt}</span>
                        </span>
                    ) : (
                        <span>No moves synced yet — drag a card</span>
                    )}
                </Badge>

                <Button
                    variant="secondary"
                    size="xs"
                    onClick={handleReset}
                    disabled={resetting}
                    className="px-4 py-2"
                >
                    {resetting ? "Resetting…" : "Reset board"}
                </Button>
            </div>

            {/* Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
                {...handlers}
            >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {board.map((column) => (
                        <Column key={column.id} column={column} />
                    ))}
                </div>

                <DragOverlay>{activeCard ? <CardFace card={activeCard} lifted /> : null}</DragOverlay>
            </DndContext>

            <p className="text-xs text-zinc-500">
                Keyboard: <Kbd>Tab</Kbd> to a card, <Kbd>Space</Kbd> to lift, <Kbd>↑ ↓ ← →</Kbd> to move,{" "}
                <Kbd>Space</Kbd> to drop.
            </p>
        </div>
    );
};

export default Kanban;
