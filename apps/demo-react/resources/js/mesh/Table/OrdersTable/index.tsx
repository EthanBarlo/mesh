import React, { useCallback, useMemo, useState } from "react";
import {
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type SortingState,
} from "@tanstack/react-table";
import { useWire } from "@mesh/react";
import DataTable from "@/components/demo/Table/DataTable";
import FilterInput from "@/components/demo/Table/FilterInput";
import TablePagination from "@/components/demo/Table/TablePagination";
import { buildColumns, type Order } from "./columns";

interface OrdersTableProps {
    orders: Order[];
}

const PAGE_SIZES = [10, 25, 50];

const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
    const wire = useWire<{ flagOrder: (id: number) => Promise<void> }>();

    // Table state is plain React state — sorting, filtering, and pagination
    // never leave the browser. Only the flag action talks to the server.
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

    const handleFlag = useCallback(
        async (id: number) => {
            setPendingIds((prev) => new Set(prev).add(id));
            try {
                await wire.$call("flagOrder", id);
            } finally {
                setPendingIds((prev) => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
            }
        },
        [wire],
    );

    const columns = useMemo(
        () => buildColumns({ onFlag: handleFlag, pendingIds }),
        [handleFlag, pendingIds],
    );

    const table = useReactTable({
        data: orders,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        // Stable row identity across server re-renders, sorts, and pages.
        getRowId: (row) => String(row.id),
        initialState: { pagination: { pageSize: 10 } },
    });

    const filteredCount = table.getFilteredRowModel().rows.length;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <FilterInput
                    value={globalFilter}
                    onChange={setGlobalFilter}
                    placeholder="Filter orders…"
                    ariaLabel="Filter orders"
                />

                <p className="text-xs text-zinc-500 tabular-nums">
                    {filteredCount === orders.length
                        ? `${orders.length} orders`
                        : `${filteredCount} of ${orders.length} orders`}
                    <span className="mx-1.5 text-zinc-700">·</span>
                    sorted, filtered &amp; paged client-side
                </p>
            </div>

            <DataTable
                table={table}
                emptyMessage={<>No orders match “{globalFilter}”.</>}
                // Flagged state comes from the server: $call("flagOrder") mutates
                // the Livewire component, and the refreshed `orders` prop re-renders
                // the row with its tint.
                rowClassName={(row) =>
                    row.original.flagged
                        ? "bg-rose-500/10 hover:bg-rose-500/[0.14]"
                        : "hover:bg-white/[0.04]"
                }
            />

            <TablePagination table={table} pageSizes={PAGE_SIZES} />
        </div>
    );
};

export default OrdersTable;
