@use('App\View\DemoSheet')

@php
    $sheet = DemoSheet::current();
    $prev = $sheet ? DemoSheet::at($sheet['number'] - 1) : null;
    $next = $sheet ? DemoSheet::at($sheet['number'] + 1) : null;
@endphp

@if ($prev || $next)
    <nav {{ $attributes->class(['pager']) }} aria-label="Previous and next sheets">
        @if ($prev)
            <a class="pager__link pager__link--prev" href="{{ route($prev['route']) }}" rel="prev">
                <span class="pager__k k k--caps"><span aria-hidden="true">←</span> Sheet {{ DemoSheet::pad($prev['number']) }}</span>
                <span class="pager__title">{{ $prev['label'] }}</span>
            </a>
        @endif
        @if ($next)
            <a class="pager__link pager__link--next" href="{{ route($next['route']) }}" rel="next">
                <span class="pager__k k k--caps">Sheet {{ DemoSheet::pad($next['number']) }} <span aria-hidden="true">→</span></span>
                <span class="pager__title">{{ $next['label'] }}</span>
            </a>
        @endif
    </nav>
@endif
