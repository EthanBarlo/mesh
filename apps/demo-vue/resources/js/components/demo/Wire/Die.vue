<script lang="ts">
// Pip positions on a 3x3 grid for each die face.
const PIPS: Record<number, number[]> = {
    1: [4],
    2: [2, 6],
    3: [2, 4, 6],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
};

export interface DieProps {
    value: number;
}
</script>

<script setup lang="ts">
defineProps<DieProps>();
</script>

<!-- A single die face: a square drawn in ink with pips on a 3x3 grid. -->
<template>
    <div
        class="grid size-14 grid-cols-3 grid-rows-3 border border-ink bg-paper p-2.5"
        role="img"
        :aria-label="`Die showing ${value}`"
    >
        <span v-for="i in 9" :key="i" class="flex items-center justify-center">
            <span
                v-if="(PIPS[value] ?? []).includes(i - 1)"
                class="size-2 rounded-full bg-ink"
            />
        </span>
    </div>
</template>
