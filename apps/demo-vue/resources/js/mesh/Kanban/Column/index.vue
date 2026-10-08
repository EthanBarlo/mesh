<script setup lang="ts">
import { ref } from "vue";
import { useWire } from "@mesh/vue";
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
    <header class="lane__head">
        <span class="lane__mark" :data-lane="columnId" aria-hidden="true" />
        <h3 class="lane__title">{{ title }}</h3>
        <!-- Live count: a reactive prop straight from the Board. -->
        <span class="lane__count" :title="`${count} cards`">
            {{ String(count).padStart(2, "0") }}
        </span>
    </header>

    <!-- Catch-all drop target: order-1 sorts it after every card,
         flex-1 stretches it over the column's remaining space. -->
    <div
        :data-drop-tail="columnId"
        class="lane__tail"
        :data-armed="drag || count === 0 ? '' : undefined"
        :data-over="over ? '' : undefined"
        @dragover="handleDragOver"
        @dragleave="over = false"
        @drop="handleDrop"
    >
        <span v-if="drag || count === 0" class="k k--caps pointer-events-none">
            {{ drag ? "Drop here" : "No cards. Drag one in." }}
        </span>
    </div>
</template>
