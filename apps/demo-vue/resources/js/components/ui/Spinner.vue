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

<!--
    A line-drawn square with a short stroke tracing its edge. Inherits the
    text color; size it with `w-*`/`h-*`.
-->
<template>
    <svg
        v-bind="attrsRest"
        :class="cn('ui-spinner w-4 h-4 shrink-0', attrs.class as string)"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
    >
        <rect
            x="1.5"
            y="1.5"
            width="13"
            height="13"
            stroke="currentColor"
            stroke-opacity="0.28"
        />
        <rect
            class="ui-spinner__run"
            x="1.5"
            y="1.5"
            width="13"
            height="13"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="square"
            pathLength="100"
            stroke-dasharray="24 76"
        />
    </svg>
</template>
