<div class="space-y-12">
    <x-demo.page-header
        title="Data Table"
        description="A real headless table engine running over Livewire data. The orders below are built in PHP and handed to @tanstack/table-core as props — sorting, filtering, and pagination happen instantly in the browser, while row actions are ordinary Livewire method calls. And because the same TanStack Table core ships for React and Vue, this exact pattern carries to every framework Mesh can render." />

    <x-demo.section
        title="Orders: client-side engine, server-side actions"
        description="250 deterministic orders are generated once in mount() and passed through props(). Click a column header to sort, type in the box to filter every column at once, and page through with the footer — none of that touches the server. The flag button is the opposite: it calls wire.$call('flagOrder', id), PHP toggles the row, props() recomputes, and Svelte patches the row in place with a rose tint — your sort, filter, and page survive because Mesh updates props without remounting."
        :files="['app/Mesh/Table/OrdersTable.php', 'resources/js/mesh/Table/OrdersTable/index.svelte', 'resources/js/mesh/Table/OrdersTable/columns.ts']">
        <mesh:table.orders-table />
    </x-demo.section>
</div>
