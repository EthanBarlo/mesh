<div class="space-y-12">
    <x-demo.page-header
        title="Blade-Composed Kanban"
        description="The Drag & Drop Board renders the whole board inside one Svelte island. This page flips it inside out: a plain Livewire component owns the board, each column header and each card is its own Mesh island composed with Blade @foreach loops — and Svelte handles only the part it's uniquely good at: the drag-and-drop interactivity." />

    <x-demo.section
        title="Columns and cards as separate islands"
        description="Thirteen islands, zero client-side board state. Every card is a mesh:kanban.card rendered by Blade; every header and drop zone is a mesh:kanban.column. Dragging uses the native HTML5 drag-and-drop API — dataTransfer crosses app boundaries, so islands that share no Svelte app still cooperate. A drop dispatches kanban.card-moved onto Livewire's event bus; the Board moves the card server-side and the new order, counts, and positions flow back into every island as reactive props. Refresh the page — the board is session-persisted."
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
        description="The drop event isn't a private contract between Svelte and the Board — it's a regular Livewire event. This completely ordinary Livewire component (no Mesh, no Svelte) listens for the same kanban.card-moved dispatch and keeps an activity feed. Ephemeral drag state crosses islands via a window CustomEvent; persistent state goes through Livewire — that split is the whole protocol, defined in dnd.ts."
        :files="[
            'app/Livewire/Kanban/ActivityLog.php',
            'resources/js/components/demo/Kanban/dnd.ts',
        ]">
        <livewire:kanban.activity-log />
    </x-demo.section>

    {{-- Fine print --}}
    <div class="rounded-xl border border-white/5 bg-white/[0.02] p-6">
        <h2 class="text-xs font-medium uppercase tracking-widest text-zinc-500">Fine print</h2>
        <ul class="mt-4 space-y-3 text-sm text-zinc-400 leading-relaxed list-disc pl-5 marker:text-zinc-600">
            <li>
                <span class="text-zinc-300 font-medium">Why not a drag-and-drop library here?</span>
                Each Mesh island is its own Svelte app, and a library like the Board's
                <code class="font-mono text-zinc-300">@formkit/drag-and-drop</code> wants to own every list
                it sorts — it can't coordinate cards rendered across separate islands. Native HTML5
                drag-and-drop belongs to the page, not to Svelte, so it crosses island boundaries freely.
                The <a href="{{ route('board') }}" class="text-white hover:text-zinc-300 underline underline-offset-2">Drag &amp; Drop Board</a>
                remains the single-island, library-driven version.
            </li>
            <li>
                <span class="text-zinc-300 font-medium">Why aren't the cards slot children of the column?</span>
                In Mesh v1, interactive Livewire or Mesh components inside a slot render dead (slots are
                static server HTML mirrored into Svelte). Instead, the cards are Blade <em>siblings</em> of the
                column island — Mesh wrappers render <code class="font-mono text-zinc-300">display: contents</code>,
                so the column's header and its <code class="font-mono text-zinc-300">order-1</code> drop tail
                sandwich the cards inside one flex column. True nesting via a shared root is an open
                proposal: <a href="https://github.com/EthanBarlo/mesh/issues/7" class="text-white hover:text-zinc-300 underline underline-offset-2">island groups (#7)</a>.
            </li>
            <li>
                <span class="text-zinc-300 font-medium">Native DnD is pointer-only.</span>
                No keyboard path and patchy touch support — a limitation of the browser API this composition
                uses, not of Mesh.
            </li>
            <li>
                <span class="text-zinc-300 font-medium">Cross-column moves remount the card island.</span>
                Livewire morphs the card into its new cell as a fresh component (same id, new Svelte app), so
                the cards are deliberately stateless — board state lives on the server, where it survives anyway.
            </li>
        </ul>
    </div>
</div>
