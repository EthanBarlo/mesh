<div class="space-y-12">
    <x-demo.page-header
        title="Drag & Drop Board"
        description="Drag physics, touch support and cross-column sorting, the feature that usually forces a separate SPA, running inside a Livewire component. This board uses `@formkit/drag-and-drop`, as does the Vue demo through the library's Vue adapter; the React demo builds the same board with `dnd-kit`." />

    <x-demo.section
        title="Sortable kanban, entangled"
        description="`useEntangle('columns')` is the single source of board state. Each drag reorders locally first, as `@formkit/drag-and-drop` updates the lists, so feedback is instant. Then `wire.$call('moveCard', …)` confirms the move and the server saves the board to your session. Refresh the page and the order survives. Reset calls a server method, and the entangled box streams the reseeded board back into Svelte. Drag cards across columns or within one, with mouse or touch."
        caption="Board/Kanban · @formkit/drag-and-drop"
        :files="[
            'app/Mesh/Board/Kanban.php',
            'resources/js/mesh/Board/Kanban/index.svelte',
            'resources/js/mesh/Board/Kanban/Column.svelte',
            'resources/js/mesh/Board/Kanban/CardItem.svelte',
        ]">
        <mesh:board.kanban />
    </x-demo.section>
</div>
