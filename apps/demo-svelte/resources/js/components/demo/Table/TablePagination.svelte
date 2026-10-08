<script lang="ts" generics="TData">
    import type { HTMLAttributes } from "svelte/elements";
    import type { Table } from "@tanstack/table-core";
    import { Button, Select, cn } from "@/components/ui";

    /** Rows-per-page select, "Page x / y" readout, and Previous/Next controls. */
    interface Props extends HTMLAttributes<HTMLDivElement> {
        table: Table<TData>;
        pageSizes: number[];
    }

    let { table, pageSizes, class: className, ...rest }: Props = $props();

    const pageIndex = $derived(table.getState().pagination.pageIndex);
    const pageCount = $derived(Math.max(table.getPageCount(), 1));
    const pad = (n: number) => String(n).padStart(2, "0");
</script>

<div {...rest} class={cn("flex flex-wrap items-center justify-between gap-3", className)}>
    <label class="k k--caps flex items-center gap-2.5 text-ink-3">
        Rows
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
        <span class="k k--caps text-ink-3 tabular-nums" aria-live="polite">
            Page <span class="text-ink">{pad(pageIndex + 1)}</span> / {pad(pageCount)}
        </span>
        <div class="flex items-center gap-2">
            <Button
                variant="secondary"
                size="sm"
                disabled={!table.getCanPreviousPage()}
                onclick={() => table.previousPage()}
            >
                Previous
            </Button>
            <Button
                variant="secondary"
                size="sm"
                disabled={!table.getCanNextPage()}
                onclick={() => table.nextPage()}
            >
                Next
            </Button>
        </div>
    </div>
</div>
