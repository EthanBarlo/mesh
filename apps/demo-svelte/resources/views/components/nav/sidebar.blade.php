@use('App\View\DemoSheet')

@props(['drawerOnly' => false])

@php
    $current = DemoSheet::current();
    $ext = '<svg class="link__ext" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false"><path d="M4 2.5h5.5V8M9.5 2.5 3 9" fill="none" stroke="currentColor" stroke-width="1.25" /></svg>';
@endphp

{{-- Phones and tablets: the sidebar is a drawer under the masthead; this tracing-paper scrim closes it. --}}
<div class="side-scrim" data-nav-close aria-hidden="true"></div>

<aside
    id="demo-nav"
    @class(['side', 'side--drawer-only' => $drawerOnly])
    aria-label="Sheet index"
>
    <nav class="side__nav" aria-label="Demos">
        <p class="side__head k k--caps">
            <span>Drawing register</span>
            <span class="side__count">{{ DemoSheet::pad(DemoSheet::total()) }} sheets</span>
        </p>

        @foreach (DemoSheet::groups() as $group => $pages)
            <div class="side__group">
                <p class="side__sep">{{ $group }}</p>
                <ul class="side__list">
                    @foreach ($pages as $page)
                        @php $active = $current && $current['route'] === $page['route']; @endphp
                        <li>
                            <a
                                href="{{ route($page['route']) }}"
                                class="side__item"
                                @if ($active) aria-current="page" @endif
                            >
                                <span class="side__no">{{ DemoSheet::pad($page['number']) }}</span>
                                <span class="side__label">{{ $page['label'] }}</span>
                            </a>
                        </li>
                    @endforeach
                </ul>
            </div>
        @endforeach
    </nav>

    <div class="side__foot">
        {{-- The masthead carries these on wide screens; phones get them here. --}}
        <div class="side__tools">
            <ul class="side__links">
                <li>
                    <a class="link link--mono" href="{{ config('demo.docs_url') }}" target="_blank" rel="noreferrer">Docs {!! $ext !!}</a>
                </li>
                <li>
                    <a class="link link--mono" href="{{ config('demo.github_url') }}" target="_blank" rel="noreferrer">GitHub {!! $ext !!}</a>
                </li>
            </ul>
            <div class="side__theme">
                <span class="k k--caps">Sheet colour</span>
                <x-nav.theme-toggle />
            </div>
        </div>

        <p class="side__stamp k k--caps">
            {{ config('demo.framework_version') }} · Rev {{ config('demo.revision') }}
        </p>
    </div>
</aside>
