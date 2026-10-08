<div class="actlog">
    <div class="actlog__head k k--caps">
        <span>ActivityLog · plain Livewire</span>
        <span class="actlog__live">
            <span>Listening · <span class="normal-case tracking-normal">kanban.card-moved</span></span>
        </span>
    </div>

    <ol class="actlog__list" aria-live="polite">
        @forelse ($entries as $entry)
            <li wire:key="log-{{ $entry['id'] }}" class="actlog__row">
                <span class="actlog__seq">{{ str_pad((string) $entry['id'], 3, '0', STR_PAD_LEFT) }}</span>
                <time class="actlog__time">{{ $entry['time'] }}</time>
                <span>{{ $entry['text'] }}</span>
            </li>
        @empty
            <li class="actlog__empty">
                No events yet. Drag a card on the board above. Entries live in this component's state and reset on reload.
            </li>
        @endforelse
    </ol>
</div>
