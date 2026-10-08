import { dragstartClasses, type ParentConfig } from "@formkit/drag-and-drop";
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
    /** The column the dragged card currently sits in (its drop target), or null when no drag is on. */
    onOver?: (columnId: string | null) => void;
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
export function useBoardDrag({ board, setColumns, onMove, onOver }: UseBoardDragOptions): BoardDrag {
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

    const begin = (card: Card) => {
        const location = locate(card.id);
        origin = location ? { cardId: card.id, ...location } : null;
        onOver?.(location?.columnId ?? null);
    };

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
        // formkit's drag classes land on the card <li>, which is the `.ticket`
        // itself. The drag image (mouse) or pointer clone (touch) is snapshotted
        // while the lifted class is on; then formkit swaps it for the drop-zone
        // class, which marks the card left in the list as the accent slot where
        // it will land. formkit re-applies that class when the card transfers
        // to another column. (The placeholder classes stay unset: giving them
        // the same name would make formkit keep the class after the drop.)
        draggingClass: "ticket--lifted",
        synthDraggingClass: "ticket--lifted",
        dropZoneClass: "ticket--slot",
        synthDropZoneClass: "ticket--slot",
        // Runs at the start of both mouse (native) and touch (synthetic) drags,
        // so the origin is recorded either way.
        dragstartClasses: (node, nodes, config, isSynth) => {
            begin(node.data.value as Card);
            dragstartClasses(node, nodes, config, isSynth);
        },
        onTransfer: (data) => {
            const card = data.draggedNodes[0]?.data.value as Card | undefined;
            if (card) onOver?.(locate(card.id)?.columnId ?? null);
        },
        onDragend: () => {
            onOver?.(null);
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
