<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { cn } from "./cn";

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const attrsRest = computed(() => {
    const { class: _, ...rest } = attrs;
    return rest;
});
</script>

<!-- The annotation voice (`.k .k--caps`): 11px tracked mono caps. -->
<template>
    <span
        v-bind="attrsRest"
        :class="
            cn(
                'font-mono text-[0.6875rem] font-normal uppercase leading-normal tracking-[0.1em] text-ink-3',
                attrs.class as string,
            )
        "
    >
        <slot />
    </span>
</template>
