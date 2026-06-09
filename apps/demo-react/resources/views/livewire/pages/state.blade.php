<div class="space-y-12">
    <x-demo.page-header
        title="State & Reactive Props"
        description="Two ways data flows between PHP and React. useEntangle is useState that stays in sync with a Livewire property in both directions, and anything returned from props() is recomputed on the server each render and handed to your component in place — no remount, so local React state survives every request." />

    <x-demo.section
        title="Deferred vs live sync"
        description="Both inputs are entangled with a public Livewire property — the only difference is the second argument to useEntangle. Deferred (the default) updates React state instantly but batches the value with the next server request; live commits a round-trip on every keystroke. Watch the round-trip counter and the server-side values: the deferred input stays 'behind' until something triggers a request, like the flush button (wire.$commit()) or typing in the live input."
        :files="['app/Mesh/State/EntangleModes.php', 'resources/js/mesh/State/EntangleModes/index.tsx']">
        <mesh:state.entangle-modes />
    </x-demo.section>

    <x-demo.section
        title="Props update in place"
        description="The select below is plain Blade on this page's Livewire component, bound with wire:model.live. The Mesh component receives the same property through wire:model + #[Modelable], and its props() recomputes the palette on the server for every change. Mesh patches the new props into the mounted React tree without remounting — the elapsed-seconds timer is pure useState and keeps ticking while the palette changes around it."
        :files="['app/Mesh/State/PropsInPlace.php', 'resources/js/mesh/State/PropsInPlace/index.tsx', 'resources/views/livewire/pages/state.blade.php']">
        <div class="space-y-6">
            <div class="flex items-center gap-3">
                <label for="theme-select" class="text-sm font-medium text-slate-300">
                    Theme <span class="font-mono text-xs text-slate-500">(Blade select, wire:model.live)</span>
                </label>
                <select
                    id="theme-select"
                    wire:model.live="theme"
                    class="px-4 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                    <option value="rose">Rose</option>
                    <option value="amber">Amber</option>
                    <option value="emerald">Emerald</option>
                    <option value="cyan">Cyan</option>
                    <option value="violet">Violet</option>
                </select>
            </div>

            <mesh:state.props-in-place wire:model="theme" />
        </div>
    </x-demo.section>
</div>
