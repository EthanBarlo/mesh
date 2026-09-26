<div class="space-y-12">
    <x-demo.page-header
        title="Auto-discovery & Code Splitting"
        description="Every folder under resources/js/mesh becomes a component — no registration call, no Vite input entry, no config. Mesh discovers each one at build time, code-splits it into its own lazy chunk, and only fetches that chunk the first time the component actually renders on a page." />

    <x-demo.section
        title="Chunks load on demand"
        description="All three components below start unrendered, so none of their JS is on this page yet. Open your DevTools Network tab (filter to JS), click a toggle, and watch that component's chunk arrive the moment it first renders. The chart is the dramatic one — it pulls in ECharts, hundreds of KB that you never pay for until someone actually needs a chart."
        :files="['app/Mesh/Architecture/HelloIsland.php', 'resources/js/mesh/Architecture/HelloIsland/index.vue', 'resources/views/livewire/pages/architecture.blade.php']">
        @php
            $toggles = [
                'hello' => [
                    'name' => 'Hello Island',
                    'tag' => 'architecture.hello-island',
                    'note' => 'A tiny chunk — a card with an elapsed-since-mount ticker, so you can see it really did just mount.',
                ],
                'table' => [
                    'name' => 'Data Table',
                    'tag' => 'table.orders-table',
                    'note' => 'A mid-size chunk — the full orders table with sorting, search, and pagination.',
                ],
                'chart' => [
                    'name' => 'Chart',
                    'tag' => 'charts.revenue-chart',
                    'note' => 'The heavyweight — its chunk imports ECharts, so hundreds of KB load only on first toggle.',
                ],
            ];
        @endphp

        <div class="space-y-6">
            <div class="grid gap-4 sm:grid-cols-3">
                @foreach ($toggles as $key => $toggle)
                    @php($isOn = in_array($key, $loaded))
                    <div class="p-5 rounded-xl bg-white/[0.02] border {{ $isOn ? 'border-white/20' : 'border-white/5' }} flex flex-col gap-4 transition-colors duration-200">
                        <div class="flex-1">
                            <div class="flex items-center justify-between gap-2">
                                <h3 class="text-sm font-semibold tracking-tight text-white">{{ $toggle['name'] }}</h3>
                                <span class="inline-flex items-center gap-1.5 text-[11px] font-medium {{ $isOn ? 'text-emerald-400' : 'text-zinc-500' }}">
                                    <span class="w-1.5 h-1.5 rounded-full {{ $isOn ? 'bg-emerald-400' : 'bg-zinc-600' }}"></span>
                                    {{ $isOn ? 'Mounted' : 'Not loaded' }}
                                </span>
                            </div>
                            <p class="mt-1.5 text-xs text-zinc-400 leading-relaxed">{{ $toggle['note'] }}</p>
                            <code class="mt-2 inline-block text-[11px] font-mono text-zinc-400">&lt;mesh:{{ $toggle['tag'] }} /&gt;</code>
                        </div>
                        <button
                            type="button"
                            wire:click="toggle('{{ $key }}')"
                            class="w-full px-4 py-2.5 rounded-lg text-sm font-medium active:scale-95 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 {{ $isOn
                                ? 'border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 focus:ring-white/20'
                                : 'bg-white text-zinc-950 hover:bg-zinc-200 focus:ring-white/40' }}"
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
                <div class="px-5 py-8 rounded-xl border border-dashed border-white/10 text-center">
                    <p class="text-sm text-zinc-500">Nothing rendered yet — and nothing downloaded yet. Toggle a component above with the Network tab open.</p>
                </div>
            @endif
        </div>
    </x-demo.section>

    <x-demo.section
        title="The discovery manifest"
        description="This table is generated live by this page's Livewire component: it scans resources/js/mesh on the server exactly the way Mesh's build-time discovery does, and derives each component's id and PHP class from nothing but the folder path. The check marks confirm the matching class file exists under app/Mesh."
        :files="['app/Livewire/Pages/ArchitecturePage.php']">
        <div class="space-y-6">
            <div class="overflow-x-auto rounded-xl border border-white/5">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="bg-white/[0.02] text-left">
                            <th class="px-4 py-3 text-xs font-medium uppercase tracking-widest text-zinc-500">Component id</th>
                            <th class="px-4 py-3 text-xs font-medium uppercase tracking-widest text-zinc-500">Frontend entry</th>
                            <th class="px-4 py-3 text-xs font-medium uppercase tracking-widest text-zinc-500">PHP class</th>
                            <th class="px-4 py-3 text-xs font-medium uppercase tracking-widest text-zinc-500 text-center">Exists</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        @foreach ($manifest as $entry)
                            <tr class="hover:bg-white/[0.04] transition-colors">
                                <td class="px-4 py-3 font-mono text-zinc-300 whitespace-nowrap">{{ $entry['id'] }}</td>
                                <td class="px-4 py-3 font-mono text-xs text-zinc-400 whitespace-nowrap">{{ $entry['entry'] }}</td>
                                <td class="px-4 py-3 font-mono text-xs text-zinc-400 whitespace-nowrap">{{ $entry['class'] }}</td>
                                <td class="px-4 py-3 text-center">
                                    @if ($entry['classExists'])
                                        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/5 border border-white/10 text-emerald-400" title="Class file exists">
                                            <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.6a1 1 0 0 1-1.42.004l-3.5-3.5a1 1 0 1 1 1.414-1.415l2.79 2.79 6.796-6.887a1 1 0 0 1 1.414-.007Z" clip-rule="evenodd"/></svg>
                                            <span class="sr-only">Class file exists</span>
                                        </span>
                                    @else
                                        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/5 border border-white/10 text-rose-400" title="Class file missing">
                                            <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/></svg>
                                            <span class="sr-only">Class file missing</span>
                                        </span>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            <div>
                <p class="text-sm text-zinc-400 mb-3">Adding a row to that table takes one command — it scaffolds both sides and they are discovered automatically:</p>
                <div class="rounded-xl bg-black/30 border border-white/5 overflow-hidden">
                    <div class="px-4 py-2 border-b border-white/5 text-[11px] font-medium uppercase tracking-widest text-zinc-500">Terminal</div>
                    <pre class="px-4 py-3 text-sm font-mono overflow-x-auto"><code><span class="text-zinc-600">$</span> <span class="text-white">php artisan make:mesh Reports/Chart</span>

<span class="text-emerald-400">created</span> <span class="text-zinc-300">app/Mesh/Reports/Chart.php</span>
<span class="text-emerald-400">created</span> <span class="text-zinc-300">resources/js/mesh/Reports/Chart/index.vue</span></code></pre>
                </div>
            </div>
        </div>
    </x-demo.section>

    <x-demo.section
        title="How ids are derived"
        description="Both sides reduce to the same short id string with no shared config: PHP strips the App\Mesh prefix and swaps backslashes for slashes; JS takes the folder path after resources/js/mesh and drops the trailing /index.vue. If the two strings match, the tag works.">
        <div class="space-y-6">
            <div class="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto_1fr] lg:items-center">
                <div class="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div class="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-1.5">PHP class</div>
                    <code class="text-sm font-mono text-zinc-400">App\Mesh\Forms\Input</code>
                </div>
                <div class="hidden lg:block text-zinc-600 text-xl px-1" aria-hidden="true">&rarr;</div>
                <div class="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-center">
                    <div class="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-1.5">Component id</div>
                    <code class="text-base font-mono font-semibold text-white">Forms/Input</code>
                </div>
                <div class="hidden lg:block text-zinc-600 text-xl px-1" aria-hidden="true">&larr;</div>
                <div class="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div class="text-[11px] font-medium uppercase tracking-widest text-zinc-500 mb-1.5">Frontend entry</div>
                    <code class="text-sm font-mono text-zinc-400">resources/js/mesh/Forms/Input/index.vue</code>
                </div>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
                <div class="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <h3 class="text-sm font-semibold tracking-tight text-white">Case-sensitive, on purpose</h3>
                    <p class="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                        Ids are matched byte-for-byte: <code class="font-mono text-zinc-300">Counter</code> maps to the
                        <code class="font-mono text-zinc-300">Counter/</code> folder, never <code class="font-mono text-zinc-300">counter/</code>.
                        macOS's case-insensitive filesystem can hide a mismatch that breaks on Linux — keep folder names
                        byte-identical to the StudlyCase class segments.
                    </p>
                </div>
                <div class="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <h3 class="text-sm font-semibold tracking-tight text-white">The extension picks the renderer</h3>
                    <ul class="mt-2 space-y-1.5 text-xs text-zinc-400">
                        <li class="flex items-center gap-2 text-white"><code class="font-mono font-semibold text-white w-20 shrink-0">.vue</code> <span aria-hidden="true">&rarr;</span> Vue <span class="text-[10px] font-medium uppercase tracking-widest text-zinc-500">this app</span></li>
                        <li class="flex items-center gap-2"><code class="font-mono text-zinc-300 w-20 shrink-0">.tsx / .jsx</code> <span aria-hidden="true">&rarr;</span> React</li>
                        <li class="flex items-center gap-2"><code class="font-mono text-zinc-300 w-20 shrink-0">.svelte</code> <span aria-hidden="true">&rarr;</span> Svelte</li>
                    </ul>
                    <p class="mt-2 text-xs text-zinc-500">An unknown extension throws at build time instead of silently guessing.</p>
                </div>
            </div>
        </div>
    </x-demo.section>
</div>
