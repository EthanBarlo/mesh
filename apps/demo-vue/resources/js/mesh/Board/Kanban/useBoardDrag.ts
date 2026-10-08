import { readonly, ref, type Ref } from "vue";
import type { VueParentConfig } from "@formkit/drag-and-drop/vue";
import type { Card, Column as ColumnType } from "./types";

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
    listConfig: VueParentConfig<Card>;
    /** The column the dragged card would land in right now, or null when idle. */
    overColumn: Readonly<Ref<string | null>>;
    /** Each Column registers its live card list so a drop can be located board-wide. */
    register: (columnId: string, cards: Ref<Card[]>) => void;
    unregister: (columnId: string) => void;
}

/**
 * @formkit/drag-and-drop mechanics for the board. The library mutates each
 * column's card list *while* dragging (sorts and cross-column transfers), so
 * by drag end the lists already hold the optimistic order — this composable
 * just locates where the card started and landed, commits the new board to
 * the entangled state, and reports the confirmed move through `onMove`.
 */
export function useBoardDrag({ board, setColumns, onMove }: UseBoardDragOptions): BoardDrag {
    const lists = new Map<string, Ref<Card[]>>();

    // Where the card lived when the drag started, so a drop back in the same
    // spot confirms nothing.
    let origin: { cardId: string; columnId: string; index: number } | null = null;

    // formkit transfers the card into whichever list the pointer is over, so
    // the list that holds it mid-drag is the hovered drop zone.
    const overColumn = ref<string | null>(null);

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

    const listConfig: VueParentConfig<Card> = {
        group: "kanban-board",
        // The "Drop cards here" placeholder <li> lives inside the list —
        // only real cards count as draggable nodes.
        draggable: (el) => el.hasAttribute("data-card-id"),
        // Each card <li> is itself the `.ticket`, so formkit's node classes
        // map straight onto the shared ticket states (ecosystem.css):
        //  - the drag image (native) / synth clone (touch) is lifted;
        //  - the card left in the list is the accent slot. formkit re-applies
        //    `dropZoneClass` to the dragged card after every cross-column
        //    remap (the placeholder class only lands once), so the slot uses it.
        draggingClass: "ticket--lifted",
        synthDraggingClass: "ticket--lifted",
        dropZoneClass: "ticket--slot",
        synthDropZoneClass: "ticket--slot",
        onDragstart: (data) => {
            const card = data.draggedNode.data.value as Card;
            const location = locate(card.id);
            origin = location ? { cardId: card.id, ...location } : null;
            overColumn.value = location?.columnId ?? null;
        },
        onTransfer: (data) => {
            const card = data.draggedNodes[0]?.data.value as Card | undefined;
            if (card) overColumn.value = locate(card.id)?.columnId ?? overColumn.value;
        },
        onDragend: () => {
            overColumn.value = null;
            void settle();
        },
    };

    return {
        listConfig,
        overColumn: readonly(overColumn),
        register: (columnId, cards) => {
            lists.set(columnId, cards);
        },
        unregister: (columnId) => {
            lists.delete(columnId);
        },
    };
}
