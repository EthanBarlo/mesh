@if (count($tabs))
    <div x-data="{ tab: 0, copied: false }" class="rounded-xl border border-white/5 overflow-hidden">
        <div class="flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
            <div class="flex overflow-x-auto" role="tablist">
                @foreach ($tabs as $i => $t)
                    <button
                        type="button"
                        role="tab"
                        @click="tab = {{ $i }}"
                        :class="tab === {{ $i }}
                            ? 'text-white border-white'
                            : 'text-zinc-500 border-transparent hover:text-zinc-300'"
                        class="px-4 py-2.5 text-xs font-medium font-mono whitespace-nowrap border-b-2 -mb-px transition-colors"
                    >
                        {{ $t['label'] }}
                    </button>
                @endforeach
            </div>
            <button
                type="button"
                @click="navigator.clipboard.writeText($refs.panels.children[tab].textContent.trim()).then(() => { copied = true; setTimeout(() => copied = false, 1500) }).catch(() => {})"
                class="shrink-0 px-3 py-2.5 text-xs font-medium text-zinc-500 hover:text-white transition-colors"
                aria-label="Copy code"
            >
                <span x-show="!copied">Copy</span>
                <span x-show="copied" x-cloak class="text-emerald-400">Copied!</span>
            </button>
        </div>
        <div x-ref="panels" class="bg-black/30">
            @foreach ($tabs as $i => $t)
                <div
                    x-show="tab === {{ $i }}"
                    @if ($i > 0) x-cloak @endif
                    class="overflow-x-auto text-[13px] leading-relaxed [&_pre]:p-4 [&_pre]:m-0 [&_pre]:min-w-max"
                >{!! $t['html'] !!}</div>
            @endforeach
        </div>
    </div>
@endif
