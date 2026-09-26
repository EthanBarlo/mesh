<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { cn } from "./cn";

defineOptions({ inheritAttrs: false });

defineProps<{
    /** Percentage, 0–100. */
    value: number;
}>();

const attrs = useAttrs();
const attrsRest = computed(() => {
    const { class: _, ...rest } = attrs;
    return rest;
});
</script>

<template>
    <div
        v-bind="attrsRest"
        :class="
            cn(
                'h-2.5 overflow-hidden rounded-full bg-white/5',
                attrs.class as string,
            )
        "
        role="progressbar"
        :aria-valuenow="value"
        :aria-valuemin="0"
        :aria-valuemax="100"
    >
        <div
            class="h-full rounded-full bg-white transition-[width] duration-200"
            :style="{ width: `${value}%` }"
        />
    </div>
</template>
