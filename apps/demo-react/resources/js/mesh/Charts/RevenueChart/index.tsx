import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { useEntangle } from "@mesh/react";
import { Eyebrow, SegmentedControl } from "@/components/ui";
import { buildRevenueChartOption, currency } from "@/components/demo/Charts/revenueChartOption";

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

    // Stats are derived from the props, so they always describe the dataset
    // the chart is currently showing (props.range, not the optimistic UI value).
    const totalRevenue = series.revenue.reduce((sum, v) => sum + v, 0);
    const totalOrders = series.orders.reduce((sum, v) => sum + v, 0);
    const avgPerDay = totalRevenue / DAYS[range];

    const option = useMemo(() => buildRevenueChartOption(labels, series), [labels, series]);

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="text-sm font-semibold tracking-tight text-white">Revenue &amp; orders</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                        Series recomputed in <code className="font-mono text-zinc-400">props()</code> on
                        every range change
                    </p>
                </div>

                <SegmentedControl
                    options={RANGES}
                    value={selectedRange}
                    onChange={setSelectedRange}
                    aria-label="Chart range"
                />
            </div>

            {/* Chart — fixed height; ECharts animates between datasets because
                Mesh updates props in place and never remounts the component. */}
            <div className="h-[360px] w-full">
                <ReactECharts
                    option={option}
                    notMerge={false}
                    lazyUpdate
                    style={{ height: "100%", width: "100%" }}
                />
            </div>

            {/* Stat row computed from the current props */}
            <div className="flex flex-wrap items-center gap-x-10 gap-y-3 pt-4 border-t border-white/5">
                <div>
                    <Eyebrow className="block font-normal">Total revenue</Eyebrow>
                    <span className="text-lg font-semibold tabular-nums text-white">
                        {currency.format(totalRevenue)}
                    </span>
                </div>
                <div>
                    <Eyebrow className="block font-normal">Avg / day</Eyebrow>
                    <span className="text-lg font-semibold tabular-nums text-white">
                        {currency.format(avgPerDay)}
                    </span>
                </div>
                <div>
                    <Eyebrow className="block font-normal">Orders</Eyebrow>
                    <span className="text-lg font-semibold tabular-nums text-white">
                        {totalOrders.toLocaleString("en-US")}
                    </span>
                </div>
                <div className="ml-auto text-xs text-zinc-500">
                    Showing <span className="text-zinc-300 font-medium">{labels.length}</span>{" "}
                    {range === "90d" ? "weekly" : "daily"} points
                </div>
            </div>
        </div>
    );
};

export default RevenueChart;
