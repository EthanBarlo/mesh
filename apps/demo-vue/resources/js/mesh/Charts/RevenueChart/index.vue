<script setup lang="ts">
import { computed } from "vue";
import type { EChartsOption } from "echarts";
import { useEntangle } from "@mesh/vue";
import { SegmentedControl } from "@/components/ui";
import VChart from "@/components/demo/Charts/VChart.vue";
import { buildRevenueChartOption, currency } from "@/components/demo/Charts/revenueChartOption";
import { useChartTheme } from "@/components/demo/Charts/useChartTheme";

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

// Colours resolved from the page's CSS variables; re-read on theme toggle.
const theme = useChartTheme();

// Stats are derived from the props, so they always describe the dataset
// the chart is currently showing (props.range, not the optimistic UI value).
const totalRevenue = computed(() => props.series.revenue.reduce((sum, v) => sum + v, 0));
const totalOrders = computed(() => props.series.orders.reduce((sum, v) => sum + v, 0));
const avgPerDay = computed(() => totalRevenue.value / DAYS[props.range]);

const option = computed(
    () => buildRevenueChartOption(props.labels, props.series, theme.value) as EChartsOption,
);
</script>

<template>
    <div class="plot">
        <div class="plot__head">
            <div>
                <h3 class="plot__title">Revenue &amp; orders</h3>
                <p class="k mt-0.5 text-ink-3">
                    Series recomputed in <code class="text-ink-2">props()</code> on every range
                    change
                </p>
            </div>

            <SegmentedControl v-model="selectedRange" :options="RANGES" aria-label="Chart range" />
        </div>

        <!-- Fixed height; ECharts animates between datasets because Mesh
             updates props in place and never remounts the component. -->
        <div class="plot__canvas">
            <VChart :option="option" />
        </div>

        <!-- Readout computed from the current props -->
        <dl class="readout">
            <div class="readout__cell">
                <dt class="readout__k k k--caps">Total revenue</dt>
                <dd class="readout__v">{{ currency.format(totalRevenue) }}</dd>
            </div>
            <div class="readout__cell">
                <dt class="readout__k k k--caps">Avg / day</dt>
                <dd class="readout__v">{{ currency.format(avgPerDay) }}</dd>
            </div>
            <div class="readout__cell">
                <dt class="readout__k k k--caps">Orders</dt>
                <dd class="readout__v">{{ totalOrders.toLocaleString("en-US") }}</dd>
            </div>
            <div class="readout__cell">
                <dt class="readout__k k k--caps">Points</dt>
                <dd class="readout__v readout__v--mono">
                    {{ labels.length }} {{ range === "90d" ? "weekly" : "daily" }}
                </dd>
            </div>
        </dl>
    </div>
</template>
