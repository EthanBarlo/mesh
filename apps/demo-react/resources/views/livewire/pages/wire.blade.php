<div class="space-y-12">
    <x-demo.page-header
        title="The $wire Bridge"
        description="useWire() hands React the full $wire object — server methods become Promises, Livewire's event bus becomes callbacks. No routes, no controllers, no fetch, no JSON plumbing."
    />

    <x-demo.section
        title="Call the server like a function"
        description="wire.$call('method', …args) invokes a public PHP method and resolves with whatever it returns. The textarea is analyzed by PHP; the dice are rolled by PHP. React just awaits."
        :files="['app/Mesh/Wire/ServerActions.php', 'resources/js/mesh/Wire/ServerActions/index.tsx']"
    >
        <mesh:wire.server-actions />
    </x-demo.section>

    <x-demo.section
        title="Islands talk to Livewire"
        description="React dispatches mesh.ping onto Livewire's event bus and a completely plain Livewire component toasts it. In the other direction, a Blade button dispatches page.ping and the island's PHP class catches it with #[On], feeding the count back through props()."
        :files="['app/Mesh/Wire/EventBridge.php', 'resources/js/mesh/Wire/EventBridge/index.tsx', 'app/Livewire/EventToast.php', 'resources/views/livewire/event-toast.blade.php', 'resources/views/livewire/pages/wire.blade.php']"
    >
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {{-- React → Livewire: the island dispatches, the plain component listens. --}}
            <div class="space-y-4">
                <p class="text-xs font-medium uppercase tracking-widest text-zinc-500">
                    React island <span class="text-rose-400">&rarr;</span> plain Livewire
                </p>
                <mesh:wire.event-bridge />
            </div>

            {{-- Livewire → React: a Blade button dispatches, the island's PHP class listens. --}}
            <div class="space-y-4">
                <p class="text-xs font-medium uppercase tracking-widest text-zinc-500">
                    Blade button <span class="text-zinc-400">&larr;&rarr;</span> the listening island
                </p>

                <div class="p-5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span class="text-xs font-medium uppercase tracking-widest text-zinc-500">Plain Blade · this page</span>
                    <p class="mt-2 text-sm text-zinc-400 leading-relaxed">
                        This button is ordinary Blade + Livewire — <code class="font-mono text-zinc-300 text-xs">wire:click="pingIslands"</code>
                        dispatches <code class="font-mono text-zinc-300 text-xs">page.ping</code>, which the React island's PHP class catches.
                    </p>
                    <button
                        type="button"
                        wire:click="pingIslands"
                        class="mt-4 px-5 h-11 rounded-lg bg-white text-zinc-950 text-sm font-medium hover:bg-zinc-200 active:scale-95 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-zinc-950"
                    >
                        Dispatch page.ping
                    </button>
                </div>

                <livewire:event-toast />
            </div>
        </div>
    </x-demo.section>

    <x-demo.section
        title="Watch server-driven changes"
        description="The server owns the value; React reacts. An interval schedules wire.$call('tick') every two seconds — PHP random-walks the price — and wire.$watch('price', cb) streams each change into local React state for the sparkline."
        :files="['app/Mesh/Wire/PriceWatcher.php', 'resources/js/mesh/Wire/PriceWatcher/index.tsx']"
    >
        <mesh:wire.price-watcher />
    </x-demo.section>
</div>
