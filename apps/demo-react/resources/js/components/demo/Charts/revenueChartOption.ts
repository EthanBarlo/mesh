import type { ChartTheme } from "./chartTheme";

/** Shared USD formatter used by the chart tooltip and the readout. */
export const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
});

interface RevenueSeries {
    revenue: number[];
    orders: number[];
}

interface TooltipParam {
    seriesName?: string;
    axisValueLabel?: string;
    value?: number | string;
    color?: string;
}

/** Legend key for the dashed orders line: three dashes. */
const DASH_ICON = "path://M0 0H5V1H0ZM7 0H12V1H7ZM14 0H19V1H14Z";

const escapeHtml = (text: string) =>
    text.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

/**
 * ECharts option for the revenue/orders dual-axis line chart, drawn like a
 * plotted sheet: ink axes, mono labels, hairline split lines, the accent for
 * revenue and a dashed ink line for orders. No gradients, no shadows.
 *
 * Pure function of the server-computed labels + series and the resolved
 * theme, so the component can memoize it and let ECharts animate between
 * datasets (and recolour in place when the theme flips).
 */
export function buildRevenueChartOption(
    labels: string[],
    series: RevenueSeries,
    theme: ChartTheme,
) {
    const axisLabel = {
        color: theme.ink3,
        fontFamily: theme.mono,
        fontSize: 10,
    };

    const tooltipRow = (param: TooltipParam) => {
        const isRevenue = param.seriesName === "Revenue";
        const value = Number(param.value ?? 0);
        const swatch = isRevenue
            ? `border-top:2px solid ${param.color}`
            : `border-top:1px dashed ${param.color}`;

        return (
            `<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;min-width:168px;line-height:1.7">` +
            `<span style="display:inline-flex;align-items:center;gap:8px;color:${theme.ink2}">` +
            `<i style="display:inline-block;width:14px;height:0;${swatch}"></i>` +
            `${escapeHtml(param.seriesName ?? "")}</span>` +
            `<span style="color:${theme.ink};font-variant-numeric:tabular-nums">` +
            `${isRevenue ? currency.format(value) : value.toLocaleString("en-US")}</span>` +
            `</div>`
        );
    };

    return {
        backgroundColor: "transparent",
        animation: !theme.reducedMotion,
        animationDuration: 600,
        animationDurationUpdate: 700,
        animationEasingUpdate: "cubicOut",
        textStyle: { fontFamily: theme.mono },
        grid: { left: 4, right: 4, top: 36, bottom: 0, containLabel: true },
        legend: {
            top: 0,
            left: 0,
            itemWidth: 18,
            itemHeight: 2,
            itemGap: 22,
            inactiveColor: theme.line2,
            textStyle: {
                color: theme.ink2,
                fontFamily: theme.mono,
                fontSize: 10,
            },
            formatter: (name: string) =>
                name === "Revenue" ? "REVENUE · LEFT AXIS" : "ORDERS · RIGHT AXIS",
            data: [
                { name: "Revenue", icon: "rect" },
                { name: "Orders", icon: DASH_ICON },
            ],
        },
        tooltip: {
            trigger: "axis",
            backgroundColor: theme.paper,
            borderColor: theme.line3,
            borderWidth: 1,
            borderRadius: 0,
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowColor: "transparent",
            padding: [8, 12],
            transitionDuration: theme.reducedMotion ? 0 : 0.2,
            textStyle: { color: theme.ink, fontFamily: theme.mono, fontSize: 11 },
            axisPointer: {
                type: "line",
                lineStyle: { color: theme.ink3, width: 1, type: [3, 3] },
            },
            formatter: (params: TooltipParam | TooltipParam[]) => {
                const list = Array.isArray(params) ? params : [params];
                if (list.length === 0) return "";

                const head =
                    `<div style="margin-bottom:4px;padding-bottom:4px;border-bottom:1px solid ${theme.line2};` +
                    `color:${theme.ink3};font-size:10px;letter-spacing:0.1em;text-transform:uppercase">` +
                    `${escapeHtml(list[0].axisValueLabel ?? "")}</div>`;

                return head + list.map(tooltipRow).join("");
            },
        },
        xAxis: {
            type: "category",
            boundaryGap: false,
            data: labels,
            axisLine: { lineStyle: { color: theme.ink, width: 1 } },
            axisTick: { show: true, length: 4, lineStyle: { color: theme.line3 } },
            axisLabel: { ...axisLabel, hideOverlap: true, margin: 10 },
            splitLine: { show: false },
        },
        yAxis: [
            {
                type: "value",
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { lineStyle: { color: theme.line, width: 1 } },
                axisLabel: {
                    ...axisLabel,
                    formatter: (value: number) => `$${Math.round(value / 1000)}k`,
                },
            },
            {
                type: "value",
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel,
            },
        ],
        series: [
            {
                name: "Revenue",
                type: "line",
                smooth: false,
                showSymbol: false,
                symbol: "rect",
                symbolSize: 6,
                z: 3,
                data: series.revenue,
                lineStyle: { width: 2, color: theme.accent },
                itemStyle: { color: theme.accent, borderColor: theme.paper, borderWidth: 1 },
                emphasis: { focus: "series", lineStyle: { width: 2 } },
            },
            {
                name: "Orders",
                type: "line",
                yAxisIndex: 1,
                smooth: false,
                showSymbol: false,
                symbol: "rect",
                symbolSize: 5,
                data: series.orders,
                lineStyle: { width: 1, color: theme.ink3, type: [4, 3] },
                itemStyle: { color: theme.ink3, borderColor: theme.paper, borderWidth: 1 },
                emphasis: { focus: "series", lineStyle: { width: 1 } },
            },
        ],
    };
}
