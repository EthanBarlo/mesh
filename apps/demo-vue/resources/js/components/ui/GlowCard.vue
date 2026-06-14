<script setup lang="ts">
import { cn } from "./cn";

/**
 * A flat mono card. The `glow` and `glowClassName` props are accepted for
 * backwards compatibility but are visual no-ops — no halo is rendered.
 */
defineProps<{
    /** @deprecated No-op — the mono design renders no halo. Kept so call sites compile. */
    glow?: string;
    /** @deprecated No-op — the mono design renders no halo. Kept so call sites compile. */
    glowClassName?: string;
    /** Classes for the inner card surface (padding, layout, …). */
    contentClassName?: string;
}>();
</script>

<template>
    <div class="relative group">
        <div
            :class="
                cn(
                    'relative rounded-xl bg-white/[0.02] border border-white/5',
                    contentClassName,
                )
            "
        >
            <slot />
        </div>
    </div>
</template>
