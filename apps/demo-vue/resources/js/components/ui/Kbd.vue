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

<template>
    <kbd
        v-bind="attrsRest"
        :class="
            cn(
                'px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-zinc-300',
                attrs.class as string,
            )
        "
    >
        <slot />
    </kbd>
</template>
