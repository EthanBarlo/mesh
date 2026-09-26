<script setup lang="ts">
import { computed, ref } from "vue";
import { useWire } from "@mesh/vue";
import { cn } from "@/components/ui";
import CardFace, { type KanbanCard } from "@/components/demo/Kanban/CardFace.vue";
import {
    announceDragEnd,
    announceDragStart,
    readPayload,
    useKanbanDrag,
    writePayload,
} from "@/components/demo/Kanban/dnd";

/**
 * One island per card. It holds no board state — `columnId` and
 * `position` are reactive props from the parent Livewire Board, and a
 * drop is just an event dispatched onto Livewire's bus.
 */
const props = defineProps<{
    card: KanbanCard;
    columnId: string;
    position: number;
}>();

const wire = useWire();
const drag = useKanbanDrag();
const indicator = ref<"above" | "below" | null>(null);

const isSource = computed(() => drag.value?.cardId === props.card.id);

const handleDragStart = (event: DragEvent) => {
    if (!event.dataTransfer) return;
    const payload = {
        cardId: props.card.id,
        title: props.card.title,
        fromColumnId: props.columnId,
        fromPosition: props.position,
    };
    writePayload(event.dataTransfer, payload);
    announceDragStart(payload);
};

// Fires on drop AND on cancel — every island clears its drag state.
const handleDragEnd = () => announceDragEnd();

const handleDragOver = (event: DragEvent) => {
    if (!drag.value || isSource.value) return;
    // preventDefault marks this card as a valid drop target.
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    indicator.value =
        event.clientY < rect.top + rect.height / 2 ? "above" : "below";
};

const handleDragLeave = (event: DragEvent) => {
    if ((event.currentTarget as Node).contains(event.relatedTarget as Node)) return;
    indicator.value = null;
};

const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    // Recompute from the event — the indicator state is for visuals only.
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const side =
        event.clientY < rect.top + rect.height / 2 ? "above" : "below";
    indicator.value = null;

    // dataTransfer is only readable on drop (protected mode) — fall
    // back to the broadcast drag state, bail on foreign drags.
    const payload =
        (event.dataTransfer ? readPayload(event.dataTransfer) : null) ?? drag.value;
    if (!payload) return;

    let insertAt = side === "above" ? props.position : props.position + 1;
    // The server detaches the card first, shifting later indexes down.
    if (payload.fromColumnId === props.columnId && payload.fromPosition < insertAt) {
        insertAt -= 1;
    }
    if (payload.fromColumnId === props.columnId && insertAt === payload.fromPosition) {
        return; // dropped back where it started
    }

    // Persistent state goes through Livewire: the Board (and anyone
    // else listening) catches this and re-renders every island.
    wire.$dispatch("kanban.card-moved", {
        cardId: payload.cardId,
        title: payload.title,
        fromColumnId: payload.fromColumnId,
        toColumnId: props.columnId,
        position: insertAt,
    });
};
</script>

<template>
    <div
        draggable="true"
        :data-card-id="card.id"
        :data-column-id="columnId"
        :class="
            cn(
                'relative mx-3 mt-2.5 cursor-grab active:cursor-grabbing select-none',
                isSource && 'opacity-40',
            )
        "
        :aria-label="`${card.title} (${card.tag})`"
        @dragstart="handleDragStart"
        @dragend="handleDragEnd"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
    >
        <span
            v-if="indicator === 'above'"
            class="absolute inset-x-1 -top-[7px] h-0.5 rounded-full bg-rose-400 pointer-events-none"
        />
        <CardFace :card="card" />
        <span
            v-if="indicator === 'below'"
            class="absolute inset-x-1 -bottom-[7px] h-0.5 rounded-full bg-rose-400 pointer-events-none"
        />
    </div>
</template>
