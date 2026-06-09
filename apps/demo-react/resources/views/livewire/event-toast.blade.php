<div>
    {{-- Always-visible listener panel --}}
    <div class="p-5 rounded-2xl bg-slate-800/60 border border-white/10">
        <div class="flex items-center justify-between gap-3">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Plain Livewire · EventToast</span>
            <span class="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                listening for mesh.ping
            </span>
        </div>

        <div class="mt-4 flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <span class="text-2xl font-bold tabular-nums text-emerald-400">{{ $count }}</span>
            </div>
            <div class="min-w-0">
                <p class="text-sm font-medium text-white">{{ $count === 1 ? 'ping received' : 'pings received' }}</p>
                @if ($count > 0)
                    <p class="mt-0.5 text-sm text-slate-400 truncate">Last message: <span class="text-emerald-300">&ldquo;{{ $message }}&rdquo;</span></p>
                @else
                    <p class="mt-0.5 text-sm text-slate-500">Nothing yet — dispatch from the React island.</p>
                @endif
            </div>
        </div>
    </div>

    {{-- Transient toast, re-shown on every ping (keyed by count so Alpine re-inits) --}}
    @if ($count > 0)
        <div
            wire:key="mesh-ping-toast-{{ $count }}"
            x-data="{ show: false }"
            x-init="requestAnimationFrame(() => show = true); setTimeout(() => show = false, 2800)"
            x-show="show"
            x-transition:enter="transition ease-out duration-200"
            x-transition:enter-start="opacity-0 translate-y-2"
            x-transition:enter-end="opacity-100 translate-y-0"
            x-transition:leave="transition ease-in duration-300"
            x-transition:leave-start="opacity-100 translate-y-0"
            x-transition:leave-end="opacity-0 translate-y-2"
            class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-800/90 border border-emerald-500/30 backdrop-blur-xl shadow-2xl shadow-emerald-500/10"
            role="status"
        >
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            </div>
            <div class="pr-1">
                <p class="text-sm font-semibold text-white">mesh.ping &middot; #{{ $count }}</p>
                <p class="text-xs text-slate-400">{{ $message }}</p>
            </div>
        </div>
    @endif
</div>
