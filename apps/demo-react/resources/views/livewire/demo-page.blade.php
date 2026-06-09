<div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <span class="text-xl font-bold text-white">Mesh</span>
            </div>
            <a
                href="https://github.com/EthanBarlo/mesh"
                target="_blank"
                class="text-slate-400 hover:text-white transition-colors"
                aria-label="View on GitHub"
            >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
                </svg>
            </a>
        </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <!-- Hero Section -->
        <div class="text-center mb-12 max-w-2xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium mb-6">
                <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                Live Demo
            </div>
            <h1 class="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
                React Components in
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Livewire</span>
            </h1>
            <p class="text-lg text-slate-400 leading-relaxed">
                Use the real React ecosystem inside Livewire &mdash; hooks, TypeScript and any npm library, backed by your Livewire component's state and methods.
            </p>
            <div class="mt-8 flex items-center justify-center gap-4">
                <a
                    href="{{ route('state') }}"
                    class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold shadow-lg shadow-rose-500/25 hover:from-rose-600 hover:to-orange-600 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                    Browse the demos
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </a>
                <a
                    href="https://github.com/EthanBarlo/mesh"
                    target="_blank"
                    class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-medium hover:bg-white/10 hover:text-white active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                    View on GitHub
                </a>
            </div>
        </div>

        <!-- Counter Cards -->
        <div class="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
            {{-- A plain Livewire component, rendered with the standard <livewire:…> tag. --}}
            <livewire:counter wire:model="count" />
            {{-- A Livewire component with Alpine-managed client-side state via entangle. --}}
            <livewire:counter-alpine wire:model="count" />
            {{-- A Mesh component (React frontend), rendered with the <mesh:…> tag. --}}
            <mesh:counter wire:model="count" />
        </div>
        <p class="mt-6 text-sm text-slate-500 text-center">
            Same Livewire property. Three frontends. The React one is Mesh.
            <span class="block mt-1 text-xs text-slate-600">
                The Alpine and React cards track every change instantly on the client; the server-rendered Livewire card catches up on its next request — click its buttons and it picks up right where the others left off.
            </span>
        </p>

        <!-- How it works -->
        <div class="mt-20 max-w-5xl w-full">
            <h2 class="text-2xl font-bold text-white text-center mb-2">How it works</h2>
            <p class="text-slate-400 text-center mb-8">Four steps from nothing to a React-powered Livewire component.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                @php
                    $steps = [
                        [
                            'title' => 'Scaffold it',
                            'description' => 'One command stubs the PHP class and the React entry file.',
                            'snippet' => 'php artisan make:mesh Counter',
                        ],
                        [
                            'title' => 'Shape the props',
                            'description' => 'A Livewire component that declares what React receives.',
                            'snippet' => 'public function props(): array',
                        ],
                        [
                            'title' => 'Write the React',
                            'description' => 'A normal component, default-exported from index.tsx.',
                            'snippet' => 'export default Counter;',
                        ],
                        [
                            'title' => 'Drop it in Blade',
                            'description' => 'Render it like any Livewire component, props and all.',
                            'snippet' => '<mesh:counter />',
                        ],
                    ];
                @endphp
                @foreach ($steps as $i => $step)
                    <div class="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col">
                        <div class="flex items-center gap-3 mb-3">
                            <span class="w-7 h-7 shrink-0 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 text-white text-sm font-bold flex items-center justify-center">
                                {{ $i + 1 }}
                            </span>
                            <h3 class="font-semibold text-white">{{ $step['title'] }}</h3>
                        </div>
                        <p class="text-sm text-slate-400 mb-4 flex-1">{{ $step['description'] }}</p>
                        <code class="block px-3 py-2 rounded-lg bg-slate-950/60 border border-white/10 font-mono text-xs text-cyan-300 whitespace-nowrap overflow-x-auto">{{ $step['snippet'] }}</code>
                    </div>
                @endforeach
            </div>
        </div>

        <!-- Demo Pages Grid -->
        <div class="mt-20 max-w-5xl w-full">
            <h2 class="text-2xl font-bold text-white text-center mb-2">Explore the demos</h2>
            <p class="text-slate-400 text-center mb-8">Each page is a live, working example with its full source alongside.</p>
            @php
                $demos = [
                    [
                        'route' => 'state',
                        'title' => 'State & Props',
                        'description' => 'Two-way bind React state to Livewire properties — no API layer to maintain.',
                        'iconBg' => 'bg-cyan-500/15',
                        'iconText' => 'text-cyan-400',
                        'icon' => 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99',
                    ],
                    [
                        'route' => 'wire',
                        'title' => 'The $wire Bridge',
                        'description' => 'Call PHP methods straight from React without writing a single endpoint.',
                        'iconBg' => 'bg-blue-500/15',
                        'iconText' => 'text-blue-400',
                        'icon' => 'M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z',
                    ],
                    [
                        'route' => 'forms',
                        'title' => 'Forms & Validation',
                        'description' => 'Server-side validation errors land directly in your React form — no duplication.',
                        'iconBg' => 'bg-emerald-500/15',
                        'iconText' => 'text-emerald-400',
                        'icon' => 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                    ],
                    [
                        'route' => 'slots',
                        'title' => 'Slots',
                        'description' => 'Compose Blade content inside React components instead of rebuilding it as JSX.',
                        'iconBg' => 'bg-purple-500/15',
                        'iconText' => 'text-purple-400',
                        'icon' => 'M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z',
                    ],
                    [
                        'route' => 'uploads',
                        'title' => 'File Uploads',
                        'description' => 'Progress, errors and previews without standing up an upload controller.',
                        'iconBg' => 'bg-amber-500/15',
                        'iconText' => 'text-amber-400',
                        'icon' => 'M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z',
                    ],
                    [
                        'route' => 'table',
                        'title' => 'Data Table',
                        'description' => 'TanStack Table over live server data — sorting and filtering with no JSON API.',
                        'iconBg' => 'bg-sky-500/15',
                        'iconText' => 'text-sky-400',
                        'icon' => 'M3.75 5.25h16.5v13.5H3.75zM3.75 9.75h16.5M9.75 9.75v9',
                    ],
                    [
                        'route' => 'charts',
                        'title' => 'Live Charts',
                        'description' => 'Real React charting libraries driven by Livewire state — no websocket plumbing.',
                        'iconBg' => 'bg-rose-500/15',
                        'iconText' => 'text-rose-400',
                        'icon' => 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
                    ],
                    [
                        'route' => 'board',
                        'title' => 'Drag & Drop Board',
                        'description' => 'dnd-kit interactions on the client, persisted with a single $wire call.',
                        'iconBg' => 'bg-orange-500/15',
                        'iconText' => 'text-orange-400',
                        'icon' => 'M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59',
                    ],
                    [
                        'route' => 'architecture',
                        'title' => 'Auto-discovery & Splitting',
                        'description' => 'Components register themselves and code-split per component — zero config.',
                        'iconBg' => 'bg-indigo-500/15',
                        'iconText' => 'text-indigo-400',
                        'icon' => 'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9',
                    ],
                ];
            @endphp
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                @foreach ($demos as $demo)
                    <a
                        href="{{ route($demo['route']) }}"
                        class="group p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                    >
                        <div class="w-10 h-10 rounded-lg {{ $demo['iconBg'] }} flex items-center justify-center mb-3">
                            <svg class="w-5 h-5 {{ $demo['iconText'] }}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="{{ $demo['icon'] }}" />
                            </svg>
                        </div>
                        <h3 class="font-semibold text-white mb-1 flex items-center gap-1.5">
                            {{ $demo['title'] }}
                            <svg class="w-4 h-4 text-slate-500 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </h3>
                        <p class="text-sm text-slate-400">{{ $demo['description'] }}</p>
                    </a>
                @endforeach
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-white/10 py-6">
        <div class="max-w-5xl mx-auto px-6 text-center text-sm text-slate-500">
            Built with Laravel, Livewire & React
        </div>
    </footer>
</div>
