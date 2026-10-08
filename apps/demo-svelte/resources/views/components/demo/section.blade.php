@use('App\View\DemoSheet')
@use('Illuminate\Support\Str')

@props([
    'title',
    'description' => null,
    'files' => [],
    'caption' => null,
    'live' => true,
])

{{--
    One numbered part of the sheet: a ruled heading (01, 02… from the .sheet
    counter), the description, the live island on a gridded figure stage with
    an auto-numbered caption, then its source.
--}}
<section {{ $attributes->merge(['id' => Str::slug($title)])->class(['dsec']) }}>
    <h2 class="dsec__title">{{ $title }}</h2>

    @if ($description)
        <p class="dsec__desc">{{ DemoSheet::inlineCode($description) }}</p>
    @endif

    <figure class="fig dsec__fig">
        <div class="fig__stage dsec__stage">
            {{ $slot }}
        </div>
        <figcaption class="fig-cap k dsec__cap">
            <span class="dsec__cap-text">{{ $caption ?? $title }}</span>
            @if ($live)
                <span class="dsec__live k--caps"><span class="dsec__dot" aria-hidden="true"></span>Live</span>
            @endif
        </figcaption>
    </figure>

    @if (count($files))
        <x-code-viewer :files="$files" class="dsec__code" />
    @endif
</section>
