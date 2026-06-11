<div class="space-y-12">
    <x-demo.page-header
        title="Drag & Drop Board"
        description="Real drag physics, touch support, and cross-column sorting — the feature that usually forces a separate SPA — running inside a Livewire component. This board uses @formkit/drag-and-drop for Svelte; the same pattern drops straight in with dnd-kit for React or the library's Vue adapter for Vue." />

    <x-demo.section
        title="Sortable kanban, entangled"
        description="useEntangle('columns') is the single source of board state. Every drag reorders locally first — @formkit/drag-and-drop updates the lists for instant, zero-latency feedback — then wire.$call('moveCard', …) confirms the move on the server, which persists the board to your session (refresh the page: the order survives). Reset calls a server method and lets the entangled box stream the reseeded board back into Svelte. Cards drag across columns and reorder within one, with mouse or touch."
        :files="[
            'app/Mesh/Board/Kanban.php',
            'resources/js/mesh/Board/Kanban/index.svelte',
            'resources/js/mesh/Board/Kanban/Column.svelte',
            'resources/js/mesh/Board/Kanban/CardItem.svelte',
        ]">
        <mesh:board.kanban />
    </x-demo.section>
</div>
