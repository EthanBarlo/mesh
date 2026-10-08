<script lang="ts">
    import { useEntangle } from "@mesh/svelte";
    import { SegmentedControl } from "@/components/ui";
    import Chart from "@/components/demo/Charts/Chart.svelte";
    import {
        buildRevenueChartOption,
        currency,
    } from "@/components/demo/Charts/revenueChartOption";
    import { useChartTheme } from "@/components/demo/Charts/useChartTheme.svelte";

    type Range = "7d" | "30d" | "90d";

    interface Props {
        labels: string[];
        series: {
            revenue: number[];
            orders: number[];
        };
        range: Range;
    }

    let { labels, series, range }: Props = $props();

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
    // the chart is currently showing (the `range` prop, not the optimistic UI value).
    const totalRevenue = $derived(series.revenue.reduce((sum, v) => sum + v, 0));
    const totalOrders = $derived(series.orders.reduce((sum, v) => sum + v, 0));
    const avgPerDay = $derived(totalRevenue / DAYS[range]);

    const option = $derived(buildRevenueChartOption(labels, series, theme.value));
</script>

<div class="plot">
    <div class="plot__head">
        <div>
            <h3 class="plot__title">Revenue &amp; orders</h3>
            <p class="k mt-0.5 text-ink-3">
                Series recomputed in <code class="text-ink-2">props()</code> on every range change
            </p>
        </div>

        <SegmentedControl
            bind:value={selectedRange.value}
            options={RANGES}
            aria-label="Chart range"
        />
    </div>

    <!-- Fixed height; ECharts animates between datasets because Mesh
        updates props in place and never remounts the component. -->
    <div class="plot__canvas">
        <Chart {option} />
    </div>

    <!-- Readout computed from the current props -->
    <dl class="readout">
        <div class="readout__cell">
            <dt class="readout__k k k--caps">Total revenue</dt>
            <dd class="readout__v">{currency.format(totalRevenue)}</dd>
        </div>
        <div class="readout__cell">
            <dt class="readout__k k k--caps">Avg / day</dt>
            <dd class="readout__v">{currency.format(avgPerDay)}</dd>
        </div>
        <div class="readout__cell">
            <dt class="readout__k k k--caps">Orders</dt>
            <dd class="readout__v">{totalOrders.toLocaleString("en-US")}</dd>
        </div>
        <div class="readout__cell">
            <dt class="readout__k k k--caps">Points</dt>
            <dd class="readout__v readout__v--mono">
                {labels.length}
                {range === "90d" ? "weekly" : "daily"}
            </dd>
        </div>
    </dl>
</div>
