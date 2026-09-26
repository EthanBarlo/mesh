<script setup lang="ts" generic="TData">
import { computed, useAttrs } from "vue";
import { FlexRender, type Header, type Row, type Table } from "@tanstack/vue-table";
import { cn } from "@/components/ui";

defineOptions({ inheritAttrs: false });

/**
 * Generic TanStack Table renderer: bordered wrapper, sortable headers with
 * ▲/▼/↕ indicators, and meta.headerClass / meta.cellClass support.
 * The #empty slot is shown in a full-width row when the row model is empty.
 */
const props = defineProps<{
    table: Table<TData>;
    /** Per-row classes (e.g. a flagged tint) merged after the base transition classes. */
    rowClassName?: (row: Row<TData>) => string;
}>();

const attrs = useAttrs();

const rows = computed(() => props.table.getRowModel().rows);

function sortLabel(header: Header<TData, unknown>): string {
    const def = header.column.columnDef.header;
    return typeof def === "string" ? def : header.column.id;
}
</script>

<template>
    <div
        :class="
            cn(
                'overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02]',
                attrs.class as string,
            )
        "
    >
        <table class="w-full text-sm">
            <thead>
                <tr
                    v-for="headerGroup in table.getHeaderGroups()"
                    :key="headerGroup.id"
                    class="border-b border-white/5 bg-white/[0.02]"
                >
                    <th
                        v-for="header in headerGroup.headers"
                        :key="header.id"
                        :class="
                            cn(
                                'px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-zinc-500',
                                header.column.columnDef.meta?.headerClass,
                            )
                        "
                    >
                        <template v-if="!header.isPlaceholder">
                            <button
                                v-if="header.column.getCanSort()"
                                type="button"
                                :class="
                                    cn(
                                        'group inline-flex items-center gap-1.5 hover:text-white transition-colors duration-150 focus:outline-none focus:text-white',
                                        header.column.getIsSorted() && 'text-white',
                                    )
                                "
                                :aria-label="`Sort by ${sortLabel(header)}`"
                                @click="header.column.getToggleSortingHandler()?.($event)"
                            >
                                <FlexRender
                                    :render="header.column.columnDef.header"
                                    :props="header.getContext()"
                                />
                                <span
                                    :class="
                                        cn(
                                            'text-[10px]',
                                            header.column.getIsSorted()
                                                ? 'text-zinc-300'
                                                : 'text-zinc-600 group-hover:text-zinc-400',
                                        )
                                    "
                                    aria-hidden="true"
                                >
                                    {{
                                        header.column.getIsSorted() === "asc"
                                            ? "▲"
                                            : header.column.getIsSorted() === "desc"
                                              ? "▼"
                                              : "↕"
                                    }}
                                </span>
                            </button>
                            <FlexRender
                                v-else
                                :render="header.column.columnDef.header"
                                :props="header.getContext()"
                            />
                        </template>
                    </th>
                </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
                <tr v-if="rows.length === 0">
                    <td
                        :colspan="table.getAllLeafColumns().length"
                        class="px-4 py-10 text-center text-zinc-500"
                    >
                        <slot name="empty" />
                    </td>
                </tr>
                <template v-else>
                    <tr
                        v-for="row in rows"
                        :key="row.id"
                        :class="
                            cn('transition-colors duration-150', rowClassName?.(row))
                        "
                    >
                        <td
                            v-for="cell in row.getVisibleCells()"
                            :key="cell.id"
                            :class="
                                cn(
                                    'px-4 py-3 whitespace-nowrap',
                                    cell.column.columnDef.meta?.cellClass,
                                )
                            "
                        >
                            <FlexRender
                                :render="cell.column.columnDef.cell"
                                :props="cell.getContext()"
                            />
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>
    </div>
</template>
