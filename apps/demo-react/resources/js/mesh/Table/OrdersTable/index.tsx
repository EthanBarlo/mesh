import React, { useCallback, useMemo, useState } from "react";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type SortingState,
} from "@tanstack/react-table";
import { useWire } from "@mesh/react";
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
    const { pageIndex, pageSize } = table.getState().pagination;
    const pageCount = Math.max(table.getPageCount(), 1);

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative">
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        value={globalFilter}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        placeholder="Filter orders…"
                        aria-label="Filter orders"
                        className="w-64 pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-150"
                    />
                </div>

                <p className="text-xs text-slate-500 tabular-nums">
                    {filteredCount === orders.length
                        ? `${orders.length} orders`
                        : `${filteredCount} of ${orders.length} orders`}
                    <span className="mx-1.5 text-slate-700">·</span>
                    sorted, filtered &amp; paged client-side
                </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900/40">
                <table className="w-full text-sm">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr
                                key={headerGroup.id}
                                className="border-b border-white/10 bg-white/[0.03]"
                            >
                                {headerGroup.headers.map((header) => {
                                    const canSort = header.column.getCanSort();
                                    const sorted = header.column.getIsSorted();

                                    return (
                                        <th
                                            key={header.id}
                                            className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 ${
                                                header.column.columnDef.meta?.headerClass ?? ""
                                            }`}
                                        >
                                            {header.isPlaceholder ? null : canSort ? (
                                                <button
                                                    type="button"
                                                    onClick={header.column.getToggleSortingHandler()}
                                                    className={`group inline-flex items-center gap-1.5 hover:text-white transition-colors duration-150 focus:outline-none focus:text-white ${
                                                        sorted ? "text-white" : ""
                                                    }`}
                                                    aria-label={`Sort by ${String(
                                                        header.column.columnDef.header,
                                                    )}`}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext(),
                                                    )}
                                                    <span
                                                        className={`text-[10px] ${
                                                            sorted
                                                                ? "text-rose-400"
                                                                : "text-slate-600 group-hover:text-slate-400"
                                                        }`}
                                                        aria-hidden="true"
                                                    >
                                                        {sorted === "asc"
                                                            ? "▲"
                                                            : sorted === "desc"
                                                              ? "▼"
                                                              : "↕"}
                                                    </span>
                                                </button>
                                            ) : (
                                                flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-10 text-center text-slate-500"
                                >
                                    No orders match “{globalFilter}”.
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className={`transition-colors duration-150 ${
                                        row.original.flagged
                                            ? "bg-rose-500/10 hover:bg-rose-500/15"
                                            : "hover:bg-white/5"
                                    }`}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className={`px-4 py-3 whitespace-nowrap ${
                                                cell.column.columnDef.meta?.cellClass ?? ""
                                            }`}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination footer */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-500">
                    Rows per page
                    <select
                        value={pageSize}
                        onChange={(event) => table.setPageSize(Number(event.target.value))}
                        aria-label="Rows per page"
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                        {PAGE_SIZES.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </label>

                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 tabular-nums">
                        Page {pageIndex + 1} of {pageCount}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-700/50 border border-white/10 text-sm text-white hover:bg-slate-700 hover:border-white/20 active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                        >
                            Previous
                        </button>
                        <button
                            type="button"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-sm font-medium text-white hover:from-rose-600 hover:to-orange-600 active:scale-95 transition-all duration-150 shadow-lg shadow-rose-500/25 disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrdersTable;
