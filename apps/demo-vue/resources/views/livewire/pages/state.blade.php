<div class="space-y-12">
    <x-demo.page-header
        title="State & Reactive Props"
        description="Two ways data flows between PHP and Vue. `useEntangle` returns a writable ref that stays in sync with a Livewire property, in both directions. `props()` is recomputed on the server every render and handed to the mounted component in place, so local Vue state survives every request." />

    <x-demo.section
        title="Deferred vs live sync"
        caption="Two entangled inputs and the server's copy of each"
        description="Both inputs are entangled with a public Livewire property. The only difference is the second argument to `useEntangle`. Deferred, the default, updates Vue state at once but reaches PHP with the next request. Live sends a request on every keystroke. Type in the deferred input, then flush it or type in the live one."
        :files="['app/Mesh/State/EntangleModes.php', 'resources/js/mesh/State/EntangleModes/index.vue']">
        <mesh:state.entangle-modes />
    </x-demo.section>

    <x-demo.section
        title="Props update in place"
        caption="A Blade select drives the island's props while its local state keeps counting"
        description="The select is plain Blade on this page, bound with `wire:model.live`. The Mesh component receives the same property through `wire:model` and `#[Modelable]`, and its `props()` recomputes the palette on the server. Mesh patches the new props into the mounted Vue component without a remount, so the timer, a plain local `ref`, keeps counting."
        :files="['app/Mesh/State/PropsInPlace.php', 'resources/js/mesh/State/PropsInPlace/index.vue', 'resources/views/livewire/pages/state.blade.php']">
        <div>
            <div class="flex flex-wrap items-end gap-x-5 gap-y-2">
                <div class="w-full sm:w-72">
                    <div class="mb-1.5 flex items-baseline justify-between gap-3">
                        <label for="theme-select" class="block font-mono text-[0.6875rem] leading-normal tracking-[0.1em] text-ink-2 uppercase">Theme</label>
                        <span class="font-mono text-xs text-ink-3">wire:model.live="theme"</span>
                    </div>
                    <select id="theme-select" wire:model.live="theme" class="core-control">
                        <option value="rose">Rose</option>
                        <option value="amber">Amber</option>
                        <option value="emerald">Emerald</option>
                        <option value="cyan">Cyan</option>
                        <option value="violet">Violet</option>
                    </select>
                </div>
                <p class="k k--caps pb-3 text-ink-3">Plain Blade · StatePage</p>
            </div>

            <div class="core-wire" data-line="solid">wire:model="theme" → #[Modelable] $theme → props()</div>

            <mesh:state.props-in-place wire:model="theme" />
        </div>
    </x-demo.section>
</div>
