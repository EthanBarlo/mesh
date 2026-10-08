@use('App\View\DemoSheet')

@props(['title', 'description' => null])

@php
    $sheet = DemoSheet::current();
    $total = DemoSheet::pad(DemoSheet::total());
@endphp

<header {{ $attributes->class(['dhead']) }}>
    <div class="sheet-head">
        <p class="sheet-head__no k k--caps">
            @if ($sheet)
                Sheet {{ DemoSheet::pad($sheet['number']) }} / {{ $total }} · {{ $sheet['group'] }}
            @else
                Sheet — / {{ $total }}
            @endif
        </p>
        <h1 class="sheet-head__title">{{ $title }}</h1>
        <p class="sheet-head__meta k k--caps">
            {{ $sheet ? DemoSheet::drawingNo($sheet['number']) : config('demo.drawing_prefix').'00' }}
            <br>
            Rev {{ config('demo.revision') }}
        </p>
        <span class="sheet-head__rule" aria-hidden="true"></span>
    </div>

    @if ($description)
        <p class="dhead__lead">{{ DemoSheet::inlineCode($description) }}</p>
    @endif

    {{ $slot }}
</header>
