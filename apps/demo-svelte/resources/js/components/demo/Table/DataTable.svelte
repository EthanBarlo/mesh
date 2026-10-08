<script lang="ts" generics="TData">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import type { Header, Row, SortDirection, Table } from "@tanstack/table-core";
    import { cn } from "@/components/ui";
    import FlexRender from "./FlexRender.svelte";

    /**
     * Generic TanStack Table renderer, drawn as a bill of materials: mono caps
     * headers over an ink rule, hairline rows, drawn sort carets, and
     * meta.headerClass / meta.cellClass support. The look lives in the shared
     * `.bom` classes (resources/css/ecosystem.css). The `empty` snippet fills
     * a full-width row when the row model is empty.
     */
    interface Props extends HTMLAttributes<HTMLDivElement> {
        table: Table<TData>;
        /** Per-row classes, e.g. `bom__flagged` for a highlighted row. */
        rowClassName?: (row: Row<TData>) => string;
        empty?: Snippet;
    }

    let { table, rowClassName, empty, class: className, ...rest }: Props = $props();

    const rows = $derived(table.getRowModel().rows);

    function sortLabel(header: Header<TData, unknown>): string {
        const def = header.column.columnDef.header;
        return typeof def === "string" ? def : header.column.id;
    }

    function ariaSort(sorted: false | SortDirection) {
        if (sorted === "asc") return "ascending";
        if (sorted === "desc") return "descending";
        return undefined;
    }
</script>

<div {...rest} class={cn("bom", className)}>
    <table>
        <thead>
            {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
                <tr>
                    {#each headerGroup.headers as header (header.id)}
                        {@const sorted = header.column.getIsSorted()}
                        <th
                            scope="col"
                            aria-sort={ariaSort(sorted)}
                            class={cn("text-left", header.column.columnDef.meta?.headerClass)}
                        >
                            {#if !header.isPlaceholder}
                                {#if header.column.getCanSort()}
                                    <button
                                        type="button"
                                        class="bom__sort"
                                        data-sorted={sorted || undefined}
                                        aria-label={`Sort by ${sortLabel(header)}`}
                                        onclick={(event) =>
                                            header.column.getToggleSortingHandler()?.(event)}
                                    >
                                        <FlexRender
                                            content={header.column.columnDef.header}
                                            context={header.getContext()}
                                        />
                                        <!-- A small drawn caret pair: the active direction is inked, the other stays faint. -->
                                        <svg class="bom__caret" viewBox="0 0 7 11" aria-hidden="true">
                                            <path class="bom__caret-up" d="M0.5 4L3.5 1L6.5 4" />
                                            <path class="bom__caret-down" d="M0.5 7L3.5 10L6.5 7" />
                                        </svg>
                                    </button>
                                {:else}
                                    <FlexRender
                                        content={header.column.columnDef.header}
                                        context={header.getContext()}
                                    />
                                {/if}
                            {/if}
                        </th>
                    {/each}
                </tr>
            {/each}
        </thead>
        <tbody>
            {#if rows.length === 0}
                <tr>
                    <td colspan={table.getAllLeafColumns().length} class="bom__empty">
                        {@render empty?.()}
                    </td>
                </tr>
            {:else}
                {#each rows as row (row.id)}
                    <tr class={rowClassName?.(row) || undefined}>
                        {#each row.getVisibleCells() as cell (cell.id)}
                            <td class={cell.column.columnDef.meta?.cellClass || undefined}>
                                <FlexRender
                                    content={cell.column.columnDef.cell}
                                    context={cell.getContext()}
                                />
                            </td>
                        {/each}
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>
