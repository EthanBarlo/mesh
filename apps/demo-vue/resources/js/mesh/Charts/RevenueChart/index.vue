<script setup lang="ts">
import { computed } from "vue";
import { useEntangle } from "@mesh/vue";
import { Eyebrow, SegmentedControl } from "@/components/ui";
import VChart from "@/components/demo/Charts/VChart.vue";
import { buildRevenueChartOption, currency } from "@/components/demo/Charts/revenueChartOption";

type Range = "7d" | "30d" | "90d";

const props = defineProps<{
    labels: string[];
    series: {
        revenue: number[];
        orders: number[];
    };
    range: Range;
}>();

const RANGES: { value: Range; label: string }[] = [
    { value: "7d", label: "7 days" },
    { value: "30d", label: "30 days" },
    { value: "90d", label: "90 days" },
];

const DAYS: Record<Range, number> = { "7d": 7, "30d": 30, "90d": 90 };

// Live entangle: clicking a segment commits `range` to the server
// immediately, Livewire re-renders, props() recomputes the series, and
// Mesh patches the new props into this still-mounted component.
const selectedRange = useEntangle<Range>("range", true);

// Stats are derived from the props, so they always describe the dataset
// the chart is currently showing (props.range, not the optimistic UI value).
const totalRevenue = computed(() => props.series.revenue.reduce((sum, v) => sum + v, 0));
const totalOrders = computed(() => props.series.orders.reduce((sum, v) => sum + v, 0));
const avgPerDay = computed(() => totalRevenue.value / DAYS[props.range]);

const option = computed(() => buildRevenueChartOption(props.labels, props.series));
</script>

<template>
    <div class="space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h3 class="text-sm font-semibold tracking-tight text-white">Revenue &amp; orders</h3>
                <p class="text-xs text-zinc-500 mt-0.5">
                    Series recomputed in <code class="font-mono text-zinc-400">props()</code> on
                    every range change
                </p>
            </div>

            <SegmentedControl
                v-model="selectedRange"
                :options="RANGES"
                aria-label="Chart range"
            />
        </div>

        <!-- Chart — fixed height; ECharts animates between datasets because
            Mesh updates props in place and never remounts the component. -->
        <div class="h-[360px] w-full">
            <VChart :option="option" />
        </div>

        <!-- Stat row computed from the current props -->
        <div class="flex flex-wrap items-center gap-x-10 gap-y-3 pt-4 border-t border-white/5">
            <div>
                <Eyebrow class="block font-normal">Total revenue</Eyebrow>
                <span class="text-lg font-semibold tabular-nums text-white">
                    {{ currency.format(totalRevenue) }}
                </span>
            </div>
            <div>
                <Eyebrow class="block font-normal">Avg / day</Eyebrow>
                <span class="text-lg font-semibold tabular-nums text-white">
                    {{ currency.format(avgPerDay) }}
                </span>
            </div>
            <div>
                <Eyebrow class="block font-normal">Orders</Eyebrow>
                <span class="text-lg font-semibold tabular-nums text-white">
                    {{ totalOrders.toLocaleString("en-US") }}
                </span>
            </div>
            <div class="ml-auto text-xs text-zinc-500">
                Showing <span class="text-zinc-300 font-medium">{{ labels.length }}</span>
                {{ range === "90d" ? "weekly" : "daily" }} points
            </div>
        </div>
    </div>
</template>
