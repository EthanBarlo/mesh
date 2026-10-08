<div class="space-y-12">
    <x-demo.page-header
        title="The $wire Bridge"
        description="`useWire()` hands Svelte the full `$wire` object. Server methods become Promises and Livewire's event bus becomes callbacks. No routes, no controllers, no fetch, no JSON plumbing."
    />

    <x-demo.section
        title="Call the server like a function"
        caption="Two PHP methods awaited from Svelte"
        description="`wire.$call('method', …args)` runs a public PHP method and resolves with whatever it returns. PHP analyzes the text and rolls the dice; Svelte awaits the result."
        :files="['app/Mesh/Wire/ServerActions.php', 'resources/js/mesh/Wire/ServerActions/index.svelte']"
    >
        <mesh:wire.server-actions />
    </x-demo.section>

    <x-demo.section
        title="Islands talk to Livewire"
        caption="Events crossing the bridge in both directions"
        description="The island dispatches `mesh.ping` onto Livewire's event bus, and a plain Livewire component shows it. In the other direction, a Blade button dispatches `page.ping`; the island's PHP class catches it with `#[On]` and passes the count back through `props()`."
        :files="['app/Mesh/Wire/EventBridge.php', 'resources/js/mesh/Wire/EventBridge/index.svelte', 'app/Livewire/EventToast.php', 'resources/views/livewire/event-toast.blade.php', 'resources/views/livewire/pages/wire.blade.php']"
    >
        <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
            {{-- Svelte side: the island sends mesh.ping and hears page.ping through its PHP class. --}}
            <div class="space-y-3">
                <p class="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span class="k k--caps text-ink-2">Svelte island</span>
                    <span class="k text-ink-3">EventBridge</span>
                </p>
                <mesh:wire.event-bridge />
            </div>

            {{-- Livewire side: a Blade button sends page.ping; a plain component hears mesh.ping. --}}
            <div class="space-y-3">
                <p class="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span class="k k--caps text-ink-2">Plain Livewire</span>
                    <span class="k text-ink-3">WirePage · EventToast</span>
                </p>

                <div class="border border-line-2 bg-paper p-5">
                    <p class="k k--caps text-ink-3">
                        Sends <span class="normal-case text-ink">page.ping</span>
                    </p>
                    <p class="mt-2 text-sm leading-relaxed text-ink-2">
                        An ordinary Blade button. <code class="core-code">wire:click="pingIslands"</code>
                        dispatches <code class="core-code">page.ping</code>, and the island's PHP class catches it.
                    </p>
                    <button type="button" wire:click="pingIslands" class="btn btn--line mt-4">
                        Dispatch page.ping
                    </button>
                </div>

                <livewire:event-toast />
            </div>
        </div>
    </x-demo.section>

    <x-demo.section
        title="Watch server-driven changes"
        caption="A server-owned price streamed into a sparkline"
        description="The server owns the value and Svelte reacts. An interval calls `wire.$call('tick')` every two seconds, PHP random-walks the price, and `wire.$watch('price', cb)` streams each change into Svelte state for the sparkline."
        :files="['app/Mesh/Wire/PriceWatcher.php', 'resources/js/mesh/Wire/PriceWatcher/index.svelte']"
    >
        <mesh:wire.price-watcher />
    </x-demo.section>
</div>
