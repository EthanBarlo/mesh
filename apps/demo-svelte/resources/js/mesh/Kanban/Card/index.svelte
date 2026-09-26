<script lang="ts">
    import { useWire } from "@mesh/svelte";
    import { cn } from "@/components/ui";
    import CardFace, { type KanbanCard } from "@/components/demo/Kanban/CardFace.svelte";
    import {
        announceDragEnd,
        announceDragStart,
        readPayload,
        useKanbanDrag,
        writePayload,
    } from "@/components/demo/Kanban/dnd.svelte";

    /**
     * One island per card. It holds no board state — `columnId` and
     * `position` are reactive props from the parent Livewire Board, and a
     * drop is just an event dispatched onto Livewire's bus.
     */
    interface Props {
        card: KanbanCard;
        columnId: string;
        position: number;
    }

    let { card, columnId, position }: Props = $props();

    const wire = useWire();
    const drag = useKanbanDrag();
    let indicator = $state<"above" | "below" | null>(null);

    const isSource = $derived(drag.value?.cardId === card.id);

    const handleDragStart = (event: DragEvent) => {
        if (!event.dataTransfer) return;
        const payload = {
            cardId: card.id,
            title: card.title,
            fromColumnId: columnId,
            fromPosition: position,
        };
        writePayload(event.dataTransfer, payload);
        announceDragStart(payload);
    };

    // Fires on drop AND on cancel — every island clears its drag state.
    const handleDragEnd = () => announceDragEnd();

    const handleDragOver = (event: DragEvent) => {
        if (!drag.value || isSource) return;
        // preventDefault marks this card as a valid drop target.
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        indicator =
            event.clientY < rect.top + rect.height / 2 ? "above" : "below";
    };

    const handleDragLeave = (event: DragEvent) => {
        if ((event.currentTarget as Node).contains(event.relatedTarget as Node)) return;
        indicator = null;
    };

    const handleDrop = (event: DragEvent) => {
        event.preventDefault();
        // Recompute from the event — the indicator state is for visuals only.
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const side =
            event.clientY < rect.top + rect.height / 2 ? "above" : "below";
        indicator = null;

        // dataTransfer is only readable on drop (protected mode) — fall
        // back to the broadcast drag state, bail on foreign drags.
        const payload =
            (event.dataTransfer ? readPayload(event.dataTransfer) : null) ?? drag.value;
        if (!payload) return;

        let insertAt = side === "above" ? position : position + 1;
        // The server detaches the card first, shifting later indexes down.
        if (payload.fromColumnId === columnId && payload.fromPosition < insertAt) {
            insertAt -= 1;
        }
        if (payload.fromColumnId === columnId && insertAt === payload.fromPosition) {
            return; // dropped back where it started
        }

        // Persistent state goes through Livewire: the Board (and anyone
        // else listening) catches this and re-renders every island.
        wire.$dispatch("kanban.card-moved", {
            cardId: payload.cardId,
            title: payload.title,
            fromColumnId: payload.fromColumnId,
            toColumnId: columnId,
            position: insertAt,
        });
    };
</script>

<div
    draggable="true"
    data-card-id={card.id}
    data-column-id={columnId}
    class={cn(
        "relative mx-3 mt-2.5 cursor-grab active:cursor-grabbing select-none",
        isSource && "opacity-40",
    )}
    aria-label={`${card.title} (${card.tag})`}
    ondragstart={handleDragStart}
    ondragend={handleDragEnd}
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
>
    {#if indicator === "above"}
        <span
            class="absolute inset-x-1 -top-[7px] h-0.5 rounded-full bg-rose-400 pointer-events-none"
        ></span>
    {/if}
    <CardFace {card} />
    {#if indicator === "below"}
        <span
            class="absolute inset-x-1 -bottom-[7px] h-0.5 rounded-full bg-rose-400 pointer-events-none"
        ></span>
    {/if}
</div>
