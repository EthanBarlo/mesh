@php
    $nav = [
        'Introduction' => [
            ['label' => 'Home', 'route' => 'home'],
        ],
        'Core' => [
            ['label' => 'State & Props', 'route' => 'state'],
            ['label' => 'The $wire Bridge', 'route' => 'wire'],
            ['label' => 'Forms & Validation', 'route' => 'forms'],
            ['label' => 'Slots', 'route' => 'slots'],
            ['label' => 'File Uploads', 'route' => 'uploads'],
        ],
        'Ecosystem' => [
            ['label' => 'Data Table', 'route' => 'table'],
            ['label' => 'Live Charts', 'route' => 'charts'],
            ['label' => 'Drag & Drop Board', 'route' => 'board'],
        ],
        'Advanced' => [
            ['label' => 'Blade-Composed Kanban', 'route' => 'kanban'],
        ],
        'Under the Hood' => [
            ['label' => 'Auto-discovery & Splitting', 'route' => 'architecture'],
        ],
    ];
@endphp

{{-- Mobile overlay --}}
<div
    x-show="sidebarOpen"
    x-cloak
    @click="sidebarOpen = false"
    class="lg:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
></div>

<aside
    :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    class="fixed lg:sticky top-0 z-50 lg:z-30 h-screen w-64 shrink-0 -translate-x-full lg:translate-x-0 transition-transform duration-200 border-r border-white/10 bg-slate-900/95 lg:bg-white/[0.02] backdrop-blur-xl flex flex-col"
>
    <a href="{{ route('home') }}" class="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        </div>
        <div>
            <span class="text-lg font-bold text-white leading-none block">Mesh</span>
            <span class="text-[11px] text-slate-500 leading-none">Demo showcase</span>
        </div>
    </a>

    <nav class="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        @foreach ($nav as $group => $items)
            <div>
                <p class="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{{ $group }}</p>
                <ul class="space-y-0.5">
                    @foreach ($items as $item)
                        @php $active = request()->routeIs($item['route']); @endphp
                        <li>
                            <a
                                href="{{ route($item['route']) }}"
                                @class([
                                    'block px-3 py-1.5 rounded-lg text-sm transition-colors',
                                    'bg-rose-500/10 text-rose-300 font-medium' => $active,
                                    'text-slate-400 hover:text-white hover:bg-white/5' => ! $active,
                                ])
                                @if ($active) aria-current="page" @endif
                            >
                                {{ $item['label'] }}
                            </a>
                        </li>
                    @endforeach
                </ul>
            </div>
        @endforeach
    </nav>

    <div class="px-6 py-4 border-t border-white/10 space-y-2.5">
        <a
            href="https://mesh.ebarlow.dev"
            target="_blank"
            class="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            Documentation
        </a>
        <a
            href="https://github.com/EthanBarlo/mesh"
            target="_blank"
            class="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
            </svg>
            GitHub
        </a>
    </div>
</aside>
