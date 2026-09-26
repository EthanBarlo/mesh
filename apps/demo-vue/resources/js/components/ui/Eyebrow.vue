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

<!-- Tiny uppercase section label. -->
<template>
    <span
        v-bind="attrsRest"
        :class="
            cn(
                'text-xs font-medium uppercase tracking-widest text-zinc-500',
                attrs.class as string,
            )
        "
    >
        <slot />
    </span>
</template>
