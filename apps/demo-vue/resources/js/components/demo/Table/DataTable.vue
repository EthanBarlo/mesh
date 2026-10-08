<script setup lang="ts" generic="TData">
import { computed, useAttrs } from "vue";
import { FlexRender, type Header, type Row, type Table } from "@tanstack/vue-table";
import { cn } from "@/components/ui";

defineOptions({ inheritAttrs: false });

/**
 * Generic TanStack Table renderer, drawn as a bill of materials: mono caps
 * headers over an ink rule, hairline rows, drawn sort carets, and
 * meta.headerClass / meta.cellClass support. The look lives in the shared
 * `.bom` classes (resources/css/ecosystem.css).
 * The #empty slot is shown in a full-width row when the row model is empty.
 */
const props = defineProps<{
    table: Table<TData>;
    /** Per-row classes, e.g. `bom__flagged` for a highlighted row. */
    rowClassName?: (row: Row<TData>) => string;
}>();

const attrs = useAttrs();

const rows = computed(() => props.table.getRowModel().rows);

function sortLabel(header: Header<TData, unknown>): string {
    const def = header.column.columnDef.header;
    return typeof def === "string" ? def : header.column.id;
}

function ariaSort(header: Header<TData, unknown>): "ascending" | "descending" | undefined {
    const sorted = header.column.getIsSorted();
    if (sorted === "asc") return "ascending";
    if (sorted === "desc") return "descending";
    return undefined;
}
</script>

<template>
    <div :class="cn('bom', attrs.class as string)">
        <table>
            <thead>
                <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                    <th
                        v-for="header in headerGroup.headers"
                        :key="header.id"
                        scope="col"
                        :aria-sort="ariaSort(header)"
                        :class="cn('text-left', header.column.columnDef.meta?.headerClass)"
                    >
                        <template v-if="!header.isPlaceholder">
                            <button
                                v-if="header.column.getCanSort()"
                                type="button"
                                class="bom__sort"
                                :data-sorted="header.column.getIsSorted() || undefined"
                                :aria-label="`Sort by ${sortLabel(header)}`"
                                @click="header.column.getToggleSortingHandler()?.($event)"
                            >
                                <FlexRender
                                    :render="header.column.columnDef.header"
                                    :props="header.getContext()"
                                />
                                <!-- A small drawn caret pair: the active direction is inked, the other stays faint. -->
                                <svg class="bom__caret" viewBox="0 0 7 11" aria-hidden="true">
                                    <path class="bom__caret-up" d="M0.5 4L3.5 1L6.5 4" />
                                    <path class="bom__caret-down" d="M0.5 7L3.5 10L6.5 7" />
                                </svg>
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
            <tbody>
                <tr v-if="rows.length === 0">
                    <td :colspan="table.getAllLeafColumns().length" class="bom__empty">
                        <slot name="empty" />
                    </td>
                </tr>
                <template v-else>
                    <tr
                        v-for="row in rows"
                        :key="row.id"
                        :class="rowClassName?.(row) || undefined"
                    >
                        <td
                            v-for="cell in row.getVisibleCells()"
                            :key="cell.id"
                            :class="cell.column.columnDef.meta?.cellClass || undefined"
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
