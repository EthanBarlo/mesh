<div class="space-y-12">
    <x-demo.page-header
        title="Slots"
        description="Blade content between a Mesh component's opening and closing tags flows into Svelte as the `children` snippet. Wrap a piece in a named `livewire:slot` and it arrives as a snippet on a `slots` prop instead. The server owns the markup, so slot content stays reactive to every Livewire re-render."
    />

    {{-- Section 1: Default + named slots --}}
    <x-demo.section
        title="Default + named slots"
        caption="A Svelte card whose title, body and footer are written in Blade"
        description="Everything between the tags becomes the default slot: Svelte's `children` snippet. Content wrapped in a named `livewire:slot` arrives as a snippet on a `slots` prop, keyed by name. The card is a Svelte component; its title, body and footer are all written in Blade on this page."
        :files="[
            'resources/views/livewire/pages/slots.blade.php',
            'app/Mesh/Slots/Card.php',
            'resources/js/mesh/Slots/Card/index.svelte',
        ]"
    >
        <div class="mx-auto max-w-xl">
            <mesh:slots.card>
                <livewire:slot name="title">
                    <span class="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
                        Release notes
                        <span class="tag">Authored in Blade</span>
                    </span>
                </livewire:slot>

                <p>
                    This body is <strong class="font-semibold text-ink">plain Blade markup</strong>
                    on the page, rendered inside a Svelte component:
                </p>
                <ul class="core-list mt-3">
                    <li>The default slot renders through <code class="core-code">&#123;&#64;render children?.()&#125;</code></li>
                    <li>Named slots arrive together on a <code class="core-code">slots</code> prop, keyed by name: <code class="core-code">&#123;&#64;render slots.footer?.()&#125;</code></li>
                    <li>Bold text, tags and lists: any server-rendered markup works</li>
                </ul>

                <livewire:slot name="footer">
                    Served straight from this page's Blade view. No props involved.
                </livewire:slot>
            </mesh:slots.card>
        </div>
    </x-demo.section>

    {{-- Section 2: Slots are reactive --}}
    <x-demo.section
        title="Slots are reactive"
        caption="Server-rendered slot content morphed into the mounted card"
        description="Slot content is owned by the server. Mesh watches the hidden slot holder and morphs the rendered copy in place whenever a Livewire re-render changes it. Type below and the HTML inside the Svelte card updates live, with no remount."
        :files="[
            'app/Livewire/Pages/SlotsPage.php',
            'resources/views/livewire/pages/slots.blade.php',
        ]"
    >
        <div class="mx-auto max-w-xl">
            <div class="mb-1.5 flex items-baseline justify-between gap-3">
                <label for="slot-name" class="block font-mono text-[0.6875rem] leading-normal tracking-[0.1em] text-ink-2 uppercase">Your name</label>
                <span class="font-mono text-xs text-ink-3">wire:model.live="name"</span>
            </div>
            <input
                id="slot-name"
                type="text"
                wire:model.live="name"
                placeholder="world"
                autocomplete="off"
                class="core-control"
            />

            <div class="core-wire" data-line="solid">re-render → slot holder → morphed into the card</div>

            <mesh:slots.card variant="cyan">
                <livewire:slot name="title">{{ strtoupper($name) }}</livewire:slot>

                <p class="text-base text-ink">
                    Hello <span class="font-semibold">{{ $name }}</span>
                </p>
                <p class="mt-2">
                    The greeting and the shouted title are Blade interpolation inside slots.
                    Each keystroke re-renders this page on the server; Mesh diffs the slot holder
                    and morphs the new HTML into the Svelte card in place.
                </p>

                <livewire:slot name="footer">
                    Rendered for &ldquo;{{ $name }}&rdquo; by the server, morphed in place by Mesh.
                </livewire:slot>
            </mesh:slots.card>
        </div>
    </x-demo.section>

    {{-- The fine print: general notes, as on a drawing --}}
    <section class="space-y-6" aria-labelledby="slots-notes">
        <div>
            <h2 id="slots-notes" class="notes__k k k--caps">General notes · slots in v1</h2>
            <ol class="notes__list">
                <li>
                    <span>
                        <strong class="font-semibold text-ink">Slot content is static server HTML.</strong>
                        It is mirrored into the Svelte tree, not hydrated as live components. It stays reactive
                        to server re-renders, as above, but the markup itself carries no client behavior.
                    </span>
                </li>
                <li>
                    <span>
                        <strong class="font-semibold text-ink">No interactive Livewire or Alpine inside slots.</strong>
                        A nested Livewire component or Alpine directive would run in the hidden holder and render
                        dead in the Svelte copy. Pass interactive pieces as their own Mesh components, or as props.
                    </span>
                </li>
            </ol>
        </div>

        <x-demo.note tone="accent" title="Never put unescaped user input in a slot">
            Slot content is mirrored into the page with <code>innerHTML</code>.
            Blade escapes <code>@{{ }}</code> output, so slots built from it are safe.
            Anything written with <code>@{!! &hellip; !!}</code>, or any other unescaped output,
            is injected as raw HTML.
        </x-demo.note>
    </section>
</div>
