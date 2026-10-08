@props([
    'tone' => 'ink',
    'title' => null,
    'label' => null,
])

{{-- A note on the sheet, after the docs <Callout>: ink = Note (box), accent = Caution (triangle), blue = Tip (circle). --}}
@php
    $tone = in_array($tone, ['ink', 'accent', 'blue'], true) ? $tone : 'ink';
    $label ??= ['ink' => 'Note', 'accent' => 'Caution', 'blue' => 'Tip'][$tone];
@endphp

<aside {{ $attributes->class(['note']) }} data-tone="{{ $tone }}">
    <span class="note__mark">
        @if ($tone === 'accent')
            <svg viewBox="0 0 28 26" width="22" height="20" aria-hidden="true" focusable="false">
                <path d="M14 2 26 24H2Z" fill="none" stroke="currentColor" stroke-width="1.25" />
                <text x="14" y="20" text-anchor="middle" font-family="var(--font-mono)" font-size="11" fill="currentColor">!</text>
            </svg>
        @elseif ($tone === 'blue')
            <svg viewBox="0 0 22 22" width="20" height="20" aria-hidden="true" focusable="false">
                <circle cx="11" cy="11" r="9.5" fill="none" stroke="currentColor" stroke-width="1.25" />
                <path d="M11 6.5v9M6.5 11h9" stroke="currentColor" stroke-width="1.25" />
            </svg>
        @else
            <svg viewBox="0 0 22 22" width="20" height="20" aria-hidden="true" focusable="false">
                <rect x="1.5" y="1.5" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.25" />
                <path d="M11 9.5v7" stroke="currentColor" stroke-width="1.5" />
                <circle cx="11" cy="6.25" r="1.1" fill="currentColor" />
            </svg>
        @endif
    </span>
    <div class="note__body">
        <p class="note__k k k--caps">
            {{ $label }}
            @if ($title)
                <span class="note__title">{{ $title }}</span>
            @endif
        </p>
        <div class="note__content">{{ $slot }}</div>
    </div>
</aside>
