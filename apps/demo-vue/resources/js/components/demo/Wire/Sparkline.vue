<script lang="ts">
const W = 600;
const H = 120;
const PAD_X = 6;
const PAD_Y = 10;

export interface SparklineProps {
    values: number[];
    direction: "up" | "down" | null;
    ariaLabel: string;
}

const pct = (n: number, of: number) => `${((n / of) * 100).toFixed(3)}%`;
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
                ? PAD_X + (i / (props.values.length - 1)) * (W - PAD_X * 2)
                : W / 2;
        const y = PAD_Y + (1 - (p - min) / range) * (H - PAD_Y * 2);
        return [x, y] as const;
    });
    const points = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const [firstX] = coords[0];
    const [lastX, lastY] = coords[coords.length - 1];
    const area = `${firstX.toFixed(1)},${H} ${points} ${lastX.toFixed(1)},${H}`;

    return { min, max, points, area, lastX, lastY };
});
</script>

<!--
    Hand-rolled sparkline, no chart library: a polyline drawn with the
    drafting line classes (tokens, not hex), high/low ticks on the y-axis,
    and the current value as the one accent mark. The mark is HTML, not SVG,
    so it stays square while the plot stretches to fit.
-->
<template>
    <div
        v-bind="attrsRest"
        :class="cn('spark', attrs.class as string)"
        role="img"
        :aria-label="ariaLabel"
    >
        <span class="spark__axis" :style="{ top: pct(PAD_Y, H) }" aria-hidden="true">
            {{ geometry.max.toFixed(2) }}
        </span>
        <span class="spark__axis" :style="{ top: pct(H - PAD_Y, H) }" aria-hidden="true">
            {{ geometry.min.toFixed(2) }}
        </span>

        <div class="spark__plot">
            <svg
                :viewBox="`0 0 ${W} ${H}`"
                preserveAspectRatio="none"
                class="spark__svg"
                data-draw=""
                aria-hidden="true"
            >
                <polygon class="fill-paper-2" :points="geometry.area" />
                <polyline class="ln" :points="geometry.points" />
            </svg>
            <span
                class="spark__mark"
                :data-direction="direction ?? 'flat'"
                :style="{ left: pct(geometry.lastX, W), top: pct(geometry.lastY, H) }"
                aria-hidden="true"
            />
        </div>
    </div>
</template>
