<div class="space-y-12">
    <x-demo.page-header
        title="Drag & Drop Board"
        description="Real drag physics, keyboard accessibility, and collision detection — the feature that usually forces a separate SPA — running inside a Livewire component. This board uses dnd-kit for React; the same pattern drops straight in with vue-draggable-plus for Vue or svelte-dnd-action for Svelte." />

    <x-demo.section
        title="Sortable kanban, entangled"
        description="useEntangle('columns') is the single source of board state. Every drag reorders locally first — arrayMove for instant, zero-latency feedback — then wire.$call('moveCard', …) confirms the move on the server, which persists the board to your session (refresh the page: the order survives). Reset calls a server method and lets the entangle watcher stream the reseeded board back into React. Cards drag across columns and reorder within one, with pointer or keyboard."
        :files="[
            'app/Mesh/Board/Kanban.php',
            'resources/js/mesh/Board/Kanban/index.tsx',
            'resources/js/mesh/Board/Kanban/Column.tsx',
            'resources/js/mesh/Board/Kanban/CardItem.tsx',
        ]">
        <mesh:board.kanban />
    </x-demo.section>
</div>
