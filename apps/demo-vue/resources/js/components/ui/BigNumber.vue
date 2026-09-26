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

<!-- Large numeral — size it at the call site (text-5xl, text-7xl, …). -->
<template>
    <span
        v-bind="attrsRest"
        :class="
            cn(
                'font-semibold tracking-tight tabular-nums text-white',
                attrs.class as string,
            )
        "
    >
        <slot />
    </span>
</template>
