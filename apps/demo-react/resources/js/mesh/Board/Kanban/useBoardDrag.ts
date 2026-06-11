import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import {
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { Card, Column as ColumnType } from "./types";

interface UseBoardDragOptions {
    board: ColumnType[];
    setColumns: Dispatch<SetStateAction<ColumnType[]>>;
    /** Called once per confirmed move so the server can persist it. */
    onMove: (cardId: string, fromCol: string, toCol: string, position: number) => void | Promise<void>;
}

/** Find the column that *is* the id, or the column *containing* the card id. */
const findColumn = (columns: ColumnType[], id: string): ColumnType | undefined =>
    columns.find((column) => column.id === id) ??
    columns.find((column) => column.cards.some((card) => card.id === id));

/**
 * dnd-kit mechanics for the board: sensors, the card being dragged, and the
 * four DndContext handlers. Local state updates happen here for instant
 * feedback; the confirmed move is reported through `onMove`.
 */
export function useBoardDrag({ board, setColumns, onMove }: UseBoardDragOptions) {
    const [activeCard, setActiveCard] = useState<Card | null>(null);
    const originColumnRef = useRef<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const onDragStart = ({ active }: DragStartEvent) => {
        const activeId = String(active.id);
        const column = findColumn(board, activeId);

        originColumnRef.current = column?.id ?? null;
        setActiveCard(column?.cards.find((card) => card.id === activeId) ?? null);
    };

    // Move the card between columns *while* dragging so the target list opens up.
    const onDragOver = ({ active, over }: DragOverEvent) => {
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

    const onDragEnd = async ({ active, over }: DragEndEvent) => {
        setActiveCard(null);

        const fromColumnId = originColumnRef.current;
        originColumnRef.current = null;

        if (!over || !fromColumnId) return;

        const activeId = String(active.id);
        const overId = String(over.id);

        // By drop time, cross-column moves already happened in onDragOver —
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

        await onMove(activeId, fromColumnId, column.id, position);
    };

    const onDragCancel = () => {
        setActiveCard(null);
        originColumnRef.current = null;
    };

    return {
        sensors,
        activeCard,
        handlers: { onDragStart, onDragOver, onDragEnd, onDragCancel },
    };
}
