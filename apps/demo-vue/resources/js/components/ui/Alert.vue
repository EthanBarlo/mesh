<script lang="ts">
type Tone = "error" | "success";

const tones: Record<
    Tone,
    { panel: string; title: string; body: string; icon: string }
> = {
    error: {
        panel: "border-white/10 bg-white/[0.02]",
        title: "text-rose-400",
        body: "text-zinc-400",
        icon: "text-rose-400",
    },
    success: {
        panel: "border-white/10 bg-white/[0.02]",
        title: "text-emerald-400",
        body: "text-zinc-400",
        icon: "text-emerald-400",
    },
};
</script>

<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue";
import { cn } from "./cn";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
    defineProps<{
        tone?: Tone;
        /** Plain-text title — use the #title slot for rich content. */
        title?: string;
    }>(),
    { tone: "error" },
);

const slots = useSlots();
const attrs = useAttrs();
const attrsRest = computed(() => {
    const { class: _, ...rest } = attrs;
    return rest;
});

const t = computed(() => tones[props.tone]);
</script>

<template>
    <div
        v-bind="attrsRest"
        :class="
            cn(
                'flex items-start justify-between gap-4 rounded-xl border p-5',
                t.panel,
                attrs.class as string,
            )
        "
    >
        <div class="flex min-w-0 items-start gap-3">
            <span v-if="slots.icon" :class="cn('mt-0.5 shrink-0', t.icon)">
                <slot name="icon" />
            </span>
            <div class="min-w-0">
                <p :class="cn('font-medium', t.title)">
                    <slot name="title">{{ title }}</slot>
                </p>
                <div v-if="slots.default" :class="cn('mt-0.5 text-sm', t.body)">
                    <slot />
                </div>
            </div>
        </div>
        <!-- Rendered on the trailing edge, e.g. a retry button. -->
        <div v-if="slots.action" class="shrink-0">
            <slot name="action" />
        </div>
    </div>
</template>
