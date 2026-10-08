<script lang="ts">
    import { onDestroy } from "svelte";
    import { dragAndDrop } from "@formkit/drag-and-drop";
    import CardItem from "./CardItem.svelte";
    import type { BoardDrag } from "./useBoardDrag";
    import type { Card, Column as ColumnType } from "./types";

    interface Props {
        column: ColumnType;
        drag: BoardDrag;
        /** The dragged card sits in this column: its list is the drop target. */
        over?: boolean;
    }

    let { column, drag, over = false }: Props = $props();

    // The library replaces the whole list on every sort/transfer, so a
    // shallow $state.raw array is all the reactivity we need.
    let cards = $state.raw<Card[]>([...column.cards]);

    drag.register(column.id, {
        get value() {
            return cards;
        },
        set value(next) {
            cards = next;
        },
    });
    onDestroy(() => drag.unregister(column.id));

    // Server-driven updates (reset, reseed) stream back into the drag list.
    $effect(() => {
        cards = [...column.cards];
    });

    // Each column is its own drop list; the shared group config (from
    // useBoardDrag) lets cards sort within it and transfer across columns.
    // Wired with the vanilla dragAndDrop API as a Svelte action.
    const dropList = (el: HTMLElement) => {
        dragAndDrop<Card>({
            parent: el,
            getValues: () => cards,
            setValues: (next) => {
                cards = next;
            },
            config: drag.listConfig,
        });
    };
</script>

<!-- A drawing frame: mono caps header with a progress mark and a count. -->
<div class="lane">
    <header class="lane__head">
        <span class="lane__mark" data-lane={column.id} aria-hidden="true"></span>
        <h3 class="lane__title">{column.title}</h3>
        <span class="lane__count" title={`${cards.length} cards`}>
            {String(cards.length).padStart(2, "0")}
        </span>
    </header>

    <ul
        use:dropList
        class="lane__list"
        data-over={over || undefined}
        aria-label={`${column.title} column`}
    >
        {#each cards as card (card.id)}
            <CardItem {card} />
        {/each}

        {#if cards.length === 0}
            <li class="lane__empty k k--caps">Drop cards here</li>
        {/if}
    </ul>
</div>
