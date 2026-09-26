import { onMounted, onUnmounted, ref, type Ref } from "vue";

/**
 * The drag protocol shared by every island on the board.
 *
 * Two channels, deliberately:
 *  - dataTransfer carries the payload from drag source to drop target.
 *    The HTML5 spec keeps it in "protected mode" during dragover, so it
 *    is only READABLE on drop.
 *  - A window CustomEvent broadcasts "a drag is happening" the moment it
 *    starts, so every island (separate Vue apps!) can light up its
 *    drop targets and dim the source while hovering.
 *
 * Ephemeral UI state crosses islands via DOM events; persistent state
 * goes through Livewire.
 */

export interface DragPayload {
    cardId: string;
    title: string;
    fromColumnId: string;
    fromPosition: number;
}

export const CARD_MIME = "application/x-mesh-kanban-card";

const DRAG_START = "mesh-kanban:dragstart";
const DRAG_END = "mesh-kanban:dragend";

export function writePayload(dt: DataTransfer, payload: DragPayload): void {
    dt.setData(CARD_MIME, JSON.stringify(payload));
    dt.setData("text/plain", payload.title);
    dt.effectAllowed = "move";
}

export function readPayload(dt: DataTransfer): DragPayload | null {
    try {
        const raw = dt.getData(CARD_MIME);
        return raw ? (JSON.parse(raw) as DragPayload) : null;
    } catch {
        return null;
    }
}

export function announceDragStart(payload: DragPayload): void {
    window.dispatchEvent(new CustomEvent<DragPayload>(DRAG_START, { detail: payload }));
}

export function announceDragEnd(): void {
    window.dispatchEvent(new CustomEvent(DRAG_END));
}

/** The currently dragged card, or null — synced across all islands. */
export function useKanbanDrag(): Ref<DragPayload | null> {
    const drag = ref<DragPayload | null>(null);

    const onStart = (event: Event) => {
        drag.value = (event as CustomEvent<DragPayload>).detail;
    };
    const onEnd = () => {
        drag.value = null;
    };

    onMounted(() => {
        window.addEventListener(DRAG_START, onStart);
        window.addEventListener(DRAG_END, onEnd);
    });

    onUnmounted(() => {
        window.removeEventListener(DRAG_START, onStart);
        window.removeEventListener(DRAG_END, onEnd);
    });

    return drag;
}
