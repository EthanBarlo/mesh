<script setup lang="ts" generic="TData">
import { computed, useAttrs } from "vue";
import type { Table } from "@tanstack/vue-table";
import { Button, Select, cn } from "@/components/ui";

defineOptions({ inheritAttrs: false });

/** Rows-per-page select, "Page x of y" readout, and Previous/Next controls. */
const props = defineProps<{
    table: Table<TData>;
    pageSizes: number[];
}>();

const attrs = useAttrs();

const pageSize = computed({
    get: () => props.table.getState().pagination.pageSize,
    set: (value) => props.table.setPageSize(Number(value)),
});

const pageIndex = computed(() => props.table.getState().pagination.pageIndex);
const pageCount = computed(() => Math.max(props.table.getPageCount(), 1));
</script>

<template>
    <div
        :class="
            cn(
                'flex flex-wrap items-center justify-between gap-3',
                attrs.class as string,
            )
        "
    >
        <label class="flex items-center gap-2 text-xs text-zinc-500">
            Rows per page
            <Select v-model="pageSize" aria-label="Rows per page">
                <option v-for="size in pageSizes" :key="size" :value="size">
                    {{ size }}
                </option>
            </Select>
        </label>

        <div class="flex items-center gap-3">
            <span class="text-xs text-zinc-500 tabular-nums">
                Page {{ pageIndex + 1 }} of {{ pageCount }}
            </span>
            <div class="flex items-center gap-2">
                <Button
                    variant="secondary"
                    size="xs"
                    :disabled="!table.getCanPreviousPage()"
                    class="font-normal disabled:opacity-40"
                    @click="table.previousPage()"
                >
                    Previous
                </Button>
                <Button
                    variant="primary"
                    size="xs"
                    :disabled="!table.getCanNextPage()"
                    class="font-medium disabled:opacity-40"
                    @click="table.nextPage()"
                >
                    Next
                </Button>
            </div>
        </div>
    </div>
</template>
