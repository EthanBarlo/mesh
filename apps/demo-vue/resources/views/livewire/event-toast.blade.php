<div>
    {{-- Always-visible listener panel --}}
    <div class="p-5 rounded-xl bg-white/[0.02] border border-white/5">
        <div class="flex items-center justify-between gap-3">
            <span class="text-xs font-medium uppercase tracking-widest text-zinc-500">Plain Livewire · EventToast</span>
            <span class="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                <span class="inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                listening for mesh.ping
            </span>
        </div>

        <div class="mt-4 flex items-center gap-4">
            <div class="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <span class="text-2xl font-semibold tabular-nums text-emerald-400">{{ $count }}</span>
            </div>
            <div class="min-w-0">
                <p class="text-sm font-medium text-white">{{ $count === 1 ? 'ping received' : 'pings received' }}</p>
                @if ($count > 0)
                    <p class="mt-0.5 text-sm text-zinc-400 truncate">Last message: <span class="text-zinc-300">&ldquo;{{ $message }}&rdquo;</span></p>
                @else
                    <p class="mt-0.5 text-sm text-zinc-500">Nothing yet — dispatch from the React island.</p>
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
            class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 shadow-2xl"
            role="status"
        >
            <div class="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            </div>
            <div class="pr-1">
                <p class="text-sm font-semibold text-white">mesh.ping &middot; #{{ $count }}</p>
                <p class="text-xs text-zinc-400">{{ $message }}</p>
            </div>
        </div>
    @endif
</div>
