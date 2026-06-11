import React from "react";
import { flexRender, type Row, type Table } from "@tanstack/react-table";
import { cn } from "@/components/ui";

export interface DataTableProps<TData> {
    table: Table<TData>;
    /** Shown in a full-width row when the row model is empty. */
    emptyMessage: React.ReactNode;
    /** Per-row classes (e.g. a flagged tint) merged after the base transition classes. */
    rowClassName?: (row: Row<TData>) => string;
    className?: string;
}

/**
 * Generic TanStack Table renderer: bordered wrapper, sortable headers with
 * ▲/▼/↕ indicators, and meta.headerClass / meta.cellClass support.
 */
function DataTable<TData>({
    table,
    emptyMessage,
    rowClassName,
    className,
}: DataTableProps<TData>) {
    const rows = table.getRowModel().rows;

    return (
        <div
            className={cn(
                "overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02]",
                className,
            )}
        >
            <table className="w-full text-sm">
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr
                            key={headerGroup.id}
                            className="border-b border-white/5 bg-white/[0.02]"
                        >
                            {headerGroup.headers.map((header) => {
                                const canSort = header.column.getCanSort();
                                const sorted = header.column.getIsSorted();

                                return (
                                    <th
                                        key={header.id}
                                        className={cn(
                                            "px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-zinc-500",
                                            header.column.columnDef.meta?.headerClass,
                                        )}
                                    >
                                        {header.isPlaceholder ? null : canSort ? (
                                            <button
                                                type="button"
                                                onClick={header.column.getToggleSortingHandler()}
                                                className={cn(
                                                    "group inline-flex items-center gap-1.5 hover:text-white transition-colors duration-150 focus:outline-none focus:text-white",
                                                    sorted && "text-white",
                                                )}
                                                aria-label={`Sort by ${String(
                                                    header.column.columnDef.header,
                                                )}`}
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )}
                                                <span
                                                    className={cn(
                                                        "text-[10px]",
                                                        sorted
                                                            ? "text-zinc-300"
                                                            : "text-zinc-600 group-hover:text-zinc-400",
                                                    )}
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
                <tbody className="divide-y divide-white/5">
                    {rows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={table.getAllLeafColumns().length}
                                className="px-4 py-10 text-center text-zinc-500"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        rows.map((row) => (
                            <tr
                                key={row.id}
                                className={cn(
                                    "transition-colors duration-150",
                                    rowClassName?.(row),
                                )}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        className={cn(
                                            "px-4 py-3 whitespace-nowrap",
                                            cell.column.columnDef.meta?.cellClass,
                                        )}
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
    );
}

export default DataTable;
