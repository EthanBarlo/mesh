<div class="space-y-4">
    {{-- Toolbar: all plain Blade, re-rendered by this component --}}
    <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="sync k k--caps" @if ($syncCount > 0) data-on @endif aria-live="polite">
            <span class="sync__dot" aria-hidden="true"></span>
            @if ($syncCount > 0)
                <span>Synced <span class="sync__v">{{ $syncCount }}</span> {{ $syncCount === 1 ? 'move' : 'moves' }} · last <span class="sync__v">{{ $lastSyncAt }}</span></span>
            @else
                <span>No moves synced yet. Drag a card.</span>
            @endif
        </p>

        <button type="button" wire:click="resetBoard" class="btn btn--line btn--sm btn--tap">
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
            <div wire:key="col-{{ $column['id'] }}" class="lane">
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
