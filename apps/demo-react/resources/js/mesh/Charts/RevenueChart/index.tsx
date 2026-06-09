import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { useEntangle } from "@mesh/react";

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

const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
});

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

    const option = useMemo(
        () => ({
            backgroundColor: "transparent",
            animationDuration: 600,
            animationDurationUpdate: 750,
            animationEasingUpdate: "cubicInOut",
            grid: { left: 8, right: 8, top: 40, bottom: 0, containLabel: true },
            legend: {
                top: 0,
                right: 0,
                icon: "roundRect",
                itemWidth: 10,
                itemHeight: 10,
                itemGap: 16,
                textStyle: { color: "#94a3b8", fontSize: 12 },
            },
            tooltip: {
                trigger: "axis",
                backgroundColor: "rgba(15, 23, 42, 0.92)",
                borderColor: "rgba(255, 255, 255, 0.1)",
                textStyle: { color: "#e2e8f0", fontSize: 12 },
                axisPointer: {
                    lineStyle: { color: "rgba(255, 255, 255, 0.2)" },
                },
            },
            xAxis: {
                type: "category",
                boundaryGap: false,
                data: labels,
                axisLine: { lineStyle: { color: "rgba(255, 255, 255, 0.12)" } },
                axisTick: { show: false },
                axisLabel: { color: "#64748b", fontSize: 11, hideOverlap: true, margin: 12 },
            },
            yAxis: [
                {
                    type: "value",
                    splitLine: { lineStyle: { color: "rgba(255, 255, 255, 0.06)" } },
                    axisLabel: {
                        color: "#64748b",
                        fontSize: 11,
                        formatter: (value: number) => `$${Math.round(value / 1000)}k`,
                    },
                },
                {
                    type: "value",
                    splitLine: { show: false },
                    axisLabel: { color: "#155e75", fontSize: 11 },
                },
            ],
            series: [
                {
                    name: "Revenue",
                    type: "line",
                    smooth: true,
                    showSymbol: false,
                    data: series.revenue,
                    lineStyle: { width: 3, color: "#fb7185" },
                    itemStyle: { color: "#fb7185" },
                    emphasis: { focus: "series" },
                    tooltip: {
                        valueFormatter: (value: number) => currency.format(value),
                    },
                    areaStyle: {
                        color: {
                            type: "linear",
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                { offset: 0, color: "rgba(251, 113, 133, 0.35)" },
                                { offset: 0.55, color: "rgba(249, 115, 22, 0.12)" },
                                { offset: 1, color: "rgba(249, 115, 22, 0)" },
                            ],
                        },
                    },
                },
                {
                    name: "Orders",
                    type: "line",
                    yAxisIndex: 1,
                    smooth: true,
                    showSymbol: false,
                    data: series.orders,
                    lineStyle: { width: 2, color: "#22d3ee", type: "dashed" },
                    itemStyle: { color: "#22d3ee" },
                    emphasis: { focus: "series" },
                },
            ],
        }),
        [labels, series],
    );

    return (
        <div className="space-y-5">
            {/* Header: title + segmented range control */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className="text-sm font-semibold text-white">Revenue &amp; orders</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Series recomputed in <code className="font-mono text-slate-400">props()</code> on
                        every range change
                    </p>
                </div>

                <div
                    className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-800/80 border border-white/10"
                    role="group"
                    aria-label="Chart range"
                >
                    {RANGES.map(({ value, label }) => {
                        const isActive = selectedRange === value;
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setSelectedRange(value)}
                                aria-pressed={isActive}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                                    isActive
                                        ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/25"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
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
            <div className="flex flex-wrap items-center gap-x-10 gap-y-3 pt-4 border-t border-white/10">
                <div>
                    <span className="block text-xs uppercase tracking-wider text-slate-500">
                        Total revenue
                    </span>
                    <span className="text-lg font-semibold tabular-nums text-white">
                        {currency.format(totalRevenue)}
                    </span>
                </div>
                <div>
                    <span className="block text-xs uppercase tracking-wider text-slate-500">
                        Avg / day
                    </span>
                    <span className="text-lg font-semibold tabular-nums text-white">
                        {currency.format(avgPerDay)}
                    </span>
                </div>
                <div>
                    <span className="block text-xs uppercase tracking-wider text-slate-500">
                        Orders
                    </span>
                    <span className="text-lg font-semibold tabular-nums text-cyan-300">
                        {totalOrders.toLocaleString("en-US")}
                    </span>
                </div>
                <div className="ml-auto text-xs text-slate-500">
                    Showing <span className="text-slate-300 font-medium">{labels.length}</span>{" "}
                    {range === "90d" ? "weekly" : "daily"} points
                </div>
            </div>
        </div>
    );
};

export default RevenueChart;
