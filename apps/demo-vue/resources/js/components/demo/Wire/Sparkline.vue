<script lang="ts">
const W = 600;
const H = 120;
const PAD = 6;

export interface SparklineProps {
    values: number[];
    direction: "up" | "down" | null;
    ariaLabel: string;
}
</script>

<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { cn } from "@/components/ui";

defineOptions({ inheritAttrs: false });

const props = defineProps<SparklineProps>();

const attrs = useAttrs();
const attrsRest = computed(() => {
    const { class: _, ...rest } = attrs;
    return rest;
});

const geometry = computed(() => {
    const min = Math.min(...props.values);
    const max = Math.max(...props.values);
    const range = max - min || 1;

    const coords = props.values.map((p, i) => {
        const x =
            props.values.length > 1
                ? PAD + (i / (props.values.length - 1)) * (W - PAD * 2)
                : W / 2;
        const y = PAD + (1 - (p - min) / range) * (H - PAD * 2);
        return [x, y] as const;
    });
    const points = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const area = `${PAD},${H - PAD} ${points} ${(W - PAD).toFixed(1)},${H - PAD}`;
    const [lastX, lastY] = coords[coords.length - 1];

    return { points, area, lastX, lastY };
});
</script>

<!-- Hand-rolled sparkline — no chart library, just a polyline. -->
<template>
    <svg
        v-bind="attrsRest"
        :viewBox="`0 0 ${W} ${H}`"
        preserveAspectRatio="none"
        :class="cn('w-full h-28', attrs.class as string)"
        role="img"
        :aria-label="ariaLabel"
    >
        <defs>
            <linearGradient id="price-watcher-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#fafafa" stop-opacity="0.12" />
                <stop offset="100%" stop-color="#fafafa" stop-opacity="0" />
            </linearGradient>
        </defs>
        <polygon :points="geometry.area" fill="url(#price-watcher-fill)" />
        <polyline
            :points="geometry.points"
            fill="none"
            stroke="#a1a1aa"
            stroke-width="2"
            stroke-linejoin="round"
            stroke-linecap="round"
            vector-effect="non-scaling-stroke"
        />
        <circle
            :cx="geometry.lastX"
            :cy="geometry.lastY"
            r="4"
            :fill="direction === 'down' ? '#fb7185' : '#34d399'"
            stroke="#09090b"
            stroke-width="2"
        />
    </svg>
</template>
