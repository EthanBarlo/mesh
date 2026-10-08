<div class="space-y-12">
    <x-demo.page-header
        title="Live Charts"
        description="Mesh updates props in place: when Livewire re-renders, the React component is patched, never remounted. The ECharts instance survives every request, so ECharts can animate from the old dataset to the new one. The Vue and Svelte demos get the same morph from the same PHP class." />

    <x-demo.section
        title="Server-computed series, ECharts-animated transitions"
        description="Change the range and the chart morphs. Each click is a live `useEntangle('range', true)` commit: Livewire re-runs `props()` on the server, which recomputes the seeded series at a new granularity (7d and 30d are daily, 90d is weekly buckets). Mesh hands the new labels and series to the mounted component, and ECharts animates the difference. No remount, no flash, no re-init. The readout under the chart is plain React, derived from the same props."
        caption="RevenueChart · ECharts"
        :files="['app/Mesh/Charts/RevenueChart.php', 'resources/js/mesh/Charts/RevenueChart/index.tsx', 'resources/js/components/demo/Charts/revenueChartOption.ts', 'resources/views/livewire/pages/charts.blade.php']">
        <mesh:charts.revenue-chart />
    </x-demo.section>
</div>
