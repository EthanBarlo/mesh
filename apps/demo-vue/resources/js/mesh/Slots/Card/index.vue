<script setup lang="ts">
import { GlowCard } from "@/components/ui";

// The default slot — everything between the <mesh:slots.card> tags —
// arrives as the native default slot. Named livewire:slot blocks arrive
// as native named Vue slots. Both are server-rendered HTML that Mesh
// keeps in sync with Livewire re-renders.
defineProps<{
    // `variant` still selects behaviour upstream; styling is mono regardless.
    variant?: string;
}>();
</script>

<template>
    <GlowCard content-class-name="overflow-hidden p-0">
        <header v-if="$slots.title" class="px-6 pt-5 pb-4 border-b border-white/5">
            <span class="block text-xs font-medium uppercase tracking-widest text-zinc-500 mb-1.5">
                slots.title
            </span>
            <h3 class="text-lg font-semibold text-white tracking-tight leading-snug">
                <slot name="title" />
            </h3>
        </header>

        <div class="px-6 py-5 text-sm text-zinc-300 leading-relaxed">
            <slot />
        </div>

        <footer v-if="$slots.footer" class="px-6 py-3 border-t border-white/5 text-xs text-zinc-500">
            <slot name="footer" />
        </footer>
    </GlowCard>
</template>
