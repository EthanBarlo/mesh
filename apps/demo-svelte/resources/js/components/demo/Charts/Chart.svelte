<script lang="ts">
    import { onMount } from "svelte";
    import * as echarts from "echarts";
    import type { EChartsOption } from "echarts";

    interface Props {
        option: EChartsOption;
    }

    let { option }: Props = $props();

    let el: HTMLDivElement | undefined;

    let chart: echarts.ECharts | null = null;

    onMount(() => {
        if (!el) return;

        chart = echarts.init(el);
        chart.setOption(option, { lazyUpdate: true });

        const observer = new ResizeObserver(() => chart?.resize());
        observer.observe(el);

        return () => {
            observer.disconnect();
            chart?.dispose();
            chart = null;
        };
    });

    // Options are rebuilt by replacement ($derived in the parent), so tracking
    // the prop reference is enough; setOption merges and ECharts animates the diff.
    $effect(() => {
        chart?.setOption(option, { lazyUpdate: true });
    });
</script>

<!-- Thin ECharts wrapper: fills its parent, resizes with it, disposes on unmount. -->
<div bind:this={el} class="h-full w-full"></div>
