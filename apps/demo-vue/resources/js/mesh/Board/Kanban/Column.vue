<script setup lang="ts">
import { computed, onUnmounted, watch } from "vue";
import { useDragAndDrop } from "@formkit/drag-and-drop/vue";
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

const isOver = computed(() => props.drag.overColumn.value === props.column.id);
</script>

<template>
    <!-- A drawing frame: mono caps header with a progress mark and a count. -->
    <div class="lane">
        <header class="lane__head">
            <span class="lane__mark" :data-lane="column.id" aria-hidden="true" />
            <h3 class="lane__title">{{ column.title }}</h3>
            <span class="lane__count" :title="`${cards.length} cards`">
                {{ String(cards.length).padStart(2, "0") }}
            </span>
        </header>

        <ul
            ref="listRef"
            class="lane__list"
            :data-over="isOver ? '' : undefined"
            :aria-label="`${column.title} column`"
        >
            <CardItem v-for="card in cards" :key="card.id" :card="card" />

            <li v-if="cards.length === 0" class="lane__empty k k--caps">Drop cards here</li>
        </ul>
    </div>
</template>
