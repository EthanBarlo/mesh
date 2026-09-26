<script lang="ts">
export type BadgeColor =
    | "rose"
    | "orange"
    | "amber"
    | "emerald"
    | "cyan"
    | "blue"
    | "violet"
    | "slate";

// Semantic colors (rose/amber/emerald) keep a restrained text accent on a
// mono chip; decorative colors all collapse to the plain mono chip.
const mono = { badge: "bg-white/5 text-zinc-300 border-white/10", dot: "bg-zinc-500" };

const colors: Record<BadgeColor, { badge: string; dot: string }> = {
    rose: { badge: "bg-white/5 text-rose-400 border-white/10", dot: "bg-rose-500" },
    orange: mono,
    amber: { badge: "bg-white/5 text-amber-400 border-white/10", dot: "bg-amber-400" },
    emerald: { badge: "bg-white/5 text-emerald-400 border-white/10", dot: "bg-emerald-400" },
    cyan: mono,
    blue: mono,
    violet: mono,
    slate: mono,
};
</script>

<script setup lang="ts">
import { computed, useAttrs } from "vue";
import { cn } from "./cn";

defineOptions({ inheritAttrs: false });

withDefaults(
    defineProps<{
        color?: BadgeColor;
        /** Renders a small status dot before the label. */
        dot?: boolean;
    }>(),
    { color: "slate", dot: false },
);

const attrs = useAttrs();
const attrsRest = computed(() => {
    const { class: _, ...rest } = attrs;
    return rest;
});
</script>

<template>
    <span
        v-bind="attrsRest"
        :class="
            cn(
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium',
                colors[color].badge,
                attrs.class as string,
            )
        "
    >
        <span
            v-if="dot"
            :class="cn('w-1.5 h-1.5 rounded-full', colors[color].dot)"
            aria-hidden="true"
        />
        <slot />
    </span>
</template>
