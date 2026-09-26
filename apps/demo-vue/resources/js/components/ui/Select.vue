<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { cn } from "./cn";

defineOptions({ inheritAttrs: false });

const model = defineModel<string | number>();

const attrs = useAttrs();
const attrsRest = computed(() => {
    const { class: _, ...rest } = attrs;
    return rest;
});
</script>

<template>
    <select
        v-bind="attrsRest"
        v-model="model"
        :class="
            cn(
                'px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/10 text-sm text-white transition-colors duration-150 focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/20',
                attrs.class as string,
            )
        "
    >
        <slot />
    </select>
</template>
