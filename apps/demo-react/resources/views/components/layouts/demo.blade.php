<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <title>{{ $title ?? 'Mesh Demo' }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800&display=swap" rel="stylesheet" />

        @livewireStyles
        @vite(['resources/css/app.css', 'resources/js/app.ts'])

        <style>
            [x-cloak] { display: none !important; }
        </style>
    </head>
    <body class="font-sans antialiased bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
        <div x-data="{ sidebarOpen: false }" class="min-h-screen lg:flex">
            {{-- Mobile top bar --}}
            <header class="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/90 backdrop-blur-sm">
                <a href="{{ route('home') }}" class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <span class="text-lg font-bold text-white">Mesh</span>
                </a>
                <button
                    type="button"
                    @click="sidebarOpen = !sidebarOpen"
                    class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    aria-label="Toggle navigation"
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path x-show="!sidebarOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        <path x-show="sidebarOpen" x-cloak stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </header>

            <x-nav.sidebar />

            <main class="flex-1 min-w-0">
                <div class="max-w-4xl mx-auto px-6 py-10 lg:py-14">
                    {{ $slot }}
                </div>
            </main>
        </div>

        @livewireScriptConfig
    </body>
</html>
