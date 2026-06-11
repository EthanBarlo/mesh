<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { cn } from "./cn";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
    value: unknown;
}>();

const attrs = useAttrs();
const attrsRest = computed(() => {
    const { class: _, ...rest } = attrs;
    return rest;
});

const formatted = computed(() => JSON.stringify(props.value, null, 2));
</script>

<!-- Pretty-printed JSON in the demo's terminal-style block. -->
<template>
    <pre
        v-bind="attrsRest"
        :class="
            cn(
                'overflow-x-auto rounded-lg bg-black/30 p-3 font-mono text-xs leading-relaxed text-zinc-400',
                attrs.class as string,
            )
        "
        >{{ formatted }}</pre
    >
</template>
