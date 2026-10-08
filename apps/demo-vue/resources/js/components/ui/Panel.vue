<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { cn } from "./cn";

defineOptions({ inheritAttrs: false });

withDefaults(
    defineProps<{
        /** Registration marks on two corners, like a figure stage. */
        ticks?: boolean;
    }>(),
    { ticks: false },
);

const attrs = useAttrs();
const attrsRest = computed(() => {
    const { class: _, ...rest } = attrs;
    return rest;
});
</script>

<!-- The standard demo surface: paper, a hairline border, square corners. -->
<template>
    <div
        v-bind="attrsRest"
        :class="
            cn(
                'relative border border-line-2 bg-paper p-5',
                ticks && 'ui-ticks',
                attrs.class as string,
            )
        "
    >
        <slot />
    </div>
</template>
