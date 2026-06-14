<script setup lang="ts" generic="T extends string">
import { computed, useAttrs } from "vue";
import { cn } from "./cn";

defineOptions({ inheritAttrs: false });

defineProps<{
    options: { value: T; label: string }[];
}>();

const model = defineModel<T>({ required: true });

const attrs = useAttrs();
const attrsRest = computed(() => {
    const { class: _, ...rest } = attrs;
    return rest;
});
</script>

<!-- Pill-shaped exclusive choice group with a solid white active segment. -->
<template>
    <div
        v-bind="attrsRest"
        :class="
            cn(
                'inline-flex items-center gap-1 p-1 rounded-lg bg-white/[0.02] border border-white/10',
                attrs.class as string,
            )
        "
        role="group"
    >
        <button
            v-for="option in options"
            :key="option.value"
            type="button"
            :aria-pressed="option.value === model"
            :class="
                cn(
                    'px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-zinc-950',
                    option.value === model
                        ? 'bg-white text-zinc-950'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5',
                )
            "
            @click="model = option.value"
        >
            {{ option.label }}
        </button>
    </div>
</template>
