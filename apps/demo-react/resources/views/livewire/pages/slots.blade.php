<div class="space-y-12">
    <x-demo.page-header
        title="Slots"
        description="Blade content placed between a Mesh component's opening and closing tags flows into React as children. Wrap a piece in a named livewire:slot and it arrives on a slots prop instead — and because the server owns the markup, slot content stays reactive to every Livewire re-render."
    />

    {{-- Section 1: Default + named slots --}}
    <x-demo.section
        title="Default + named slots"
        description="Everything between the tags becomes the default slot — React children. Content wrapped in a named livewire:slot arrives together on a slots prop, keyed by name. The card below is a React component; its title, body, and footer are all authored in Blade on this page."
        :files="[
            'resources/views/livewire/pages/slots.blade.php',
            'app/Mesh/Slots/Card.php',
            'resources/js/mesh/Slots/Card/index.tsx',
        ]"
    >
        <div class="max-w-xl mx-auto">
            <mesh:slots.card>
                <livewire:slot name="title">
                    <span class="inline-flex items-center gap-2.5">
                        Release notes
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            Authored in Blade
                        </span>
                    </span>
                </livewire:slot>

                <p>
                    This body is written as <strong class="text-white font-semibold">plain Blade markup</strong>
                    on the page, yet it renders inside a React component:
                </p>
                <ul class="mt-3 space-y-1.5 list-disc list-inside marker:text-rose-400">
                    <li>The default slot becomes the React <code class="px-1.5 py-0.5 rounded bg-white/10 text-rose-300 font-mono text-xs">children</code> prop</li>
                    <li>Named slots arrive together on a <code class="px-1.5 py-0.5 rounded bg-white/10 text-rose-300 font-mono text-xs">slots</code> prop, keyed by name</li>
                    <li>Bold text, badges, and lists — any server-rendered markup works</li>
                </ul>

                <livewire:slot name="footer">
                    slots.footer &mdash; served straight from the page's Blade view, no props involved.
                </livewire:slot>
            </mesh:slots.card>
        </div>
    </x-demo.section>

    {{-- Section 2: Slots are reactive --}}
    <x-demo.section
        title="Slots are reactive"
        description="Slot content is owned by the server. Mesh observes the hidden slot holder and morphs the rendered copy in place whenever a Livewire re-render changes it — type below and watch the HTML inside the React card update live, no remount."
        :files="[
            'app/Livewire/Pages/SlotsPage.php',
            'resources/views/livewire/pages/slots.blade.php',
        ]"
    >
        <div class="max-w-xl mx-auto space-y-5">
            <div>
                <label for="slot-name" class="block text-sm font-medium text-slate-300 mb-2">
                    Your name <span class="text-slate-500 font-normal">(wire:model.live="name")</span>
                </label>
                <input
                    id="slot-name"
                    type="text"
                    wire:model.live="name"
                    placeholder="world"
                    autocomplete="off"
                    class="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-500/40 transition"
                />
            </div>

            <mesh:slots.card variant="cyan">
                <livewire:slot name="title">{{ strtoupper($name) }}</livewire:slot>

                <p class="text-base text-white">
                    Hello <span class="font-semibold text-cyan-300">{{ $name }}</span>
                </p>
                <p class="mt-2">
                    Both the greeting above and the shouted title are Blade interpolation inside slots.
                    Each keystroke re-renders this page on the server; Mesh diffs the slot holder and
                    morphs the new HTML into the React card in place.
                </p>

                <livewire:slot name="footer">
                    Rendered for &ldquo;{{ $name }}&rdquo; by the server, morphed in place by Mesh.
                </livewire:slot>
            </mesh:slots.card>
        </div>
    </x-demo.section>

    {{-- Section 3: The fine print --}}
    <x-demo.section
        title="The fine print"
        description="What v1 slots can and can't do."
    >
        <div class="space-y-4">
            <div class="flex gap-4 p-4 rounded-xl bg-slate-900/40 border border-white/10">
                <div class="shrink-0 w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm font-bold">1</div>
                <div>
                    <h3 class="text-sm font-semibold text-white">Slot content is static server HTML</h3>
                    <p class="mt-1 text-sm text-slate-400 leading-relaxed">
                        Slots are rendered statically from the HTML the server produced — they're mirrored
                        into the React tree, not hydrated as live components. They stay reactive to server
                        re-renders (as above), but the markup itself carries no client behaviour.
                    </p>
                </div>
            </div>

            <div class="flex gap-4 p-4 rounded-xl bg-slate-900/40 border border-white/10">
                <div class="shrink-0 w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm font-bold">2</div>
                <div>
                    <h3 class="text-sm font-semibold text-white">No interactive Livewire or Alpine inside slots in v1</h3>
                    <p class="mt-1 text-sm text-slate-400 leading-relaxed">
                        A nested Livewire component or Alpine directive inside a slot would run in a hidden
                        holder and render dead in the React copy. Pass interactive pieces as their own Mesh
                        components or as props instead.
                    </p>
                </div>
            </div>

            <div class="flex gap-4 p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
                <div class="shrink-0 w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4" aria-hidden="true">
                        <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div>
                    <h3 class="text-sm font-semibold text-rose-300">Security: never pipe user input through unescaped output</h3>
                    <p class="mt-1 text-sm text-slate-400 leading-relaxed">
                        Slot content is mirrored into the page with
                        <code class="px-1.5 py-0.5 rounded bg-white/10 text-rose-300 font-mono text-xs">dangerouslySetInnerHTML</code>.
                        Blade escapes <code class="px-1.5 py-0.5 rounded bg-white/10 text-rose-300 font-mono text-xs">@{{ }}</code>
                        interpolation, so slots built from <code class="px-1.5 py-0.5 rounded bg-white/10 text-rose-300 font-mono text-xs">@{{ &hellip; }}</code>
                        are safe. Content written with <code class="px-1.5 py-0.5 rounded bg-white/10 text-rose-300 font-mono text-xs">@{!! &hellip; !!}</code>
                        (or any other unescaped output) is injected as raw HTML &mdash; never put unsanitised
                        user input in a slot.
                    </p>
                </div>
            </div>
        </div>
    </x-demo.section>
</div>
