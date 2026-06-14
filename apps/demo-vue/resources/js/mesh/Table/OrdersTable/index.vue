<script setup lang="ts">
import { computed, ref } from "vue";
import {
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useVueTable,
    type Row,
    type SortingState,
} from "@tanstack/vue-table";
import { useWire } from "@mesh/vue";
import DataTable from "@/components/demo/Table/DataTable.vue";
import FilterInput from "@/components/demo/Table/FilterInput.vue";
import TablePagination from "@/components/demo/Table/TablePagination.vue";
import { buildColumns, type Order } from "./columns";

interface OrdersTableProps {
    orders: Order[];
}

const PAGE_SIZES = [10, 25, 50];

const props = defineProps<OrdersTableProps>();

const wire = useWire<{ flagOrder: (id: number) => Promise<void> }>();

// Table state is plain Vue state — sorting, filtering, and pagination
// never leave the browser. Only the flag action talks to the server.
const sorting = ref<SortingState>([]);
const globalFilter = ref("");
const pendingIds = ref<Set<number>>(new Set());

async function handleFlag(id: number) {
    pendingIds.value = new Set(pendingIds.value).add(id);
    try {
        await wire.$call("flagOrder", id);
    } finally {
        const next = new Set(pendingIds.value);
        next.delete(id);
        pendingIds.value = next;
    }
}

const columns = computed(() =>
    buildColumns({ onFlag: handleFlag, pendingIds: pendingIds.value }),
);

const table = useVueTable({
    get data() {
        return props.orders;
    },
    get columns() {
        return columns.value;
    },
    state: {
        get sorting() {
            return sorting.value;
        },
        get globalFilter() {
            return globalFilter.value;
        },
    },
    onSortingChange: (updater) => {
        sorting.value =
            typeof updater === "function" ? updater(sorting.value) : updater;
    },
    onGlobalFilterChange: (updater) => {
        globalFilter.value =
            typeof updater === "function" ? updater(globalFilter.value) : updater;
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // Stable row identity across server re-renders, sorts, and pages.
    getRowId: (row) => String(row.id),
    initialState: { pagination: { pageSize: 10 } },
});

const filteredCount = computed(() => table.getFilteredRowModel().rows.length);

// Flagged state comes from the server: $call("flagOrder") mutates the
// Livewire component, and the refreshed `orders` prop re-renders the row
// with its tint.
const rowClassName = (row: Row<Order>) =>
    row.original.flagged
        ? "bg-rose-500/10 hover:bg-rose-500/[0.14]"
        : "hover:bg-white/[0.04]";
</script>

<template>
    <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <FilterInput
                v-model="globalFilter"
                placeholder="Filter orders…"
                aria-label="Filter orders"
            />

            <p class="text-xs text-zinc-500 tabular-nums">
                {{
                    filteredCount === orders.length
                        ? `${orders.length} orders`
                        : `${filteredCount} of ${orders.length} orders`
                }}
                <span class="mx-1.5 text-zinc-700">·</span>
                sorted, filtered &amp; paged client-side
            </p>
        </div>

        <DataTable :table="table" :row-class-name="rowClassName">
            <template #empty>No orders match “{{ globalFilter }}”.</template>
        </DataTable>

        <TablePagination :table="table" :page-sizes="PAGE_SIZES" />
    </div>
</template>
