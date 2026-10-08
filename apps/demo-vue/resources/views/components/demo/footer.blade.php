@use('App\View\DemoSheet')

@php
    $ext = '<svg class="link__ext" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false"><path d="M4 2.5h5.5V8M9.5 2.5 3 9" fill="none" stroke="currentColor" stroke-width="1.25" /></svg>';
@endphp

{{-- The end-of-set strip, after the docs home footer. --}}
<footer {{ $attributes->class(['foot']) }}>
    <div class="foot__inner">
        <p class="foot__id">
            Mesh · {{ config('demo.framework_name') }} demo · {{ config('demo.drawing_prefix') }}00 · Rev {{ config('demo.revision') }} · MIT
        </p>
        <ul class="foot__links">
            <li>
                <a class="link link--mono" href="{{ config('demo.docs_url') }}" target="_blank" rel="noreferrer">Docs {!! $ext !!}</a>
            </li>
            <li>
                <a class="link link--mono" href="{{ config('demo.github_url') }}" target="_blank" rel="noreferrer">GitHub {!! $ext !!}</a>
            </li>
            <li>
                <a class="link link--mono" href="{{ rtrim(config('demo.github_url'), '/') }}/blob/{{ config('demo.github_branch', 'main') }}/CHANGELOG.md" target="_blank" rel="noreferrer">Changelog {!! $ext !!}</a>
            </li>
        </ul>
        <p class="foot__by">
            {{ config('demo.framework_version') }} · {{ DemoSheet::pad(DemoSheet::total()) }} sheets · Drawn by
            <a class="link" href="https://ebarlow.dev" target="_blank" rel="noreferrer">Ethan Barlow</a>
        </p>
    </div>
</footer>
