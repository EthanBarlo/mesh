<div class="space-y-12">
    <x-demo.page-header
        title="Blade-Composed Kanban"
        description="The Drag & Drop Board renders the whole board in one React island. This page turns it inside out: a plain Livewire component owns the board, Blade `@foreach` loops compose a Mesh island for each column header and each card, and React handles only the drag-and-drop." />

    <x-demo.section
        title="Columns and cards as separate islands"
        description="Thirteen islands, no client-side board state. Blade renders each card as a `mesh:kanban.card` and each header and drop zone as a `mesh:kanban.column`. Dragging uses the native HTML5 API, whose `dataTransfer` crosses React roots, so islands that share no React tree still cooperate. A drop dispatches `kanban.card-moved` onto Livewire's event bus. The Board moves the card on the server, and the new order, counts and positions flow back into every island as reactive props. The board is saved to your session, so it survives a refresh."
        caption="Kanban/Column + Kanban/Card · 13 islands"
        :files="[
            'resources/views/livewire/kanban/board.blade.php',
            'app/Livewire/Kanban/Board.php',
            'app/Mesh/Kanban/Card.php',
            'resources/js/mesh/Kanban/Card/index.tsx',
            'app/Mesh/Kanban/Column.php',
            'resources/js/mesh/Kanban/Column/index.tsx',
        ]">
        <livewire:kanban.board />
    </x-demo.section>

    <x-demo.section
        title="Anything can listen"
        description="The drop event isn't a private contract between React and the Board; it's a regular Livewire event. This ordinary Livewire component, with no Mesh and no React, listens for the same `kanban.card-moved` dispatch and keeps a log. Ephemeral drag state crosses islands as a window `CustomEvent`; persistent state goes through Livewire. That split is the whole protocol, defined in `dnd.ts`."
        caption="ActivityLog · plain Livewire"
        :files="[
            'app/Livewire/Kanban/ActivityLog.php',
            'resources/js/components/demo/Kanban/dnd.ts',
        ]">
        <livewire:kanban.activity-log />
    </x-demo.section>

    <section aria-labelledby="kanban-notes">
        <p id="kanban-notes" class="notes__k k k--caps">General notes</p>
        <ol class="notes__list">
            <li>
                <p>
                    <strong class="font-semibold text-ink">Why not dnd-kit here?</strong>
                    Each Mesh island is its own React root, and React context, dnd-kit's
                    <code class="partno">DndContext</code> included, can't span roots. Native HTML5
                    drag-and-drop belongs to the page, not to React, so it crosses island boundaries.
                    The <a href="{{ route('board') }}" class="link">Drag &amp; Drop Board</a>
                    is the single-island dnd-kit version, with full keyboard support.
                </p>
            </li>
            <li>
                <p>
                    <strong class="font-semibold text-ink">Why aren't the cards slot children of the column?</strong>
                    In Mesh v1, interactive Livewire or Mesh components inside a slot render dead: slots are
                    static server HTML mirrored into React. So the cards are Blade <em>siblings</em> of the
                    column island. Mesh wrappers render <code class="partno">display: contents</code>, so the
                    column's header and its <code class="partno">order-1</code> drop tail sandwich the cards in
                    one flex column. True nesting through a shared React root is an open proposal:
                    <a href="https://github.com/EthanBarlo/mesh/issues/7" class="link">island groups (#7)</a>.
                </p>
            </li>
            <li>
                <p>
                    <strong class="font-semibold text-ink">Native drag-and-drop is pointer-only.</strong>
                    No keyboard path and patchy touch support. That's a limit of the browser API this
                    composition uses, not of Mesh.
                </p>
            </li>
            <li>
                <p>
                    <strong class="font-semibold text-ink">Cross-column moves remount the card island.</strong>
                    Livewire morphs the card into its new cell as a fresh component (same id, new React root),
                    so the cards are deliberately stateless. Board state lives on the server, where it
                    survives anyway.
                </p>
            </li>
        </ol>
    </section>
</div>
