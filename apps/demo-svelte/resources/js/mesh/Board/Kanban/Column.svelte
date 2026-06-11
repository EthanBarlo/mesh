<script module lang="ts">
    const ACCENTS: Record<string, string> = {
        backlog: "bg-zinc-500",
        "in-progress": "bg-amber-400",
        done: "bg-emerald-400",
    };
</script>

<script lang="ts">
    import { onDestroy } from "svelte";
    import { dragAndDrop } from "@formkit/drag-and-drop";
    import { cn } from "@/components/ui";
    import CardItem from "./CardItem.svelte";
    import type { BoardDrag } from "./useBoardDrag";
    import type { Card, Column as ColumnType } from "./types";

    interface Props {
        column: ColumnType;
        drag: BoardDrag;
    }

    let { column, drag }: Props = $props();

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

<div class="flex flex-col rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
    <header class="flex items-center gap-2.5 px-4 py-3 border-b border-white/5">
        <span
            class={cn("h-2 w-2 rounded-full", ACCENTS[column.id] ?? "bg-zinc-500")}
            aria-hidden="true"
        ></span>
        <h3 class="text-sm font-semibold text-white">{column.title}</h3>
        <span
            class="ml-auto px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-medium tabular-nums text-zinc-400"
        >
            {cards.length}
        </span>
    </header>

    <ul
        use:dropList
        class="flex-1 p-3 space-y-2.5 min-h-36 transition-colors duration-150"
        aria-label={`${column.title} column`}
    >
        {#each cards as card (card.id)}
            <CardItem {card} />
        {/each}

        {#if cards.length === 0}
            <li
                class="flex items-center justify-center h-24 rounded-lg border border-dashed border-white/10 text-xs text-zinc-500"
            >
                Drop cards here
            </li>
        {/if}
    </ul>
</div>
