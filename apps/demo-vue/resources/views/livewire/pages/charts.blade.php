<div class="space-y-12">
    <x-demo.page-header
        title="Live Charts"
        description="Mesh updates props in place — when Livewire re-renders, the Vue component is patched, never remounted. That means the ECharts instance survives every request, so ECharts does what it does best: animate the difference between the old dataset and the new one. The same trick works in any framework with an ECharts wrapper — react and svelte renderers get the identical morphing behaviour from the identical PHP class." />

    <x-demo.section
        title="Server-computed series, ECharts-animated transitions"
        description="Change the range and watch the chart morph. Each click is a live useEntangle('range', true) commit: a Livewire request re-runs props() on the server, which recomputes the seeded revenue series at a different granularity (7d and 30d are daily, 90d is weekly buckets). Mesh hands the new labels and series to the still-mounted component, and ECharts animates the diff — no remount, no flash, no chart re-init. The stat row below the chart is plain Vue, derived from the same props."
        :files="['app/Mesh/Charts/RevenueChart.php', 'resources/js/mesh/Charts/RevenueChart/index.vue', 'resources/views/livewire/pages/charts.blade.php']">
        <mesh:charts.revenue-chart />
    </x-demo.section>
</div>
