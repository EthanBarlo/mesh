<script setup lang="ts">
import { ref } from "vue";
import { useWire } from "@mesh/vue";
import { cn } from "@/components/ui";
import {
    announceDragEnd,
    readPayload,
    useKanbanDrag,
} from "@/components/demo/Kanban/dnd";

/**
 * One island per column. Mesh wrappers are display:contents, so this
 * fragment's two elements — the header and the `order-1` drop tail —
 * become direct flex items of the Blade column cell, and the Blade-
 * rendered card islands (order 0) slot visually between them.
 */
const props = defineProps<{
    columnId: string;
    title: string;
    count: number;
}>();

const ACCENTS: Record<string, string> = {
    backlog: "bg-zinc-500",
    "in-progress": "bg-amber-400",
    done: "bg-emerald-400",
};

const wire = useWire();
const drag = useKanbanDrag();
const over = ref(false);

const handleDragOver = (event: DragEvent) => {
    if (!drag.value) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    over.value = true;
};

const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    over.value = false;

    const payload =
        (event.dataTransfer ? readPayload(event.dataTransfer) : null) ?? drag.value;
    if (!payload) return;
    // Already the last card of this column — nothing to move.
    if (payload.fromColumnId === props.columnId && payload.fromPosition === props.count - 1) {
        announceDragEnd();
        return;
    }

    // Append; the Board clamps the position server-side.
    wire.$dispatch("kanban.card-moved", {
        cardId: payload.cardId,
        title: payload.title,
        fromColumnId: payload.fromColumnId,
        toColumnId: props.columnId,
        position: props.count,
    });
};
</script>

<template>
    <header class="flex items-center gap-2.5 px-4 py-3 border-b border-white/5">
        <span
            :class="cn('h-2 w-2 rounded-full', ACCENTS[columnId] ?? 'bg-zinc-500')"
            aria-hidden="true"
        />
        <h3 class="text-sm font-semibold text-white">{{ title }}</h3>
        <!-- Live count — a reactive prop straight from the Board. -->
        <span class="ml-auto px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-medium tabular-nums text-zinc-400">
            {{ count }}
        </span>
    </header>

    <!-- Catch-all drop target: order-1 sorts it after every card,
         flex-1 stretches it over the column's remaining space. -->
    <div
        :data-drop-tail="columnId"
        :class="
            cn(
                'order-1 flex-1 m-3 min-h-14 rounded-lg flex items-center justify-center transition-colors duration-150',
                (drag || count === 0) && 'border border-dashed border-white/10',
                over && 'border-solid border-white/30 bg-white/[0.06]',
            )
        "
        @dragover="handleDragOver"
        @dragleave="over = false"
        @drop="handleDrop"
    >
        <span v-if="drag || count === 0" class="text-xs text-zinc-500 pointer-events-none">
            {{ drag ? "Drop here" : "No cards — drag one in" }}
        </span>
    </div>
</template>
