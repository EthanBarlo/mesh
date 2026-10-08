@use('App\View\DemoSheet')

@php
    $sheet = DemoSheet::current();
@endphp

@if ($sheet)
    <dl {{ $attributes->class(['tblock', 'dtb']) }} aria-label="Title block">
        <div class="tb tb--title">
            <dt>Title</dt>
            <dd>{{ $sheet['label'] }}</dd>
        </div>
        <div class="tb tb--half">
            <dt>Section</dt>
            <dd>{{ $sheet['group'] }}</dd>
        </div>
        <div class="tb tb--half">
            <dt>Package</dt>
            <dd>{{ config('demo.package') }}</dd>
        </div>
        <div class="tb tb--sm">
            <dt>Framework</dt>
            <dd>{{ config('demo.framework_version') }}</dd>
        </div>
        <div class="tb tb--sm">
            <dt>Dwg no.</dt>
            <dd>{{ DemoSheet::drawingNo($sheet['number']) }}</dd>
        </div>
        <div class="tb tb--sm">
            <dt>Sheet</dt>
            <dd>{{ DemoSheet::pad($sheet['number']) }} of {{ DemoSheet::pad(DemoSheet::total()) }}</dd>
        </div>
        <div class="tb tb--sm">
            <dt>Rev</dt>
            <dd>{{ config('demo.revision') }}</dd>
        </div>
        <div class="tb tb--sm">
            <dt>Format</dt>
            <dd>Blade + .{{ config('demo.extension') }}</dd>
        </div>
        <div class="tb tb--sm">
            <dt>Source</dt>
            <dd><a href="{{ DemoSheet::sourceUrl($sheet['view']) }}" target="_blank" rel="noreferrer noopener">View ↗</a></dd>
        </div>
    </dl>
@endif
