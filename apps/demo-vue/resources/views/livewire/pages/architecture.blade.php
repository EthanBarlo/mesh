<div class="space-y-12">
    <x-demo.page-header
        title="Auto-discovery & Code Splitting"
        description="Every folder under `resources/js/mesh` is a component: no registration call, no Vite input entry, no config. Mesh discovers each one at build time, splits it into its own lazy chunk, and fetches that chunk the first time the component renders on a page." />

    <x-demo.section
        title="Chunks load on demand"
        description="The three components below start unrendered, so none of their JS is on the page yet. Open the Network tab in DevTools, filter to JS, and render one: its chunk arrives the moment it first renders. The chart pulls in ECharts, hundreds of KB you don't pay for until someone needs a chart."
        caption="Three lazy chunks, toggled by Livewire"
        :files="['app/Mesh/Architecture/HelloIsland.php', 'resources/js/mesh/Architecture/HelloIsland/index.vue', 'resources/views/livewire/pages/architecture.blade.php']">
        @php
            $toggles = [
                'hello' => [
                    'name' => 'Hello Island',
                    'tag' => 'architecture.hello-island',
                    'note' => 'A tiny chunk: a card with an elapsed-since-mount ticker, so you can see it just mounted.',
                ],
                'table' => [
                    'name' => 'Data Table',
                    'tag' => 'table.orders-table',
                    'note' => 'A mid-size chunk: the full orders table with sorting, search and pagination.',
                ],
                'chart' => [
                    'name' => 'Chart',
                    'tag' => 'charts.revenue-chart',
                    'note' => 'The heavyweight. Its chunk imports ECharts, so hundreds of KB load on the first toggle only.',
                ],
            ];
        @endphp

        <div class="space-y-6">
            <div class="grid gap-4 sm:grid-cols-3">
                @foreach ($toggles as $key => $toggle)
                    @php($isOn = in_array($key, $loaded))
                    <div class="chunk" @if ($isOn) data-on @endif>
                        <div class="flex-1">
                            <div class="chunk__head">
                                <h3 class="chunk__name">{{ $toggle['name'] }}</h3>
                                <span class="chunk__state k k--caps">{{ $isOn ? 'Mounted' : 'Not loaded' }}</span>
                            </div>
                            <p class="chunk__note">{{ $toggle['note'] }}</p>
                            <code class="chunk__tag">&lt;mesh:{{ $toggle['tag'] }} /&gt;</code>
                        </div>
                        <button
                            type="button"
                            wire:click="toggle('{{ $key }}')"
                            class="btn btn--line w-full"
                        >
                            {{ $isOn ? 'Unmount' : 'Render it' }}
                        </button>
                    </div>
                @endforeach
            </div>

            @if (count($loaded))
                <div class="space-y-6">
                    @if (in_array('hello', $loaded))
                        <mesh:architecture.hello-island />
                    @endif

                    @if (in_array('table', $loaded))
                        <mesh:table.orders-table />
                    @endif

                    @if (in_array('chart', $loaded))
                        <mesh:charts.revenue-chart />
                    @endif
                </div>
            @else
                <p class="chunk-empty k">
                    Nothing rendered yet, and nothing downloaded. Render a component above with the Network tab open.
                </p>
            @endif
        </div>
    </x-demo.section>

    <x-demo.section
        title="The discovery manifest"
        description="This page's Livewire component builds the table live. It scans `resources/js/mesh` on the server the way Mesh's build-time discovery does, and derives each id and PHP class from the folder path alone. A check mark means the class file exists under `app/Mesh`."
        caption="Discovered components, scanned on this request"
        :files="['app/Livewire/Pages/ArchitecturePage.php']">
        <div class="space-y-6">
            <div class="bom">
                <table>
                    <thead>
                        <tr>
                            <th scope="col" class="text-left">Component id</th>
                            <th scope="col" class="text-left">Frontend entry</th>
                            <th scope="col" class="text-left">PHP class</th>
                            <th scope="col" class="text-center">Exists</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($manifest as $entry)
                            <tr>
                                <td class="bom__mono bom__strong">{{ $entry['id'] }}</td>
                                <td class="bom__mono">{{ $entry['entry'] }}</td>
                                <td class="bom__mono">{{ $entry['class'] }}</td>
                                <td class="text-center">
                                    @if ($entry['classExists'])
                                        <svg class="inline-block w-3.5 h-3.5 text-ink" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2 7.5L5.5 11L12 3.5" /></svg>
                                        <span class="sr-only">Class file exists</span>
                                    @else
                                        <svg class="inline-block w-3.5 h-3.5 text-danger" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 3L11 11M11 3L3 11" /></svg>
                                        <span class="sr-only">Class file missing</span>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            <div>
                <p class="mb-3 text-sm text-ink-2">Adding a row takes one command. It scaffolds both sides, and both are discovered automatically:</p>
                <figure class="term">
                    <figcaption class="term__head k k--caps">Terminal</figcaption>
                    <pre class="term__body"><code><span class="term__prompt">$</span> php artisan make:mesh Reports/Chart

<span class="term__ok">created</span> <span class="term__path">app/Mesh/Reports/Chart.php</span>
<span class="term__ok">created</span> <span class="term__path">resources/js/mesh/Reports/Chart/index.{{ config('demo.extension', 'tsx') }}</span></code></pre>
                </figure>
            </div>
        </div>
    </x-demo.section>

    <x-demo.section
        title="How ids are derived"
        description="Both sides reduce to the same short id with no shared config. PHP strips the `App\Mesh` prefix and turns backslashes into slashes; JS keeps the folder path after `resources/js/mesh` and drops the trailing `/index.{{ config('demo.extension', 'tsx') }}`. If the two strings match, the tag works. The extension picks the renderer: `.tsx` and `.jsx` render with React, `.vue` with Vue, `.svelte` with Svelte, and an unknown extension throws at build time instead of guessing."
        caption="Class and entry reduce to one id"
        :live="false">
        @include('livewire.pages.architecture.id-figure')
    </x-demo.section>

    <x-demo.note title="Case-sensitive, on purpose">
        Ids are matched byte for byte: <code>Counter</code> maps to the
        <code>Counter/</code> folder, never <code>counter/</code>. macOS's
        case-insensitive filesystem can hide a mismatch that breaks on Linux, so keep folder names
        byte-identical to the StudlyCase class segments.
    </x-demo.note>
</div>
