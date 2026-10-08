<script module lang="ts">
    // Visual twin of the Board island's card (same shared `.ticket` classes),
    // kept drag-library free so the Kanban/Card island chunk stays tiny.
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
        class?: string;
    }

    let { card, class: className }: Props = $props();
</script>

<div class={cn("ticket", className)}>
    <p class="ticket__title">{card.title}</p>
    <div class="ticket__foot">
        <span class="ticket__tag">{card.tag}</span>
        <span class="ticket__grip" aria-hidden="true"></span>
    </div>
</div>
