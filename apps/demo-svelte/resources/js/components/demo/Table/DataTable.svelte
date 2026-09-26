<script lang="ts" generics="TData">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import type { Header, Row, Table } from "@tanstack/table-core";
    import { cn } from "@/components/ui";
    import FlexRender from "./FlexRender.svelte";

    /**
     * Generic TanStack Table renderer: bordered wrapper, sortable headers with
     * ▲/▼/↕ indicators, and meta.headerClass / meta.cellClass support.
     * The `empty` snippet is shown in a full-width row when the row model is empty.
     */
    interface Props extends HTMLAttributes<HTMLDivElement> {
        table: Table<TData>;
        /** Per-row classes (e.g. a flagged tint) merged after the base transition classes. */
        rowClassName?: (row: Row<TData>) => string;
        empty?: Snippet;
    }

    let { table, rowClassName, empty, class: className, ...rest }: Props = $props();

    const rows = $derived(table.getRowModel().rows);

    function sortLabel(header: Header<TData, unknown>): string {
        const def = header.column.columnDef.header;
        return typeof def === "string" ? def : header.column.id;
    }
</script>

<div
    {...rest}
    class={cn(
        "overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02]",
        className,
    )}
>
    <table class="w-full text-sm">
        <thead>
            {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
                <tr class="border-b border-white/5 bg-white/[0.02]">
                    {#each headerGroup.headers as header (header.id)}
                        <th
                            class={cn(
                                "px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-zinc-500",
                                header.column.columnDef.meta?.headerClass,
                            )}
                        >
                            {#if !header.isPlaceholder}
                                {#if header.column.getCanSort()}
                                    <button
                                        type="button"
                                        class={cn(
                                            "group inline-flex items-center gap-1.5 hover:text-white transition-colors duration-150 focus:outline-none focus:text-white",
                                            header.column.getIsSorted() && "text-white",
                                        )}
                                        aria-label={`Sort by ${sortLabel(header)}`}
                                        onclick={(event) =>
                                            header.column.getToggleSortingHandler()?.(event)}
                                    >
                                        <FlexRender
                                            content={header.column.columnDef.header}
                                            context={header.getContext()}
                                        />
                                        <span
                                            class={cn(
                                                "text-[10px]",
                                                header.column.getIsSorted()
                                                    ? "text-zinc-300"
                                                    : "text-zinc-600 group-hover:text-zinc-400",
                                            )}
                                            aria-hidden="true"
                                        >
                                            {header.column.getIsSorted() === "asc"
                                                ? "▲"
                                                : header.column.getIsSorted() === "desc"
                                                  ? "▼"
                                                  : "↕"}
                                        </span>
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
        <tbody class="divide-y divide-white/5">
            {#if rows.length === 0}
                <tr>
                    <td
                        colspan={table.getAllLeafColumns().length}
                        class="px-4 py-10 text-center text-zinc-500"
                    >
                        {@render empty?.()}
                    </td>
                </tr>
            {:else}
                {#each rows as row (row.id)}
                    <tr
                        class={cn(
                            "transition-colors duration-150",
                            rowClassName?.(row),
                        )}
                    >
                        {#each row.getVisibleCells() as cell (cell.id)}
                            <td
                                class={cn(
                                    "px-4 py-3 whitespace-nowrap",
                                    cell.column.columnDef.meta?.cellClass,
                                )}
                            >
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
