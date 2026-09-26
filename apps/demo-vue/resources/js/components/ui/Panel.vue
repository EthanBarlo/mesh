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

<!-- The standard demo surface: a faint mono panel with a hairline border. -->
<template>
    <div
        v-bind="attrsRest"
        :class="
            cn(
                'p-5 rounded-xl bg-white/[0.02] border border-white/5',
                attrs.class as string,
            )
        "
    >
        <slot />
    </div>
</template>
