import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { useEntangle } from "@mesh/react";
import { SegmentedControl } from "@/components/ui";
import { buildRevenueChartOption, currency } from "@/components/demo/Charts/revenueChartOption";
import { useChartTheme } from "@/components/demo/Charts/useChartTheme";

type Range = "7d" | "30d" | "90d";

interface RevenueChartProps {
    labels: string[];
    series: {
        revenue: number[];
        orders: number[];
    };
    range: Range;
}

const RANGES: { value: Range; label: string }[] = [
    { value: "7d", label: "7 days" },
    { value: "30d", label: "30 days" },
    { value: "90d", label: "90 days" },
];

const DAYS: Record<Range, number> = { "7d": 7, "30d": 30, "90d": 90 };

const RevenueChart: React.FC<RevenueChartProps> = ({ labels, series, range }) => {
    // Live entangle: clicking a segment commits `range` to the server
    // immediately, Livewire re-renders, props() recomputes the series, and
    // Mesh patches the new props into this still-mounted component.
    const [selectedRange, setSelectedRange] = useEntangle<Range>("range", true);

    // Colours resolved from the page's CSS variables; re-read on theme toggle.
    const theme = useChartTheme();

    // Stats are derived from the props, so they always describe the dataset
    // the chart is currently showing (props.range, not the optimistic UI value).
    const totalRevenue = series.revenue.reduce((sum, v) => sum + v, 0);
    const totalOrders = series.orders.reduce((sum, v) => sum + v, 0);
    const avgPerDay = totalRevenue / DAYS[range];

    const option = useMemo(
        () => buildRevenueChartOption(labels, series, theme),
        [labels, series, theme],
    );

    return (
        <div className="plot">
            <div className="plot__head">
                <div>
                    <h3 className="plot__title">Revenue &amp; orders</h3>
                    <p className="k mt-0.5 text-ink-3">
                        Series recomputed in <code className="text-ink-2">props()</code> on every
                        range change
                    </p>
                </div>

                <SegmentedControl
                    options={RANGES}
                    value={selectedRange}
                    onChange={setSelectedRange}
                    aria-label="Chart range"
                />
            </div>

            {/* Fixed height; ECharts animates between datasets because Mesh
                updates props in place and never remounts the component. */}
            <div className="plot__canvas">
                <ReactECharts
                    option={option}
                    notMerge={false}
                    lazyUpdate
                    style={{ height: "100%", width: "100%" }}
                />
            </div>

            {/* Readout computed from the current props */}
            <dl className="readout">
                <div className="readout__cell">
                    <dt className="readout__k k k--caps">Total revenue</dt>
                    <dd className="readout__v">{currency.format(totalRevenue)}</dd>
                </div>
                <div className="readout__cell">
                    <dt className="readout__k k k--caps">Avg / day</dt>
                    <dd className="readout__v">{currency.format(avgPerDay)}</dd>
                </div>
                <div className="readout__cell">
                    <dt className="readout__k k k--caps">Orders</dt>
                    <dd className="readout__v">{totalOrders.toLocaleString("en-US")}</dd>
                </div>
                <div className="readout__cell">
                    <dt className="readout__k k k--caps">Points</dt>
                    <dd className="readout__v readout__v--mono">
                        {labels.length} {range === "90d" ? "weekly" : "daily"}
                    </dd>
                </div>
            </dl>
        </div>
    );
};

export default RevenueChart;
