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

<!-- Pretty-printed JSON in a recessed mono block. Long lines wrap. -->
<template>
    <pre
        v-bind="attrsRest"
        :class="
            cn(
                'whitespace-pre-wrap border border-line-2 bg-paper-2 p-3 font-mono text-xs leading-relaxed text-ink-2 [overflow-wrap:anywhere]',
                attrs.class as string,
            )
        "
        >{{ formatted }}</pre
    >
</template>
