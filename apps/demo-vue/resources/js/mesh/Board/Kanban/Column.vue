<script lang="ts">
const ACCENTS: Record<string, string> = {
    backlog: "bg-zinc-500",
    "in-progress": "bg-amber-400",
    done: "bg-emerald-400",
};
</script>

<script setup lang="ts">
import { onUnmounted, watch } from "vue";
import { useDragAndDrop } from "@formkit/drag-and-drop/vue";
import { cn } from "@/components/ui";
import CardItem from "./CardItem.vue";
import type { BoardDrag } from "./useBoardDrag";
import type { Card, Column as ColumnType } from "./types";

const props = defineProps<{
    column: ColumnType;
    drag: BoardDrag;
}>();

// Each column is its own drop list; the shared group config (from
// useBoardDrag) lets cards sort within it and transfer across columns.
const [listRef, cards] = useDragAndDrop<Card>([...props.column.cards], props.drag.listConfig);

props.drag.register(props.column.id, cards);
onUnmounted(() => props.drag.unregister(props.column.id));

// Server-driven updates (reset, reseed) stream back into the drag list.
watch(
    () => props.column.cards,
    (next) => {
        cards.value = [...next];
    },
);
</script>

<template>
    <div class="flex flex-col rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
        <header class="flex items-center gap-2.5 px-4 py-3 border-b border-white/5">
            <span
                :class="cn('h-2 w-2 rounded-full', ACCENTS[column.id] ?? 'bg-zinc-500')"
                aria-hidden="true"
            />
            <h3 class="text-sm font-semibold text-white">{{ column.title }}</h3>
            <span
                class="ml-auto px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-medium tabular-nums text-zinc-400"
            >
                {{ cards.length }}
            </span>
        </header>

        <ul
            ref="listRef"
            class="flex-1 p-3 space-y-2.5 min-h-36 transition-colors duration-150"
            :aria-label="`${column.title} column`"
        >
            <CardItem v-for="card in cards" :key="card.id" :card="card" />

            <li
                v-if="cards.length === 0"
                class="flex items-center justify-center h-24 rounded-lg border border-dashed border-white/10 text-xs text-zinc-500"
            >
                Drop cards here
            </li>
        </ul>
    </div>
</template>
