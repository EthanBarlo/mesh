<script lang="ts">
    import type { Snippet } from "svelte";
    import { GlowCard } from "@/components/ui";

    // The default slot — everything between the <mesh:slots.card> tags —
    // arrives as the `children` snippet. Named livewire:slot blocks arrive
    // in the `slots` record. Both are server-rendered HTML that Mesh
    // keeps in sync with Livewire re-renders.
    interface Props {
        // `variant` still selects behaviour upstream; styling is mono regardless.
        variant?: string;
        children?: Snippet;
        slots?: Record<string, Snippet | undefined>;
    }

    let { variant, children, slots = {} }: Props = $props();
</script>

<GlowCard contentClassName="overflow-hidden p-0">
    {#if slots.title}
        <header class="px-6 pt-5 pb-4 border-b border-white/5">
            <span class="block text-xs font-medium uppercase tracking-widest text-zinc-500 mb-1.5">
                slots.title
            </span>
            <h3 class="text-lg font-semibold text-white tracking-tight leading-snug">
                {@render slots.title?.()}
            </h3>
        </header>
    {/if}

    <div class="px-6 py-5 text-sm text-zinc-300 leading-relaxed">
        {@render children?.()}
    </div>

    {#if slots.footer}
        <footer class="px-6 py-3 border-t border-white/5 text-xs text-zinc-500">
            {@render slots.footer?.()}
        </footer>
    {/if}
</GlowCard>
