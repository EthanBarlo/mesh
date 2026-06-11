import React from "react";
import { type Table } from "@tanstack/react-table";
import { Button, Select, cn } from "@/components/ui";

export interface TablePaginationProps<TData> {
    table: Table<TData>;
    pageSizes: number[];
    className?: string;
}

/** Rows-per-page select, "Page x of y" readout, and Previous/Next controls. */
function TablePagination<TData>({
    table,
    pageSizes,
    className,
}: TablePaginationProps<TData>) {
    const { pageIndex, pageSize } = table.getState().pagination;
    const pageCount = Math.max(table.getPageCount(), 1);

    return (
        <div
            className={cn(
                "flex flex-wrap items-center justify-between gap-3",
                className,
            )}
        >
            <label className="flex items-center gap-2 text-xs text-slate-500">
                Rows per page
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
                <span className="text-xs text-slate-500 tabular-nums">
                    Page {pageIndex + 1} of {pageCount}
                </span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="font-normal disabled:opacity-40"
                    >
                        Previous
                    </Button>
                    <Button
                        variant="primary"
                        size="xs"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="bg-gradient-to-r font-medium disabled:opacity-40"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default TablePagination;
