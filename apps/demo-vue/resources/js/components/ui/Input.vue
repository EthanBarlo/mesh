<script lang="ts">
export interface InputProps {
    /** Switches the border and focus outline to the error treatment. */
    invalid?: boolean;
    type?: string;
}
</script>

<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { cn } from "./cn";

defineOptions({ inheritAttrs: false });

withDefaults(defineProps<InputProps>(), {
    invalid: false,
    type: "text",
});

const model = defineModel<string | number>();

const attrs = useAttrs();
const attrsRest = computed(() => {
    const { class: _, ...rest } = attrs;
    return rest;
});
</script>

<template>
    <input
        v-bind="attrsRest"
        v-model="model"
        :type="type"
        :aria-invalid="invalid || undefined"
        :class="
            cn(
                // 16px on phones so iOS doesn't zoom on focus.
                'block w-full border bg-paper px-3.5 py-2.5 text-base text-ink outline-none transition-[border-color,box-shadow] duration-150 ease-(--ease-out) placeholder:text-ink-3 disabled:opacity-50 motion-reduce:transition-none sm:text-sm',
                invalid
                    ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger'
                    : 'border-line-2 hover:border-line-3 focus:border-accent focus:ring-1 focus:ring-accent',
                attrs.class as string,
            )
        "
    />
</template>
