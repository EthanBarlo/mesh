<script setup lang="ts" generic="TData">
import { computed, useAttrs } from "vue";
import type { Table } from "@tanstack/vue-table";
import { Button, Select, cn } from "@/components/ui";

defineOptions({ inheritAttrs: false });

/** Rows-per-page select, "Page x / y" readout, and Previous/Next controls. */
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

const pad = (n: number) => String(n).padStart(2, "0");
</script>

<template>
    <div :class="cn('flex flex-wrap items-center justify-between gap-3', attrs.class as string)">
        <label class="k k--caps flex items-center gap-2.5 text-ink-3">
            Rows
            <Select v-model="pageSize" aria-label="Rows per page">
                <option v-for="size in pageSizes" :key="size" :value="size">
                    {{ size }}
                </option>
            </Select>
        </label>

        <div class="flex items-center gap-3">
            <span class="k k--caps text-ink-3 tabular-nums" aria-live="polite">
                Page <span class="text-ink">{{ pad(pageIndex + 1) }}</span> / {{ pad(pageCount) }}
            </span>
            <div class="flex items-center gap-2">
                <Button
                    variant="secondary"
                    size="sm"
                    :disabled="!table.getCanPreviousPage()"
                    @click="table.previousPage()"
                >
                    Previous
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    :disabled="!table.getCanNextPage()"
                    @click="table.nextPage()"
                >
                    Next
                </Button>
            </div>
        </div>
    </div>
</template>
