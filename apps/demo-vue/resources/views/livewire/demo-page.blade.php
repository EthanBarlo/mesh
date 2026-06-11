<div class="min-h-screen flex flex-col bg-zinc-950">
    @php
        $steps = [
            [
                'title' => 'Scaffold it',
                'description' => 'One command stubs the PHP class and the Vue entry file.',
                'snippet' => 'php artisan make:mesh Counter',
            ],
            [
                'title' => 'Shape the props',
                'description' => 'A Livewire component that declares what Vue receives.',
                'snippet' => 'public function props(): array',
            ],
            [
                'title' => 'Write the Vue',
                'description' => 'A normal single-file component at index.vue.',
                'snippet' => '<script setup lang="ts">',
            ],
            [
                'title' => 'Drop it in Blade',
                'description' => 'Render it like any Livewire component, props and all.',
                'snippet' => '<mesh:counter />',
            ],
        ];
        $demos = [
            [
                'route' => 'state',
                'title' => 'State & Props',
                'description' => 'Two-way bind Vue state to Livewire properties — no API layer to maintain.',
                'icon' => 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99',
            ],
            [
                'route' => 'wire',
                'title' => 'The $wire Bridge',
                'description' => 'Call PHP methods straight from Vue without writing a single endpoint.',
                'icon' => 'M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z',
            ],
            [
                'route' => 'forms',
                'title' => 'Forms & Validation',
                'description' => 'Server-side validation errors land directly in your Vue form — no duplication.',
                'icon' => 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            ],
            [
                'route' => 'slots',
                'title' => 'Slots',
                'description' => 'Compose Blade content inside Vue components instead of rebuilding it as templates.',
                'icon' => 'M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z',
            ],
            [
                'route' => 'uploads',
                'title' => 'File Uploads',
                'description' => 'Progress, errors and previews without standing up an upload controller.',
                'icon' => 'M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z',
            ],
            [
                'route' => 'table',
                'title' => 'Data Table',
                'description' => 'TanStack Table over live server data — sorting and filtering with no JSON API.',
                'icon' => 'M3.75 5.25h16.5v13.5H3.75zM3.75 9.75h16.5M9.75 9.75v9',
            ],
            [
                'route' => 'charts',
                'title' => 'Live Charts',
                'description' => 'Real charting libraries driven by Livewire state — no websocket plumbing.',
                'icon' => 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
            ],
            [
                'route' => 'board',
                'title' => 'Drag & Drop Board',
                'description' => 'Drag-and-drop interactions on the client, persisted with a single $wire call.',
                'icon' => 'M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59',
            ],
            [
                'route' => 'architecture',
                'title' => 'Auto-discovery & Splitting',
                'description' => 'Components register themselves and code-split per component — zero config.',
                'icon' => 'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9',
            ],
        ];
    @endphp

    <header class="border-b border-white/5">
        <div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                    <svg class="w-4.5 h-4.5 text-zinc-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <span class="text-base font-semibold text-white tracking-tight">Mesh</span>
            </div>
            <a
                href="https://github.com/EthanBarlo/mesh"
                target="_blank"
                class="text-zinc-500 hover:text-white transition-colors"
                aria-label="View on GitHub"
            >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
                </svg>
            </a>
        </div>
    </header>

    <main class="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <!-- Hero -->
        <div class="text-center mb-14 max-w-2xl">
            <div class="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-zinc-500 mb-6">
                <span class="inline-flex rounded-full h-1.5 w-1.5 bg-rose-400"></span>
                Live demo
            </div>
            <h1 class="text-4xl sm:text-5xl font-semibold text-white mb-5 tracking-tight">
                Vue components in
                <span class="text-zinc-400">Livewire</span>
            </h1>
            <p class="text-lg text-zinc-400 leading-relaxed">
                Use the real Vue ecosystem inside Livewire &mdash; the Composition API, TypeScript and any npm library, backed by your Livewire component's state and methods.
            </p>
            <div class="mt-8 flex items-center justify-center gap-3">
                <a
                    href="{{ route('state') }}"
                    class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-zinc-950 font-medium hover:bg-zinc-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-zinc-950"
                >
                    Browse the demos
                </a>
                <a
                    href="https://mesh.ebarlow.dev"
                    target="_blank"
                    class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 text-zinc-400 font-medium hover:text-white hover:border-white/20 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-zinc-950"
                >
                    Read the docs
                </a>
                <a
                    href="https://github.com/EthanBarlo/mesh"
                    target="_blank"
                    class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 text-zinc-400 font-medium hover:text-white hover:border-white/20 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-zinc-950"
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
            {{-- A Mesh component (Vue frontend), rendered with the <mesh:…> tag. --}}
            <mesh:counter wire:model="count" />
        </div>
        <p class="mt-6 text-sm text-zinc-500 text-center">
            Same Livewire property. Three frontends. The Vue one is Mesh.
            <span class="block mt-1 text-xs text-zinc-600">
                The Alpine and Vue cards share the client-side Livewire store, so they stay in sync with each other instantly &mdash; watch the network tab: no requests. The Pure Livewire card shows what the <em>server</em> knows, so it sits still until a request happens &mdash; click its buttons and the deferred changes ride along, the server catches up, and all three line up again.
            </span>
        </p>

        <!-- How it works -->
        <div class="mt-24 max-w-5xl w-full">
            <h2 class="text-xl font-semibold text-white text-center mb-2 tracking-tight">How it works</h2>
            <p class="text-zinc-500 text-center mb-10">Four steps from nothing to a React-powered Livewire component.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/5">
                @foreach ($steps as $i => $step)
                    <div class="p-5 bg-zinc-950 flex flex-col">
                        <span class="font-mono text-xs text-zinc-600 mb-3">{{ str_pad($i + 1, 2, '0', STR_PAD_LEFT) }}</span>
                        <h3 class="font-medium text-white mb-1.5">{{ $step['title'] }}</h3>
                        <p class="text-sm text-zinc-500 mb-4 flex-1">{{ $step['description'] }}</p>
                        <code class="block font-mono text-xs text-zinc-400 whitespace-nowrap overflow-x-auto">{{ $step['snippet'] }}</code>
                    </div>
                @endforeach
            </div>
        </div>

        <!-- Demo Pages Grid -->
        <div class="mt-24 max-w-5xl w-full">
            <h2 class="text-xl font-semibold text-white text-center mb-2 tracking-tight">Explore the demos</h2>
            <p class="text-zinc-500 text-center mb-10">Each page is a live, working example with its full source alongside.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                @foreach ($demos as $demo)
                    <a
                        href="{{ route($demo['route']) }}"
                        class="group p-5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-zinc-950"
                    >
                        <svg class="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="{{ $demo['icon'] }}" />
                        </svg>
                        <h3 class="font-medium text-white mb-1 flex items-center gap-1.5">
                            {{ $demo['title'] }}
                            <svg class="w-3.5 h-3.5 text-zinc-600 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </h3>
                        <p class="text-sm text-zinc-500">{{ $demo['description'] }}</p>
                    </a>
                @endforeach
            </div>
        </div>
    </main>

    <footer class="border-t border-white/5 py-6">
        <div class="max-w-5xl mx-auto px-6 text-center text-sm text-zinc-600">
            Built with Laravel, Livewire &amp; Vue
        </div>
    </footer>
</div>
