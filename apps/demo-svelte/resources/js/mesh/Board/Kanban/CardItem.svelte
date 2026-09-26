<script module lang="ts">
    const TAG_STYLE = "bg-white/5 text-zinc-300 border-white/10";
</script>

<script lang="ts">
    import { cn } from "@/components/ui";
    import type { Card } from "./types";

    interface Props {
        card: Card;
    }

    let { card }: Props = $props();
</script>

<!-- data-card-id marks this as a draggable node (the empty-state
     placeholder in Column.svelte is skipped by the draggable filter). -->
<li
    data-card-id={card.id}
    class="rounded-lg cursor-grab active:cursor-grabbing touch-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
    aria-label={`${card.title} (${card.tag})`}
>
    <div
        class="p-3.5 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 space-y-2.5 transition-colors duration-150"
    >
        <p class="text-sm font-medium text-white leading-snug">{card.title}</p>
        <span
            class={cn(
                "inline-flex px-2 py-0.5 rounded-md border text-[11px] font-medium uppercase tracking-wide",
                TAG_STYLE,
            )}
        >
            {card.tag}
        </span>
    </div>
</li>
