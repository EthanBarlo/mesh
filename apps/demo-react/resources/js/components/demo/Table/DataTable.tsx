import React from "react";
import { flexRender, type Row, type Table } from "@tanstack/react-table";
import { cn } from "@/components/ui";

export interface DataTableProps<TData> {
    table: Table<TData>;
    /** Shown in a full-width row when the row model is empty. */
    emptyMessage: React.ReactNode;
    /** Per-row classes, e.g. `bom__flagged` for a highlighted row. */
    rowClassName?: (row: Row<TData>) => string;
    className?: string;
}

/** A small drawn caret pair: the active direction is inked, the other stays faint. */
const SortCaret: React.FC = () => (
    <svg className="bom__caret" viewBox="0 0 7 11" aria-hidden="true">
        <path className="bom__caret-up" d="M0.5 4L3.5 1L6.5 4" />
        <path className="bom__caret-down" d="M0.5 7L3.5 10L6.5 7" />
    </svg>
);

/**
 * Generic TanStack Table renderer, drawn as a bill of materials: mono caps
 * headers over an ink rule, hairline rows, drawn sort carets, and
 * meta.headerClass / meta.cellClass support. The look lives in the shared
 * `.bom` classes (resources/css/ecosystem.css).
 */
function DataTable<TData>({
    table,
    emptyMessage,
    rowClassName,
    className,
}: DataTableProps<TData>) {
    const rows = table.getRowModel().rows;

    return (
        <div className={cn("bom", className)}>
            <table>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                const canSort = header.column.getCanSort();
                                const sorted = header.column.getIsSorted();
                                const label =
                                    typeof header.column.columnDef.header === "string"
                                        ? header.column.columnDef.header
                                        : header.column.id;

                                return (
                                    <th
                                        key={header.id}
                                        scope="col"
                                        aria-sort={
                                            sorted === "asc"
                                                ? "ascending"
                                                : sorted === "desc"
                                                  ? "descending"
                                                  : undefined
                                        }
                                        className={cn(
                                            "text-left",
                                            header.column.columnDef.meta?.headerClass,
                                        )}
                                    >
                                        {header.isPlaceholder ? null : canSort ? (
                                            <button
                                                type="button"
                                                onClick={header.column.getToggleSortingHandler()}
                                                className="bom__sort"
                                                data-sorted={sorted || undefined}
                                                aria-label={`Sort by ${label}`}
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )}
                                                <SortCaret />
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
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td
                                colSpan={table.getAllLeafColumns().length}
                                className="bom__empty"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        rows.map((row) => (
                            <tr
                                key={row.id}
                                className={rowClassName?.(row) || undefined}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        className={
                                            cell.column.columnDef.meta?.cellClass || undefined
                                        }
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
