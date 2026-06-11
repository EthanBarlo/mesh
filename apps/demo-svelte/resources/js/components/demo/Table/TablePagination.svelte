<script lang="ts" generics="TData">
    import type { HTMLAttributes } from "svelte/elements";
    import type { Table } from "@tanstack/table-core";
    import { Button, Select, cn } from "@/components/ui";

    /** Rows-per-page select, "Page x of y" readout, and Previous/Next controls. */
    interface Props extends HTMLAttributes<HTMLDivElement> {
        table: Table<TData>;
        pageSizes: number[];
    }

    let { table, pageSizes, class: className, ...rest }: Props = $props();

    const pageIndex = $derived(table.getState().pagination.pageIndex);
    const pageCount = $derived(Math.max(table.getPageCount(), 1));
</script>

<div
    {...rest}
    class={cn("flex flex-wrap items-center justify-between gap-3", className)}
>
    <label class="flex items-center gap-2 text-xs text-zinc-500">
        Rows per page
        <!-- Function binding: the writable-computed equivalent for page size. -->
        <Select
            bind:value={
                () => table.getState().pagination.pageSize,
                (value) => table.setPageSize(Number(value))
            }
            aria-label="Rows per page"
        >
            {#each pageSizes as size (size)}
                <option value={size}>{size}</option>
            {/each}
        </Select>
    </label>

    <div class="flex items-center gap-3">
        <span class="text-xs text-zinc-500 tabular-nums">
            Page {pageIndex + 1} of {pageCount}
        </span>
        <div class="flex items-center gap-2">
            <Button
                variant="secondary"
                size="xs"
                disabled={!table.getCanPreviousPage()}
                class="font-normal disabled:opacity-40"
                onclick={() => table.previousPage()}
            >
                Previous
            </Button>
            <Button
                variant="primary"
                size="xs"
                disabled={!table.getCanNextPage()}
                class="font-medium disabled:opacity-40"
                onclick={() => table.nextPage()}
            >
                Next
            </Button>
        </div>
    </div>
</div>
