<script lang="ts">
    import { useWire } from "@mesh/svelte";
    import {
        announceDragEnd,
        readPayload,
        useKanbanDrag,
    } from "@/components/demo/Kanban/dnd.svelte";

    /**
     * One island per column. Mesh wrappers are display:contents, so this
     * fragment's two elements — the header and the `order-1` drop tail —
     * become direct flex items of the Blade column cell, and the Blade-
     * rendered card islands (order 0) slot visually between them.
     */
    interface Props {
        columnId: string;
        title: string;
        count: number;
    }

    let { columnId, title, count }: Props = $props();

    const wire = useWire();
    const drag = useKanbanDrag();
    let over = $state(false);

    const handleDragOver = (event: DragEvent) => {
        if (!drag.value) return;
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
        over = true;
    };

    const handleDrop = (event: DragEvent) => {
        event.preventDefault();
        over = false;

        const payload =
            (event.dataTransfer ? readPayload(event.dataTransfer) : null) ?? drag.value;
        if (!payload) return;
        // Already the last card of this column — nothing to move.
        if (payload.fromColumnId === columnId && payload.fromPosition === count - 1) {
            announceDragEnd();
            return;
        }

        // Append; the Board clamps the position server-side.
        wire.$dispatch("kanban.card-moved", {
            cardId: payload.cardId,
            title: payload.title,
            fromColumnId: payload.fromColumnId,
            toColumnId: columnId,
            position: count,
        });
    };
</script>

<header class="lane__head">
    <span class="lane__mark" data-lane={columnId} aria-hidden="true"></span>
    <h3 class="lane__title">{title}</h3>
    <!-- Live count: a reactive prop straight from the Board. -->
    <span class="lane__count" title={`${count} cards`}>
        {String(count).padStart(2, "0")}
    </span>
</header>

<!-- Catch-all drop target: order-1 sorts it after every card,
     flex-1 stretches it over the column's remaining space. -->
<div
    data-drop-tail={columnId}
    class="lane__tail"
    data-armed={drag.value || count === 0 ? "" : undefined}
    data-over={over ? "" : undefined}
    ondragover={handleDragOver}
    ondragleave={() => (over = false)}
    ondrop={handleDrop}
>
    {#if drag.value || count === 0}
        <span class="k k--caps pointer-events-none">
            {drag.value ? "Drop here" : "No cards. Drag one in."}
        </span>
    {/if}
</div>
