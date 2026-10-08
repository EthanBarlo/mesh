<script setup lang="ts" generic="T extends string">
import { computed, useAttrs } from "vue";
import { cn } from "./cn";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
    options: { value: T; label: string }[];
}>();

const model = defineModel<T>({ required: true });

const attrs = useAttrs();
const attrsRest = computed(() => {
    const { class: _, ...rest } = attrs;
    return rest;
});

const active = computed(() =>
    props.options.findIndex((option) => option.value === model.value),
);
</script>

<!--
    An exclusive choice drawn like the docs' renderer switch: an ink frame of
    equal mono cells, with a solid ink block that slides to the active one.
-->
<template>
    <div
        v-bind="attrsRest"
        :class="
            cn(
                'relative isolate inline-grid auto-cols-fr grid-flow-col border border-ink bg-paper',
                attrs.class as string,
            )
        "
        role="group"
    >
        <span
            aria-hidden="true"
            :class="
                cn(
                    'absolute inset-y-0 left-0 -z-10 bg-ink transition-transform duration-320 ease-(--ease-spring) motion-reduce:transition-none',
                    active < 0 && 'opacity-0',
                )
            "
            :style="{
                width: `${100 / Math.max(options.length, 1)}%`,
                transform: `translateX(${Math.max(active, 0) * 100}%)`,
            }"
        />
        <button
            v-for="(option, index) in options"
            :key="option.value"
            type="button"
            :aria-pressed="index === active"
            :class="
                cn(
                    'min-h-10 whitespace-nowrap px-3 font-mono text-[11px] uppercase tracking-[0.06em] transition-colors duration-240 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none sm:min-h-8',
                    index === active ? 'text-paper' : 'text-ink-2 hover:text-ink',
                )
            "
            @click="model = option.value"
        >
            {{ option.label }}
        </button>
    </div>
</template>
