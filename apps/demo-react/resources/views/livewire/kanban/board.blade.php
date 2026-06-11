<div class="space-y-4">
    {{-- Toolbar: all plain Blade, re-rendered by this component --}}
    <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400">
            <span @class(['h-1.5 w-1.5 rounded-full', 'bg-emerald-400' => $syncCount > 0, 'bg-slate-500' => $syncCount === 0]) aria-hidden="true"></span>
            @if ($syncCount > 0)
                <span>Synced <span class="font-semibold text-slate-200 tabular-nums">{{ $syncCount }}</span> {{ $syncCount === 1 ? 'move' : 'moves' }} · last <span class="font-mono text-slate-300">{{ $lastSyncAt }}</span></span>
            @else
                <span>No moves synced yet — drag a card</span>
            @endif
        </div>

        <button
            type="button"
            wire:click="resetBoard"
            class="px-4 py-2 rounded-xl bg-slate-800/80 border border-white/10 text-sm font-medium text-slate-300 hover:bg-slate-700/80 hover:text-white active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
            Reset board
        </button>
    </div>

    {{--
        The composition. Each column header and each card is its own Mesh
        island; Blade owns the layout. Mesh wrappers render display:contents,
        so the column island's header and its `order-1` drop tail become
        direct flex items of this cell — the cards slot visually between them.
    --}}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        @foreach ($columns as $column)
            <div
                wire:key="col-{{ $column['id'] }}"
                class="flex flex-col rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden"
            >
                <mesh:kanban.column
                    :column-id="$column['id']"
                    :title="$column['title']"
                    :count="count($column['cards'])"
                    wire:key="colhead-{{ $column['id'] }}"
                />

                @foreach ($column['cards'] as $i => $card)
                    <mesh:kanban.card
                        :card="$card"
                        :column-id="$column['id']"
                        :position="$i"
                        wire:key="card-{{ $card['id'] }}"
                    />
                @endforeach
            </div>
        @endforeach
    </div>
</div>
