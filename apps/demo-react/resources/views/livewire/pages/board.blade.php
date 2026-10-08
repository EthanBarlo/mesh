<div class="space-y-12">
    <x-demo.page-header
        title="Drag & Drop Board"
        description="Drag physics, keyboard access and collision detection, the feature that usually forces a separate SPA, running inside a Livewire component. This board uses `dnd-kit`; the Vue and Svelte demos build the same board with `@formkit/drag-and-drop`." />

    <x-demo.section
        title="Sortable kanban, entangled"
        description="`useEntangle('columns')` is the single source of board state. Each drag reorders locally first with `arrayMove`, so feedback is instant, then `wire.$call('moveCard', …)` confirms the move and the server saves the board to your session. Refresh the page and the order survives. Reset calls a server method, and the entangle watcher streams the reseeded board back into React. Drag cards across columns or within one, by pointer or keyboard."
        caption="Board/Kanban · dnd-kit"
        :files="[
            'app/Mesh/Board/Kanban.php',
            'resources/js/mesh/Board/Kanban/index.tsx',
            'resources/js/mesh/Board/Kanban/Column.tsx',
            'resources/js/mesh/Board/Kanban/CardItem.tsx',
        ]">
        <mesh:board.kanban />
    </x-demo.section>
</div>
