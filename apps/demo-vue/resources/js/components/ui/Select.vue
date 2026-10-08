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

<!-- A native select, drawn like the inputs. The arrow follows the color scheme. -->
<template>
    <select
        v-bind="attrsRest"
        v-model="model"
        :class="
            cn(
                'border border-line-2 bg-paper px-2.5 py-1.5 font-mono text-base tabular-nums text-ink outline-none transition-[border-color,box-shadow] duration-150 ease-(--ease-out) hover:border-line-3 focus:border-accent focus:ring-1 focus:ring-accent motion-reduce:transition-none sm:text-xs',
                attrs.class as string,
            )
        "
    >
        <slot />
    </select>
</template>
