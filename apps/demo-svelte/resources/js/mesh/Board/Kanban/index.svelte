<script lang="ts">
    import { useEntangle, useWire } from "@mesh/svelte";
    import { Button } from "@/components/ui";
    import Column from "./Column.svelte";
    import { useBoardDrag } from "./useBoardDrag";
    import type { Column as ColumnType } from "./types";

    interface Props {
        syncCount: number;
        lastSyncAt: string;
    }

    let { syncCount, lastSyncAt }: Props = $props();

    interface KanbanWire {
        moveCard: (cardId: string, fromCol: string, toCol: string, position: number) => Promise<void>;
        resetBoard: () => Promise<void>;
    }

    // Single source of board state, two-way bound to the Livewire property.
    // Deferred: local drags update instantly, then batch with the moveCard call.
    const columns = useEntangle<ColumnType[]>("columns");
    const wire = useWire<KanbanWire>();

    let resetting = $state(false);

    // The column the dragged card currently sits in; its list shows data-over.
    let overColumn = $state<string | null>(null);

    // The @formkit/drag-and-drop mechanics live in useBoardDrag; the board only
    // declares what a confirmed move means.
    const drag = useBoardDrag({
        board: () => columns.value ?? [],
        setColumns: (next) => {
            columns.value = next;
        },
        // Confirm server-side: the deferred entangle batches with this call, then
        // moveCard normalizes, persists to the session, and bumps the sync badge.
        onMove: (cardId, fromCol, toCol, position) =>
            wire.$call("moveCard", cardId, fromCol, toCol, position),
        onOver: (columnId) => {
            overColumn = columnId;
        },
    });

    const handleReset = async () => {
        resetting = true;
        try {
            // The server reseeds $columns; the entangled box streams the fresh
            // board back into each column's drag list — no manual refetch needed.
            await wire.$call("resetBoard");
        } finally {
            resetting = false;
        }
    };
</script>

<div class="space-y-4">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="sync k k--caps" data-on={syncCount > 0 || undefined} aria-live="polite">
            <span class="sync__dot" aria-hidden="true"></span>
            {#if syncCount > 0}
                <span>
                    Synced <span class="sync__v">{syncCount}</span>
                    {syncCount === 1 ? "move" : "moves"} · last
                    <span class="sync__v">{lastSyncAt}</span>
                </span>
            {:else}
                <span>No moves synced yet. Drag a card.</span>
            {/if}
        </p>

        <Button variant="secondary" size="sm" disabled={resetting} onclick={handleReset}>
            {resetting ? "Resetting…" : "Reset board"}
        </Button>
    </div>

    <!-- Board. `isolate` keeps the z-index formkit leaves on a dragged card
         inside the board, below the sticky masthead. -->
    <div class="isolate grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each columns.value ?? [] as column (column.id)}
            <Column {column} {drag} over={overColumn === column.id} />
        {/each}
    </div>

    <p class="font-mono text-[11px] tracking-[0.04em] leading-loose text-ink-3">
        Drag with mouse or touch. Cards reorder within a column and move across columns; every
        confirmed drop is saved to your session.
    </p>
</div>
