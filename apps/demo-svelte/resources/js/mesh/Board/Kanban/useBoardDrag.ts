import type { ParentConfig } from "@formkit/drag-and-drop";
import type { Card, Column as ColumnType } from "./types";

/** A column's live card list — a writable `{ value }` box over Svelte state. */
export interface CardList {
    value: Card[];
}

interface UseBoardDragOptions {
    /** Read the current board so column ids/titles stay fresh. */
    board: () => ColumnType[];
    /** Replace the entangled columns with the post-drop order. */
    setColumns: (columns: ColumnType[]) => void;
    /** Called once per confirmed move so the server can persist it. */
    onMove: (cardId: string, fromCol: string, toCol: string, position: number) => void | Promise<void>;
}

export interface BoardDrag {
    /** Shared per-column drag config — the common `group` lets cards transfer across columns. */
    listConfig: Partial<ParentConfig<Card>>;
    /** Each Column registers its live card list so a drop can be located board-wide. */
    register: (columnId: string, cards: CardList) => void;
    unregister: (columnId: string) => void;
}

/**
 * @formkit/drag-and-drop mechanics for the board. The library mutates each
 * column's card list *while* dragging (sorts and cross-column transfers), so
 * by drag end the lists already hold the optimistic order — this helper
 * just locates where the card started and landed, commits the new board to
 * the entangled state, and reports the confirmed move through `onMove`.
 */
export function useBoardDrag({ board, setColumns, onMove }: UseBoardDragOptions): BoardDrag {
    const lists = new Map<string, CardList>();

    // Where the card lived when the drag started, so a drop back in the same
    // spot confirms nothing.
    let origin: { cardId: string; columnId: string; index: number } | null = null;

    const locate = (cardId: string): { columnId: string; index: number } | null => {
        for (const [columnId, cards] of lists) {
            const index = cards.value.findIndex((card) => card.id === cardId);
            if (index >= 0) return { columnId, index };
        }
        return null;
    };

    /** Reassemble the columns array from the live per-column lists. */
    const rebuild = (): ColumnType[] =>
        board().map((column) => ({
            ...column,
            cards: [...(lists.get(column.id)?.value ?? column.cards)],
        }));

    const settle = async () => {
        if (!origin) return;

        const { cardId, columnId: fromCol, index: fromIndex } = origin;
        origin = null;

        const target = locate(cardId);
        if (!target) return;

        // Dropped back exactly where it started — nothing to confirm.
        if (target.columnId === fromCol && target.index === fromIndex) return;

        // Commit the optimistic order to the entangled board; the deferred
        // set batches with the moveCard call below.
        setColumns(rebuild());

        await onMove(cardId, fromCol, target.columnId, target.index);
    };

    const listConfig: Partial<ParentConfig<Card>> = {
        group: "kanban-board",
        // The "Drop cards here" placeholder <li> lives inside the list —
        // only real cards count as draggable nodes.
        draggable: (el) => el.hasAttribute("data-card-id"),
        draggingClass: "opacity-40",
        dragPlaceholderClass: "opacity-40",
        synthDragPlaceholderClass: "opacity-40",
        dropZoneParentClass: "bg-white/[0.04]",
        synthDropZoneParentClass: "bg-white/[0.04]",
        onDragstart: (data) => {
            const card = data.draggedNode.data.value as Card;
            origin = (() => {
                const location = locate(card.id);
                return location ? { cardId: card.id, ...location } : null;
            })();
        },
        onDragend: () => {
            void settle();
        },
    };

    return {
        listConfig,
        register: (columnId, cards) => {
            lists.set(columnId, cards);
        },
        unregister: (columnId) => {
            lists.delete(columnId);
        },
    };
}
