<script lang="ts">
    import type { Snippet } from "svelte";
    import { GlowCard } from "@/components/ui";

    // The default slot — everything between the <mesh:slots.card> tags —
    // arrives as the `children` snippet. Named livewire:slot blocks arrive
    // together in the `slots` record, keyed by name. Both are server-rendered
    // HTML that Mesh keeps in sync with Livewire re-renders.
    interface Props {
        // `variant` still selects behaviour upstream; styling is the same regardless.
        variant?: string;
        children?: Snippet;
        slots?: Record<string, Snippet | undefined>;
    }

    let { variant, children, slots = {} }: Props = $props();
</script>

<!-- Each region is labelled with the prop it arrived on, like a callout on a drawing. -->
<GlowCard contentClassName="p-0">
    {#if slots.title}
        <header class="border-b border-line-2 px-5 pt-4 pb-4">
            <span class="k text-ink-3">slots.title</span>
            <h3 class="mt-1 text-lg leading-snug font-semibold tracking-tight text-ink">
                {@render slots.title?.()}
            </h3>
        </header>
    {/if}

    <div class="px-5 py-5">
        <span class="k text-ink-3">children</span>
        <div class="mt-1.5 text-sm leading-relaxed text-ink-2">
            {@render children?.()}
        </div>
    </div>

    {#if slots.footer}
        <footer class="border-t border-line-2 bg-paper-2 px-5 py-3">
            <span class="k text-ink-3">slots.footer</span>
            <div class="mt-0.5 text-xs leading-relaxed text-ink-2">
                {@render slots.footer?.()}
            </div>
        </footer>
    {/if}
</GlowCard>
