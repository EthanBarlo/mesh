<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { cn } from "./cn";

defineOptions({ inheritAttrs: false });

withDefaults(
    defineProps<{
        /** Percentage, 0–100. */
        value: number;
        /** The fill: the accent (default) or ink. */
        tone?: "accent" | "ink";
    }>(),
    { tone: "accent" },
);

const attrs = useAttrs();
const attrsRest = computed(() => {
    const { class: _, ...rest } = attrs;
    return rest;
});
</script>

<!-- A ruler: a hairline baseline with quarter ticks and a filled bar along it. -->
<template>
    <div
        v-bind="attrsRest"
        :class="cn('relative h-2.5', attrs.class as string)"
        role="progressbar"
        :aria-valuenow="value"
        :aria-valuemin="0"
        :aria-valuemax="100"
    >
        <span
            aria-hidden="true"
            class="ui-progress__ticks absolute inset-x-0 bottom-0 h-[5px]"
        />
        <span
            aria-hidden="true"
            class="absolute inset-x-0 bottom-0 h-px bg-line-3"
        />
        <span
            aria-hidden="true"
            :class="
                cn(
                    'absolute bottom-0 left-0 h-1 transition-[width] duration-200 ease-(--ease-out) motion-reduce:transition-none',
                    tone === 'ink' ? 'bg-ink' : 'bg-accent',
                )
            "
            :style="{ width: `${Math.min(100, Math.max(0, value))}%` }"
        />
    </div>
</template>
