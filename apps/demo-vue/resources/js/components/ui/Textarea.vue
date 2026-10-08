<script lang="ts">
export interface TextareaProps {
    /** Switches the border and focus outline to the error treatment. */
    invalid?: boolean;
}
</script>

<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { cn } from "./cn";

defineOptions({ inheritAttrs: false });

withDefaults(defineProps<TextareaProps>(), {
    invalid: false,
});

const model = defineModel<string>();

const attrs = useAttrs();
const attrsRest = computed(() => {
    const { class: _, ...rest } = attrs;
    return rest;
});
</script>

<template>
    <textarea
        v-bind="attrsRest"
        v-model="model"
        :aria-invalid="invalid || undefined"
        :class="
            cn(
                'block w-full resize-y border bg-paper px-3.5 py-3 text-base leading-relaxed text-ink outline-none transition-[border-color,box-shadow] duration-150 ease-(--ease-out) placeholder:text-ink-3 disabled:opacity-50 motion-reduce:transition-none sm:text-sm',
                invalid
                    ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger'
                    : 'border-line-2 hover:border-line-3 focus:border-accent focus:ring-1 focus:ring-accent',
                attrs.class as string,
            )
        "
    />
</template>
