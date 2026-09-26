<div class="space-y-4">
    {{-- Toolbar: all plain Blade, re-rendered by this component --}}
    <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400">
            <span @class(['h-1.5 w-1.5 rounded-full', 'bg-emerald-400' => $syncCount > 0, 'bg-zinc-500' => $syncCount === 0]) aria-hidden="true"></span>
            @if ($syncCount > 0)
                <span>Synced <span class="font-semibold text-zinc-200 tabular-nums">{{ $syncCount }}</span> {{ $syncCount === 1 ? 'move' : 'moves' }} · last <span class="font-mono text-zinc-300">{{ $lastSyncAt }}</span></span>
            @else
                <span>No moves synced yet — drag a card</span>
            @endif
        </div>

        <button
            type="button"
            wire:click="resetBoard"
            class="px-4 py-2 rounded-lg border border-white/10 text-sm font-medium text-zinc-400 hover:text-white hover:border-white/20 active:scale-95 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-zinc-950"
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
                class="flex flex-col rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden"
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
