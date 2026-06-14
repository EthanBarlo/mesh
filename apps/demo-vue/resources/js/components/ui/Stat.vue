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

<!-- Compact value-over-label stat tile. -->
<template>
    <div
        v-bind="attrsRest"
        :class="
            cn(
                'p-3 rounded-lg bg-white/[0.02] border border-white/5 text-center',
                attrs.class as string,
            )
        "
    >
        <p
            class="text-lg font-semibold text-white tabular-nums truncate"
            :title="String(value)"
        >
            {{ value }}
        </p>
        <p class="mt-0.5 text-[11px] font-medium uppercase tracking-widest text-zinc-500">
            {{ label }}
        </p>
    </div>
</template>
