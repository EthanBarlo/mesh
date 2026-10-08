import React from "react";
import { type Table } from "@tanstack/react-table";
import { Button, Select, cn } from "@/components/ui";

export interface TablePaginationProps<TData> {
    table: Table<TData>;
    pageSizes: number[];
    className?: string;
}

/** Rows-per-page select, "Page x / y" readout, and Previous/Next controls. */
function TablePagination<TData>({
    table,
    pageSizes,
    className,
}: TablePaginationProps<TData>) {
    const { pageIndex, pageSize } = table.getState().pagination;
    const pageCount = Math.max(table.getPageCount(), 1);
    const pad = (n: number) => String(n).padStart(2, "0");

    return (
        <div
            className={cn(
                "flex flex-wrap items-center justify-between gap-3",
                className,
            )}
        >
            <label className="k k--caps flex items-center gap-2.5 text-ink-3">
                Rows
                <Select
                    value={pageSize}
                    onChange={(event) => table.setPageSize(Number(event.target.value))}
                    aria-label="Rows per page"
                >
                    {pageSizes.map((size) => (
                        <option key={size} value={size}>
                            {size}
                        </option>
                    ))}
                </Select>
            </label>

            <div className="flex items-center gap-3">
                <span className="k k--caps text-ink-3 tabular-nums" aria-live="polite">
                    Page <span className="text-ink">{pad(pageIndex + 1)}</span> / {pad(pageCount)}
                </span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default TablePagination;
