<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef, watch } from "vue";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";

const props = defineProps<{
    option: EChartsOption;
}>();

const el = useTemplateRef<HTMLDivElement>("el");

let chart: echarts.ECharts | null = null;
let observer: ResizeObserver | null = null;

onMounted(() => {
    if (!el.value) return;

    chart = echarts.init(el.value);
    chart.setOption(props.option, { lazyUpdate: true });

    observer = new ResizeObserver(() => chart?.resize());
    observer.observe(el.value);
});

// Options are rebuilt by replacement (computed in the parent), so watching
// the prop reference is enough; setOption merges and ECharts animates the diff.
watch(
    () => props.option,
    (option) => chart?.setOption(option, { lazyUpdate: true }),
);

onUnmounted(() => {
    observer?.disconnect();
    observer = null;
    chart?.dispose();
    chart = null;
});
</script>

<!-- Thin ECharts wrapper: fills its parent, resizes with it, disposes on unmount. -->
<template>
    <div ref="el" class="h-full w-full" />
</template>
