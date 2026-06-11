<script lang="ts">
    import {
        getCoreRowModel,
        getFilteredRowModel,
        getPaginationRowModel,
        getSortedRowModel,
        type Row,
        type SortingState,
    } from "@tanstack/table-core";
    import { useWire } from "@mesh/svelte";
    import { createSvelteTable } from "@/components/demo/Table/svelte-table.svelte";
    import DataTable from "@/components/demo/Table/DataTable.svelte";
    import FilterInput from "@/components/demo/Table/FilterInput.svelte";
    import TablePagination from "@/components/demo/Table/TablePagination.svelte";
    import { buildColumns, type Order } from "./columns";

    interface OrdersTableProps {
        orders: Order[];
    }

    const PAGE_SIZES = [10, 25, 50];

    let { orders }: OrdersTableProps = $props();

    const wire = useWire<{ flagOrder: (id: number) => Promise<void> }>();

    // Table state is plain Svelte state — sorting, filtering, and pagination
    // never leave the browser. Only the flag action talks to the server.
    let sorting = $state<SortingState>([]);
    let globalFilter = $state("");
    let pendingIds = $state.raw<Set<number>>(new Set());

    async function handleFlag(id: number) {
        pendingIds = new Set(pendingIds).add(id);
        try {
            await wire.$call("flagOrder", id);
        } finally {
            const next = new Set(pendingIds);
            next.delete(id);
            pendingIds = next;
        }
    }

    const columns = $derived(
        buildColumns({ onFlag: handleFlag, pendingIds }),
    );

    const table = createSvelteTable({
        get data() {
            return orders;
        },
        get columns() {
            return columns;
        },
        state: {
            get sorting() {
                return sorting;
            },
            get globalFilter() {
                return globalFilter;
            },
        },
        onSortingChange: (updater) => {
            sorting = typeof updater === "function" ? updater(sorting) : updater;
        },
        onGlobalFilterChange: (updater) => {
            globalFilter =
                typeof updater === "function" ? updater(globalFilter) : updater;
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        // Stable row identity across server re-renders, sorts, and pages.
        getRowId: (row) => String(row.id),
        initialState: { pagination: { pageSize: 10 } },
    });

    const filteredCount = $derived(table.getFilteredRowModel().rows.length);

    // Flagged state comes from the server: $call("flagOrder") mutates the
    // Livewire component, and the refreshed `orders` prop re-renders the row
    // with its tint.
    const rowClassName = (row: Row<Order>) =>
        row.original.flagged
            ? "bg-rose-500/10 hover:bg-rose-500/[0.14]"
            : "hover:bg-white/[0.04]";
</script>

<div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
        <FilterInput
            bind:value={globalFilter}
            placeholder="Filter orders…"
            ariaLabel="Filter orders"
        />

        <p class="text-xs text-zinc-500 tabular-nums">
            {filteredCount === orders.length
                ? `${orders.length} orders`
                : `${filteredCount} of ${orders.length} orders`}
            <span class="mx-1.5 text-zinc-700">·</span>
            sorted, filtered &amp; paged client-side
        </p>
    </div>

    <DataTable {table} {rowClassName}>
        {#snippet empty()}No orders match “{globalFilter}”.{/snippet}
    </DataTable>

    <TablePagination {table} pageSizes={PAGE_SIZES} />
</div>
