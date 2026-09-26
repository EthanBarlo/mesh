<script module lang="ts">
    // Visual twin of the Board island's card face, kept drag-library free so
    // the Kanban/Card island chunk stays tiny.
    export interface KanbanCard {
        id: string;
        title: string;
        tag: string;
    }
</script>

<script lang="ts">
    import { cn } from "@/components/ui";

    interface Props {
        card: KanbanCard;
    }

    let { card }: Props = $props();

    const TAG_STYLE = "bg-white/5 text-zinc-300 border-white/10";
</script>

<div
    class="p-3.5 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 space-y-2.5 transition-colors"
>
    <p class="text-sm font-medium text-white leading-snug">
        {card.title}
    </p>
    <span
        class={cn(
            "inline-flex px-2 py-0.5 rounded-md border text-[11px] font-medium uppercase tracking-wide",
            TAG_STYLE,
        )}
    >
        {card.tag}
    </span>
</div>
