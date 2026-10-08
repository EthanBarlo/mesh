<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { cn } from "./cn";

defineOptions({ inheritAttrs: false });

defineProps<{
    label: string | number;
    value: string | number;
}>();

const attrs = useAttrs();
const attrsRest = computed(() => {
    const { class: _, ...rest } = attrs;
    return rest;
});
</script>

<!-- A title-block cell: a mono label over the value. -->
<template>
    <div
        v-bind="attrsRest"
        :class="
            cn(
                'min-w-0 border border-line-2 bg-paper px-3 pt-2 pb-2.5',
                attrs.class as string,
            )
        "
    >
        <p class="truncate font-mono text-[10px] uppercase leading-normal tracking-[0.1em] text-ink-3">
            {{ label }}
        </p>
        <p
            class="mt-0.5 truncate text-lg font-semibold leading-snug tracking-[-0.02em] tabular-nums text-ink"
            :title="String(value)"
        >
            {{ value }}
        </p>
    </div>
</template>
