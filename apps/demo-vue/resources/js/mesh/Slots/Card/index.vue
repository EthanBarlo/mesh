<script setup lang="ts">
import { GlowCard } from "@/components/ui";

// The default slot — everything between the <mesh:slots.card> tags —
// arrives as the native default slot. Named livewire:slot blocks arrive
// as native named Vue slots. Both are server-rendered HTML that Mesh
// keeps in sync with Livewire re-renders.
defineProps<{
    // `variant` still selects behaviour upstream; styling is the same regardless.
    variant?: string;
}>();
</script>

<!-- Each region is labelled with the slot it arrived on, like a callout on a drawing. -->
<template>
    <GlowCard content-class-name="p-0">
        <header v-if="$slots.title" class="border-b border-line-2 px-5 pt-4 pb-4">
            <span class="k text-ink-3">#title</span>
            <h3 class="mt-1 text-lg leading-snug font-semibold tracking-tight text-ink">
                <slot name="title" />
            </h3>
        </header>

        <div class="px-5 py-5">
            <span class="k text-ink-3">#default</span>
            <div class="mt-1.5 text-sm leading-relaxed text-ink-2">
                <slot />
            </div>
        </div>

        <footer v-if="$slots.footer" class="border-t border-line-2 bg-paper-2 px-5 py-3">
            <span class="k text-ink-3">#footer</span>
            <div class="mt-0.5 text-xs leading-relaxed text-ink-2">
                <slot name="footer" />
            </div>
        </footer>
    </GlowCard>
</template>
