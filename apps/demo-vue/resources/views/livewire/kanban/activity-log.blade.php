<div class="p-5 rounded-xl bg-white/[0.02] border border-white/5">
    <div class="flex items-center justify-between gap-3">
        <span class="text-xs font-medium uppercase tracking-widest text-zinc-500">Plain Livewire · ActivityLog</span>
        <span class="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
            <span class="inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            listening for kanban.card-moved
        </span>
    </div>

    <ul class="mt-4 space-y-2">
        @forelse ($entries as $entry)
            <li
                wire:key="log-{{ $entry['id'] }}"
                class="flex items-baseline gap-3 text-sm"
            >
                <span class="shrink-0 font-mono text-xs text-zinc-600 tabular-nums">{{ $entry['time'] }}</span>
                <span class="text-zinc-300">{{ $entry['text'] }}</span>
            </li>
        @empty
            <li class="text-sm text-zinc-500">
                Nothing yet — drag a card on the board above. Entries live in this component's state and reset on reload.
            </li>
        @endforelse
    </ul>
</div>
