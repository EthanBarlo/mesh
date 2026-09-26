<script lang="ts">
export interface InputProps {
    /** Switches the border and focus ring to the error treatment. */
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
                'w-full rounded-lg bg-white/[0.02] border px-4 py-2.5 text-sm text-white placeholder-zinc-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950',
                invalid
                    ? 'border-rose-400/40 focus:border-rose-400/60 focus:ring-rose-400/30'
                    : 'border-white/10 focus:border-white/20 focus:ring-white/20',
                attrs.class as string,
            )
        "
    />
</template>
