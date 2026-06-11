<div class="p-5 rounded-2xl bg-slate-800/60 border border-white/10">
    <div class="flex items-center justify-between gap-3">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Plain Livewire · ActivityLog</span>
        <span class="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
            <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            listening for kanban.card-moved
        </span>
    </div>

    <ul class="mt-4 space-y-2">
        @forelse ($entries as $entry)
            <li
                wire:key="log-{{ $entry['id'] }}"
                class="flex items-baseline gap-3 text-sm"
            >
                <span class="shrink-0 font-mono text-xs text-slate-500 tabular-nums">{{ $entry['time'] }}</span>
                <span class="text-slate-300">{{ $entry['text'] }}</span>
            </li>
        @empty
            <li class="text-sm text-slate-500">
                Nothing yet — drag a card on the board above. Entries live in this component's state and reset on reload.
            </li>
        @endforelse
    </ul>
</div>
