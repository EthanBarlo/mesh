<script setup lang="ts">
import type { Card } from "./types";

defineProps<{
    card: Card;
}>();
</script>

<template>
    <!-- The card (a paper tag), styled by the shared `.ticket` classes in
         ecosystem.css, which the Blade-composed Kanban uses too. The <li> is
         the ticket itself: formkit adds its drag classes to the node it
         drags, so `ticket--lifted` and `ticket--slot` must land on this
         element (see useBoardDrag). Its class list stays static so Vue never
         overwrites them mid-drag.
         data-card-id marks this as a draggable node (the empty-state
         placeholder in Column.vue is skipped by the draggable filter). -->
    <li
        :data-card-id="card.id"
        class="lane__grab ticket touch-none"
        :aria-label="`${card.title} (${card.tag})`"
    >
        <p class="ticket__title">{{ card.title }}</p>
        <div class="ticket__foot">
            <span class="ticket__tag">{{ card.tag }}</span>
            <span class="ticket__grip" aria-hidden="true" />
        </div>
    </li>
</template>
