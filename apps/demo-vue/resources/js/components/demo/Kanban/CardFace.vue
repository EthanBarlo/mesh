<script lang="ts">
// Visual twin of the Board island's card (mesh/Board/Kanban/CardItem.vue,
// same shared `.ticket` classes), kept drag-library free so the
// Kanban/Card island chunk stays tiny.
export interface KanbanCard {
    id: string;
    title: string;
    tag: string;
}
</script>

<script setup lang="ts">
// Extra classes (e.g. `ticket--source`) fall through onto the root.
defineProps<{ card: KanbanCard }>();
</script>

<template>
    <div class="ticket">
        <p class="ticket__title">{{ card.title }}</p>
        <div class="ticket__foot">
            <span class="ticket__tag">{{ card.tag }}</span>
            <span class="ticket__grip" aria-hidden="true" />
        </div>
    </div>
</template>
