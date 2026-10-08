<div>
    {{-- Always-visible listener panel --}}
    <div class="border border-line-2 bg-paper p-5">
        <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p class="k k--caps text-ink-3">
                Receives <span class="normal-case text-ink">mesh.ping</span>
            </p>
            <span class="core-status">
                <span class="core-dot" data-state="live" aria-hidden="true"></span>
                Listening
            </span>
        </div>

        <div class="mt-3 flex items-center gap-4">
            <span class="core-count">{{ $count }}</span>
            <div class="min-w-0">
                <p class="text-sm font-medium text-ink">{{ $count === 1 ? 'ping received' : 'pings received' }}</p>
                @if ($count > 0)
                    <p class="mt-0.5 truncate text-sm text-ink-3">Last message: <span class="font-mono text-xs text-ink">&ldquo;{{ $message }}&rdquo;</span></p>
                @else
                    <p class="mt-0.5 text-sm text-ink-3">Nothing yet. Dispatch from the {{ config('demo.framework_name') }} island.</p>
                @endif
            </div>
        </div>
    </div>

    {{-- Transient toast, re-shown on every ping (keyed by count so Alpine re-inits). Drawn as a drafting note. --}}
    @if ($count > 0)
        <aside
            wire:key="mesh-ping-toast-{{ $count }}"
            x-data="{ show: false }"
            x-init="requestAnimationFrame(() => show = true); setTimeout(() => show = false, 2800)"
            x-show="show"
            x-transition:enter="transition ease-out duration-200 motion-reduce:transition-none"
            x-transition:enter-start="opacity-0 translate-y-2"
            x-transition:enter-end="opacity-100 translate-y-0"
            x-transition:leave="transition ease-in duration-150 motion-reduce:transition-none"
            x-transition:leave-start="opacity-100 translate-y-0"
            x-transition:leave-end="opacity-0 translate-y-2"
            class="note event-toast"
            data-tone="ink"
            role="status"
        >
            <span class="note__mark" aria-hidden="true">
                <svg viewBox="0 0 22 22" width="20" height="20">
                    <rect x="1.5" y="1.5" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.25" />
                    <path d="M11 9.5v7" stroke="currentColor" stroke-width="1.5" />
                    <circle cx="11" cy="6.25" r="1.1" fill="currentColor" />
                </svg>
            </span>
            <div class="min-w-0">
                <p class="note__k k k--caps">
                    <span>Event <span class="tabular-nums">#{{ $count }}</span></span>
                    <span class="note__title"><code>mesh.ping</code></span>
                </p>
                <div class="note__content truncate">{{ $message }}</div>
            </div>
        </aside>
    @endif
</div>
