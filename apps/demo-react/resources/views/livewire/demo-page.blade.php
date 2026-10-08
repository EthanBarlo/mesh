@use('App\View\DemoSheet')

@php
    $framework = config('demo.framework_name');
    $sheet = DemoSheet::current() ?? DemoSheet::at(1);
    $number = $sheet['number'] ?? 1;
    $pages = DemoSheet::all();
    $total = DemoSheet::pad(DemoSheet::total());
    $docs = rtrim(config('demo.docs_url'), '/');
    $siblings = collect(config('demo.demos', []))->except(config('demo.framework'));

    // The framework-specific copy lives here, so this view ports to the Vue and Svelte demos unchanged.
    [$ecosystem, $writeBody, $writeSnippet] = match (config('demo.framework')) {
        'vue' => ['composables, TypeScript and any npm library', 'A normal single-file component at index.vue.', '<script setup lang="ts">'],
        'svelte' => ['runes, TypeScript and any npm library', 'A normal single-file component at index.svelte.', '<script lang="ts">'],
        default => ['hooks, TypeScript and any npm library', 'A normal component, default-exported from index.tsx.', 'export default Counter;'],
    };

    $steps = [
        [
            'title' => 'Scaffold it',
            'body' => "One command writes both halves: the PHP class and the {$framework} entry file.",
            'file' => 'Terminal',
            'snippet' => 'php artisan make:mesh Counter',
            'prompt' => true,
        ],
        [
            'title' => 'Shape the props',
            'body' => "The Livewire class decides what {$framework} receives.",
            'file' => 'app/Mesh/Counter.php',
            'snippet' => 'public function props(): array',
        ],
        [
            'title' => "Write the {$framework}",
            'body' => $writeBody,
            'file' => 'resources/js/mesh/Counter/index.'.config('demo.extension'),
            'snippet' => $writeSnippet,
        ],
        [
            'title' => 'Drop it in Blade',
            'body' => 'Render it like any Livewire component, props and all.',
            'file' => 'Any Blade view',
            'snippet' => '<mesh:counter />',
        ],
    ];

    $arrow = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="M2.5 8h10.5M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.25" /></svg>';
    $ext = '<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false"><path d="M4 2.5h5.5V8M9.5 2.5 3 9" fill="none" stroke="currentColor" stroke-width="1.25" /></svg>';
@endphp

<div class="home">
    {{-- The fixed drawing frame: zone letters top and bottom, scale ticks down the sides. Decorative.
         While it exists, the shell insets the masthead, page and footer to sit inside it. --}}
    <div class="home__frame" aria-hidden="true">
        @foreach (['top', 'bottom'] as $side)
            <div class="home__rail home__rail--{{ $side }}">
                @foreach (['A', 'B', 'C', 'D', 'E', 'F'] as $zone)
                    <span>{{ $zone }}</span>
                @endforeach
            </div>
        @endforeach
        <div class="home__rail home__rail--left"></div>
        <div class="home__rail home__rail--right"></div>
        <div class="home__border"></div>
    </div>

    {{-- Title ------------------------------------------------------- --}}
    <section class="home-hero" aria-labelledby="home-title">
        <div class="home-wrap">
            <header class="sheet-head home-hero__head">
                <p class="sheet-head__no k k--caps">
                    Sheet {{ DemoSheet::pad($number) }} / {{ $total }} · {{ $sheet['group'] ?? 'Introduction' }}
                </p>
                <p class="sheet-head__meta k k--caps">
                    {{ DemoSheet::drawingNo($number) }} · Rev {{ config('demo.revision') }}
                </p>
                <span class="sheet-head__rule" aria-hidden="true"></span>
            </header>

            <div class="home-hero__grid">
                <div class="home-hero__text">
                    <p class="home-hero__kicker k k--caps">Live demo · {{ config('demo.framework_version') }} · Livewire 4</p>
                    <h1 class="home-hero__title" id="home-title">
                        {{ $framework }} components <span>in Livewire.</span>
                    </h1>
                    <p class="home-hero__lead">
                        The real {{ $framework }} ecosystem inside Livewire: {{ $ecosystem }}, running on
                        your Livewire component's state and methods.
                    </p>

                    <div class="home-hero__actions">
                        <a class="btn btn--solid" href="{{ route('state') }}">
                            Browse the demos
                            <span class="btn__icon btn__icon--right">{!! $arrow !!}</span>
                        </a>
                        <a class="btn btn--line" href="{{ $docs }}" target="_blank" rel="noreferrer">
                            Read the docs
                            <span class="btn__icon btn__icon--ext">{!! $ext !!}</span>
                        </a>
                        <a class="link link--mono" href="{{ config('demo.github_url') }}" target="_blank" rel="noreferrer">
                            GitHub
                            <span class="link__ext">{!! $ext !!}</span>
                        </a>
                    </div>
                </div>

                <div class="home-hero__notes">
                    <h2 class="notes__k k k--caps">General notes</h2>
                    <ol class="notes__list">
                        <li><span>Every island in this set is live, with its source beside it.</span></li>
                        <li>
                            <span>Livewire owns the state. The {{ $framework }} side reads and writes it through
                            props, entangled properties and <code>$wire</code>.</span>
                        </li>
                        <li>
                            <span>Each component is its own lazy chunk, so heavy libraries load only on the
                            sheets that use them.</span>
                        </li>
                        @if ($siblings->isNotEmpty())
                            <li>
                                <span>The same set is drawn for
                                @foreach ($siblings as $key => $url)
                                    <a class="link" href="{{ $url }}">{{ ucfirst($key) }}</a>{{ $loop->remaining > 1 ? ',' : ($loop->remaining === 1 ? ' and' : '.') }}
                                @endforeach
                                </span>
                            </li>
                        @endif
                    </ol>
                </div>
            </div>
        </div>
    </section>

    {{-- 01 · The three counters ---------------------------------------- --}}
    <section class="home-sec" id="counters" aria-labelledby="counters-title">
        <div class="home-wrap">
            <header class="sheet-head">
                <p class="sheet-head__no k k--caps">01</p>
                <h2 class="sheet-head__title" id="counters-title">One property, three frontends</h2>
                <p class="sheet-head__meta k">wire:model="count"</p>
                <span class="sheet-head__rule" aria-hidden="true"></span>
            </header>
            <p class="home-intro">
                This page has one Livewire property, <code>$count</code>. Three components bind to it with
                <code>wire:model</code>, and each draws it its own way. Press any button.
            </p>

            <figure class="cfig">
                <div class="fig__stage cfig__stage">
                    <div class="cfig__grid">
                        <p class="cfig__dim cfig__dim--server"><span class="cfig__dim-k">Server · on request</span></p>
                        <p class="cfig__dim cfig__dim--client"><span class="cfig__dim-k">Client store · no request</span></p>

                        <div class="cfig__cell cfig__cell--a">
                            {{-- A plain Livewire component, rendered with the standard <livewire:…> tag. --}}
                            <livewire:counter wire:model="count" />
                        </div>
                        <div class="cfig__cell cfig__cell--b">
                            {{-- A Livewire component with Alpine-managed client-side state via entangle. --}}
                            <livewire:counter-alpine wire:model="count" />
                        </div>
                        <div class="cfig__cell cfig__cell--c">
                            {{-- A Mesh component (framework frontend), rendered with the mesh tag. --}}
                            <mesh:counter wire:model="count" />
                        </div>
                    </div>
                </div>
                <figcaption class="fig-cap k">
                    <span class="fig-cap__n">Fig. 1 ·</span> Same Livewire property. Three frontends.
                </figcaption>
            </figure>

            <div class="cfig__why">
                <h3 class="notes__k k k--caps">Why <span class="ref">A</span> lags</h3>
                <ol class="notes__list">
                    <li>
                        <span><span class="ref">B</span> and <span class="ref">C</span> share Livewire's client-side
                        store. A click in either moves both, with no network request.</span>
                    </li>
                    <li>
                        <span><span class="ref">A</span> is rendered on the server, so it shows what the server
                        knows. It holds still until a request.</span>
                    </li>
                    <li>
                        <span>Press <span class="ref">A</span>'s buttons: the pending change rides along with that
                        request, the server catches up, and all three agree.</span>
                    </li>
                </ol>
            </div>
        </div>
    </section>

    {{-- 02 · How it works ---------------------------------------------- --}}
    <section class="home-sec" id="how" aria-labelledby="how-title">
        <div class="home-wrap">
            <header class="sheet-head">
                <p class="sheet-head__no k k--caps">02</p>
                <h2 class="sheet-head__title" id="how-title">How it works</h2>
                <p class="sheet-head__meta k k--caps">4 steps · make:mesh</p>
                <span class="sheet-head__rule" aria-hidden="true"></span>
            </header>
            <p class="home-intro">Four steps from nothing to a {{ $framework }} component inside Livewire.</p>

            <ol class="hsteps">
                @foreach ($steps as $i => $step)
                    <li class="hstep">
                        <span class="hstep__n balloon" aria-hidden="true">{{ DemoSheet::pad($i + 1) }}</span>
                        <h3 class="hstep__title"><span class="vh">Step {{ $i + 1 }}: </span>{{ $step['title'] }}</h3>
                        <p class="hstep__body">{{ $step['body'] }}</p>
                        <figure class="hstep__code">
                            <figcaption class="hstep__file">{{ $step['file'] }}</figcaption>
                            <code class="hstep__snippet">@if (! empty($step['prompt']))<span class="hstep__prompt" aria-hidden="true">$ </span>@endif{{ $step['snippet'] }}</code>
                        </figure>
                    </li>
                @endforeach
            </ol>

            <p class="home-sec__next">
                <a class="link link--mono" href="{{ $docs }}/docs/quickstart" target="_blank" rel="noreferrer">
                    Read the quickstart
                    <span class="link__ext">{!! $ext !!}</span>
                </a>
            </p>
        </div>
    </section>

    {{-- 03 · Drawing register ------------------------------------------ --}}
    <section class="home-sec" id="register" aria-labelledby="register-title">
        <div class="home-wrap">
            <header class="sheet-head">
                <p class="sheet-head__no k k--caps">03</p>
                <h2 class="sheet-head__title" id="register-title">Drawing register</h2>
                <p class="sheet-head__meta k k--caps">
                    {{ $total }} sheets
                    @if (count($pages) > 0)
                        · {{ DemoSheet::drawingNo(1) }}–{{ DemoSheet::drawingNo(count($pages)) }}
                    @endif
                </p>
                <span class="sheet-head__rule" aria-hidden="true"></span>
            </header>
            <p class="home-intro">Every sheet in the set. Each one is a working demo with its full source beside it.</p>

            <div class="reg">
                <div class="reg__head" aria-hidden="true">
                    <span>Sheet</span>
                    <span>Title</span>
                    <span class="reg__col">Section</span>
                    <span class="reg__col">Dwg no.</span>
                    <span></span>
                </div>
                <ol class="reg__list">
                    @foreach ($pages as $page)
                        @php
                            $isCurrent = $page['number'] === $number;
                            $tag = $isCurrent ? 'div' : 'a';
                        @endphp
                        <li>
                            <{{ $tag }}
                                @class(['reg__row', 'is-current' => $isCurrent])
                                @if ($isCurrent) aria-current="page" @else href="{{ route($page['route']) }}" @endif
                            >
                                <span class="reg__no">{{ DemoSheet::pad($page['number']) }}</span>
                                <span class="reg__main">
                                    <span class="reg__title">{{ $page['label'] }}</span>
                                    <span class="reg__blurb">{{ DemoSheet::inlineCode($page['blurb']) }}</span>
                                    <span class="reg__meta">{{ $page['group'] }} · {{ DemoSheet::drawingNo($page['number']) }}</span>
                                </span>
                                <span class="reg__col reg__group">{{ $page['group'] }}</span>
                                <span class="reg__col reg__dwg">{{ DemoSheet::drawingNo($page['number']) }}</span>
                                <span class="reg__go">
                                    @if ($isCurrent)
                                        <span class="reg__here" aria-hidden="true"></span>
                                        <span class="vh">This sheet</span>
                                    @else
                                        {!! $arrow !!}
                                    @endif
                                </span>
                            </{{ $tag }}>
                        </li>
                    @endforeach
                </ol>
            </div>

            <x-demo.title-block class="home-tblock" />
        </div>
    </section>
</div>
