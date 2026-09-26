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
    <svg
        v-bind="attrsRest"
        :class="cn('w-4 h-4 animate-spin', attrs.class as string)"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
    >
        <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
        />
        <path
            class="opacity-90"
            fill="currentColor"
            d="M12 2a10 10 0 0110 10h-4a6 6 0 00-6-6V2z"
        />
    </svg>
</template>
