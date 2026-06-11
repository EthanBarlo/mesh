/** Shared USD formatter used by the chart tooltip and the stat footer. */
export const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
});

interface RevenueSeries {
    revenue: number[];
    orders: number[];
}

/**
 * ECharts option for the revenue/orders dual-axis line chart.
 * Pure function of the server-computed labels + series so the component can
 * memoize it and let ECharts animate between datasets.
 */
export function buildRevenueChartOption(labels: string[], series: RevenueSeries) {
    return {
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
    };
}
