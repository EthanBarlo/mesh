<div class="space-y-12">
    <x-demo.page-header
        title="Blade-Composed Kanban"
        description="The Drag & Drop Board renders the whole board in one Svelte island. This page turns it inside out: a plain Livewire component owns the board, Blade `@foreach` loops compose a Mesh island for each column header and each card, and Svelte handles only the drag-and-drop." />

    <x-demo.section
        title="Columns and cards as separate islands"
        description="Thirteen islands, no client-side board state. Blade renders each card as a `mesh:kanban.card` and each header and drop zone as a `mesh:kanban.column`. Dragging uses the native HTML5 API, whose `dataTransfer` crosses app boundaries, so islands that share no Svelte app still cooperate. A drop dispatches `kanban.card-moved` onto Livewire's event bus. The Board moves the card on the server, and the new order, counts and positions flow back into every island as reactive props. The board is saved to your session, so it survives a refresh."
        caption="Kanban/Column + Kanban/Card · 13 islands"
        :files="[
            'resources/views/livewire/kanban/board.blade.php',
            'app/Livewire/Kanban/Board.php',
            'app/Mesh/Kanban/Card.php',
            'resources/js/mesh/Kanban/Card/index.svelte',
            'app/Mesh/Kanban/Column.php',
            'resources/js/mesh/Kanban/Column/index.svelte',
        ]">
        <livewire:kanban.board />
    </x-demo.section>

    <x-demo.section
        title="Anything can listen"
        description="The drop event isn't a private contract between Svelte and the Board; it's a regular Livewire event. This ordinary Livewire component, with no Mesh and no Svelte, listens for the same `kanban.card-moved` dispatch and keeps a log. Ephemeral drag state crosses islands as a window `CustomEvent`; persistent state goes through Livewire. That split is the whole protocol, defined in `dnd.svelte.ts`."
        caption="ActivityLog · plain Livewire"
        :files="[
            'app/Livewire/Kanban/ActivityLog.php',
            'resources/js/components/demo/Kanban/dnd.svelte.ts',
        ]">
        <livewire:kanban.activity-log />
    </x-demo.section>

    <section aria-labelledby="kanban-notes">
        <p id="kanban-notes" class="notes__k k k--caps">General notes</p>
        <ol class="notes__list">
            <li>
                <p>
                    <strong class="font-semibold text-ink">Why not a drag-and-drop library here?</strong>
                    Each Mesh island is its own Svelte app, and a library like the Board's
                    <code class="partno">@formkit/drag-and-drop</code> wants to own every list it sorts, so it
                    can't coordinate cards rendered across separate islands. Native HTML5 drag-and-drop
                    belongs to the page, not to Svelte, so it crosses island boundaries.
                    The <a href="{{ route('board') }}" class="link">Drag &amp; Drop Board</a>
                    is the single-island, library-driven version.
                </p>
            </li>
            <li>
                <p>
                    <strong class="font-semibold text-ink">Why aren't the cards slot children of the column?</strong>
                    In Mesh v1, interactive Livewire or Mesh components inside a slot render dead: slots are
                    static server HTML mirrored into Svelte. So the cards are Blade <em>siblings</em> of the
                    column island. Mesh wrappers render <code class="partno">display: contents</code>, so the
                    column's header and its <code class="partno">order-1</code> drop tail sandwich the cards in
                    one flex column. True nesting through a shared root is an open proposal:
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
                    Livewire morphs the card into its new cell as a fresh component (same id, new Svelte app),
                    so the cards are deliberately stateless. Board state lives on the server, where it
                    survives anyway.
                </p>
            </li>
        </ol>
    </section>
</div>
