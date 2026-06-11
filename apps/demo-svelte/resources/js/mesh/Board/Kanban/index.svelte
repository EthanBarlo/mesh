<script lang="ts">
    import { useEntangle, useWire } from "@mesh/svelte";
    import { Badge, Button, cn } from "@/components/ui";
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
        <Badge
            color="slate"
            class="gap-2 px-3 py-1.5 bg-white/5 border-white/10 font-normal text-zinc-400"
        >
            <span
                class={cn(
                    "h-1.5 w-1.5 rounded-full",
                    syncCount > 0 ? "bg-emerald-400" : "bg-zinc-500",
                )}
                aria-hidden="true"
            ></span>
            {#if syncCount > 0}
                <span>
                    Synced
                    <span class="font-semibold text-zinc-200 tabular-nums">{syncCount}</span>
                    {syncCount === 1 ? "move" : "moves"} · last
                    <span class="font-mono text-zinc-300">{lastSyncAt}</span>
                </span>
            {:else}
                <span>No moves synced yet — drag a card</span>
            {/if}
        </Badge>

        <Button
            variant="secondary"
            size="xs"
            disabled={resetting}
            class="px-4 py-2"
            onclick={handleReset}
        >
            {resetting ? "Resetting…" : "Reset board"}
        </Button>
    </div>

    <!-- Board -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each columns.value ?? [] as column (column.id)}
            <Column {column} {drag} />
        {/each}
    </div>

    <p class="text-xs text-zinc-500">
        Drag with mouse or touch — cards reorder within a column and move across columns; every
        confirmed drop persists to your session.
    </p>
</div>
