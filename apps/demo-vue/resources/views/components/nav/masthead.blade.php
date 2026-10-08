@use('App\View\DemoSheet')

@php
    $framework = config('demo.framework');
    $frameworks = array_keys(config('demo.demos', []));
    $active = array_search($framework, $frameworks, true);
@endphp

<header {{ $attributes->class(['mast']) }}>
    <div class="mast__inner">
        <button
            type="button"
            class="mast__menu"
            data-nav-toggle
            aria-controls="demo-nav"
            aria-expanded="false"
            aria-label="Sheet index"
        >
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
                <path class="mast__menu-open" d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" fill="none" stroke="currentColor" stroke-width="1.25" />
                <path class="mast__menu-close" d="M3.75 3.75l8.5 8.5M12.25 3.75l-8.5 8.5" fill="none" stroke="currentColor" stroke-width="1.25" />
            </svg>
        </button>

        <a href="{{ route('home') }}" class="mast__brand brand" aria-label="Mesh {{ config('demo.framework_name') }} demo, home">
            <span class="brand__mark" aria-hidden="true">MS</span>
            <span class="brand__name">Mesh</span>
            <span class="brand__rev">{{ config('demo.framework_name') }} demo</span>
        </a>

        <div class="mast__fw fw-switch">
            <p class="fw-switch__k k k--caps" id="mast-fw-label">
                Renderer
                <span class="fw-switch__ext">index.{{ config('demo.extension') }}</span>
            </p>
            <nav
                class="fw-switch__track"
                data-active="{{ $active === false ? 0 : $active }}"
                data-current="{{ $active === false ? 0 : $active }}"
                aria-labelledby="mast-fw-label"
            >
                @foreach ($frameworks as $i => $key)
                    <a
                        href="{{ DemoSheet::demoUrl($key) }}"
                        class="fw-switch__opt"
                        data-fw-index="{{ $i }}"
                        @if ($key === $framework) data-state="active" aria-current="page" @endif
                    >{{ ucfirst($key) }}</a>
                @endforeach
            </nav>
        </div>

        <div class="mast__tools">
            <a class="mast-link" href="{{ config('demo.docs_url') }}" target="_blank" rel="noreferrer">
                Docs
                <svg class="link__ext" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">
                    <path d="M4 2.5h5.5V8M9.5 2.5 3 9" fill="none" stroke="currentColor" stroke-width="1.25" />
                </svg>
            </a>
            <a class="mast-icon" href="{{ config('demo.github_url') }}" target="_blank" rel="noreferrer" aria-label="Mesh on GitHub">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
                    <path fill="currentColor" d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.08 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .32.21.69.82.57A12 12 0 0 0 12 .3" />
                </svg>
            </a>
            <x-nav.theme-toggle />
        </div>
    </div>
</header>
