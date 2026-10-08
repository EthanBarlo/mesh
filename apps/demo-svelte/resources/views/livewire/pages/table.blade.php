<div class="space-y-12">
    <x-demo.page-header
        title="Data Table"
        description="A headless table engine over Livewire data. PHP builds the orders and hands them to `@tanstack/table-core` as props, through a small Svelte adapter. Sorting, filtering and paging run in the browser; row actions are ordinary Livewire method calls. TanStack Table ships the same core for React and Vue, so the pattern carries to every renderer Mesh supports." />

    <x-demo.section
        title="Orders: client-side engine, server-side actions"
        description="`mount()` generates 250 seeded orders once, and `props()` passes them down. Sort by a header, filter every column from the box, page with the footer: none of it touches the server. The flag button does. It calls `wire.$call('flagOrder', id)`, PHP toggles the row, `props()` recomputes, and Svelte patches the row in place. Your sort, filter and page survive, because Mesh updates props without remounting."
        caption="OrdersTable · @tanstack/table-core"
        :files="['app/Mesh/Table/OrdersTable.php', 'resources/js/mesh/Table/OrdersTable/index.svelte', 'resources/js/mesh/Table/OrdersTable/columns.ts']">
        <mesh:table.orders-table />
    </x-demo.section>
</div>
