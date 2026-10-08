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

<!-- A mono keycap: hairline sides, a heavier bottom edge. -->
<template>
    <kbd
        v-bind="attrsRest"
        :class="
            cn(
                'inline-flex min-w-[1.75em] items-center justify-center border border-b-2 border-line-3 bg-paper px-1.5 py-px font-mono text-[0.85em] leading-[1.4] text-ink',
                attrs.class as string,
            )
        "
    >
        <slot />
    </kbd>
</template>
