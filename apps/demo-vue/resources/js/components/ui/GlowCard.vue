<script setup lang="ts">
import { cn } from "./cn";

/**
 * The featured card: a paper surface with a hairline border and registration
 * marks. `glow` and `glowClassName` are accepted for backwards compatibility
 * but are visual no-ops.
 */
withDefaults(
    defineProps<{
        /** @deprecated No-op — the drafting design renders no halo. Kept so call sites compile. */
        glow?: string;
        /** @deprecated No-op — the drafting design renders no halo. Kept so call sites compile. */
        glowClassName?: string;
        /** Classes for the inner card surface (padding, layout, …). */
        contentClassName?: string;
        /** Registration marks on two corners. On by default. */
        ticks?: boolean;
    }>(),
    { ticks: true },
);
</script>

<template>
    <div class="relative group">
        <div
            :class="
                cn(
                    'relative border border-line-2 bg-paper',
                    ticks && 'ui-ticks',
                    contentClassName,
                )
            "
        >
            <slot />
        </div>
    </div>
</template>
