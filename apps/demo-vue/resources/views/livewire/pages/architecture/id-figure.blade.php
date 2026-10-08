{{--
    Drafting figure: how the PHP class and the frontend entry reduce to the
    same component id. Strings are laid out in 12px IBM Plex Mono (one
    character advances 7.2 units), so the geometry follows the extension
    configured for this demo (.tsx / .vue / .svelte) without hand-tuning.
--}}
@php
    $framework = config('demo.framework', 'react');
    $ext = '.'.config('demo.extension', 'tsx');
    $cw = 7.2;

    $layout = function (array $segments, float $x) use ($cw): array {
        $out = [];
        foreach ($segments as [$text, $kept]) {
            $width = mb_strlen($text) * $cw;
            $out[] = ['text' => $text, 'kept' => $kept, 'start' => $x, 'end' => $x + $width];
            $x += $width;
        }

        return $out;
    };

    $classSegments = [['App\\Mesh\\', false], ['Forms\\Input', true]];
    $entrySegments = [['resources/js/mesh/', false], ['Forms/Input', true], ['/index', false], [$ext, false]];

    $arrow = fn (float $x, float $y, int $angle, string $class = 'derive__arrow') => sprintf(
        '<path class="%s" d="M0 0L-7 -3L-7 3Z" transform="translate(%s %s) rotate(%d)" />',
        $class, round($x, 1), round($y, 1), $angle,
    );

    $label = 'How the component id is derived. The PHP class App\\Mesh\\Forms\\Input drops the App\\Mesh\\ prefix and turns '
        .'backslashes into slashes. The frontend entry resources/js/mesh/Forms/Input/index'.$ext.' keeps the path after '
        .'resources/js/mesh/ and drops /index and the extension. Both give Forms/Input. The '.$ext.' extension selects the '
        .$framework.' renderer.';
@endphp

@php
    /* Wide drawing (640 units) */
    $x0 = 150;
    $class = $layout($classSegments, $x0);
    $entry = $layout($entrySegments, $x0);
    $classEnd = end($class)['end'];
    $entryEnd = end($entry)['end'];
    $extMid = ($entry[3]['start'] + $entry[3]['end']) / 2;
    $junction = max(470, $entryEnd + 24);
    $boxX = $junction + 16;
    $boxW = 138;
    $wideW = $boxX + $boxW + 16;
@endphp

@php
    /* Narrow drawing (340+ units) */
    $nx0 = 16;
    $nClass = $layout($classSegments, $nx0);
    $nEntry = $layout($entrySegments, $nx0);
    $nClassEnd = end($nClass)['end'];
    $nEntryEnd = end($nEntry)['end'];
    $nExtMid = ($nEntry[3]['start'] + $nEntry[3]['end']) / 2;
    $rail = max(326, $nEntryEnd + 16);
    $narrowW = $rail + 14;
@endphp

<div class="derive">
    {{-- Wide --}}
    <div class="derive__wide">
        <svg viewBox="0 0 {{ round($wideW) }} 200" role="img" aria-label="{{ $label }}" data-draw>
            @foreach ([[$class, 44, 'PHP CLASS', 'strip App\Mesh\ · \ becomes /'], [$entry, 124, 'FRONTEND ENTRY', 'strip prefix, /index, extension']] as [$segments, $y, $rowLabel, $rowNote])
                <text class="svg-k svg-k--dim" x="16" y="{{ $y }}">{{ $rowLabel }}</text>
                @foreach ($segments as $seg)
                    <text @class(['derive__str', 'derive__str--dim' => ! $seg['kept']]) x="{{ round($seg['start'], 1) }}" y="{{ $y }}">{{ $seg['text'] }}</text>
                    @if ($seg['kept'])
                        <path class="ln" d="M{{ round($seg['start'], 1) }} {{ $y + 6 }}V{{ $y + 10 }}H{{ round($seg['end'], 1) }}V{{ $y + 6 }}" />
                    @else
                        <path class="ln ln--fine" d="M{{ round($seg['start'], 1) }} {{ $y - 4 }}H{{ round($seg['end'], 1) }}" />
                    @endif
                @endforeach
                <text class="svg-k svg-k--dim" x="{{ $x0 }}" y="{{ $y + 26 }}">{{ $rowNote }}</text>
            @endforeach

            {{-- Both halves arrive at the same id --}}
            <path class="ln" d="M{{ round($classEnd + 8, 1) }} 40H{{ $junction }}V120H{{ round($entryEnd + 8, 1) }}M{{ $junction }} 80H{{ $boxX - 7 }}" />
            <circle class="fill-ink" cx="{{ $junction }}" cy="80" r="2.5" />
            {!! $arrow($boxX, 80, 0) !!}

            <rect class="derive__box" x="{{ $boxX }}" y="60" width="{{ $boxW }}" height="40" />
            <rect class="derive__bg" x="{{ $boxX + 8 }}" y="54" width="24" height="12" />
            <text class="svg-k" x="{{ $boxX + 13 }}" y="63.4">ID</text>
            <text class="derive__id" x="{{ $boxX + $boxW / 2 }}" y="84.5" text-anchor="middle">Forms/Input</text>

            {{-- The extension picks the renderer --}}
            <path class="ln ln--fine" d="M{{ round($extMid, 1) }} 131V180H{{ $boxX - 7 }}" />
            {!! $arrow($boxX, 180, 0, 'derive__arrow--fine') !!}
            <text class="svg-k" x="{{ $boxX + 6 }}" y="183.4">RENDERER · {{ $framework }}</text>
        </svg>
    </div>

    {{-- Narrow --}}
    <div class="derive__narrow">
        <svg viewBox="0 0 {{ round($narrowW) }} 264" role="img" aria-label="{{ $label }}" data-draw>
            @foreach ([[$nClass, 16, 38, 'PHP CLASS', 'strip App\Mesh\ · \ becomes /'], [$nEntry, 96, 118, 'FRONTEND ENTRY', 'strip prefix, /index, extension']] as [$segments, $ly, $y, $rowLabel, $rowNote])
                <text class="svg-k svg-k--dim" x="{{ $nx0 }}" y="{{ $ly }}">{{ $rowLabel }}</text>
                @foreach ($segments as $seg)
                    <text @class(['derive__str', 'derive__str--dim' => ! $seg['kept']]) x="{{ round($seg['start'], 1) }}" y="{{ $y }}">{{ $seg['text'] }}</text>
                    @if ($seg['kept'])
                        <path class="ln" d="M{{ round($seg['start'], 1) }} {{ $y + 6 }}V{{ $y + 10 }}H{{ round($seg['end'], 1) }}V{{ $y + 6 }}" />
                    @else
                        <path class="ln ln--fine" d="M{{ round($seg['start'], 1) }} {{ $y - 4 }}H{{ round($seg['end'], 1) }}" />
                    @endif
                @endforeach
                <text class="svg-k svg-k--dim" x="{{ $nx0 }}" y="{{ $y + 24 }}">{{ $rowNote }}</text>
            @endforeach

            {{-- Both halves run down the rail into the id --}}
            <path class="ln" d="M{{ round($nClassEnd + 8, 1) }} 34H{{ round($rail, 1) }}V232H251M{{ round($nEntryEnd + 8, 1) }} 114H{{ round($rail, 1) }}" />
            <circle class="fill-ink" cx="{{ round($rail, 1) }}" cy="114" r="2.5" />
            {!! $arrow(244, 232, 180) !!}

            <rect class="derive__box" x="96" y="212" width="148" height="40" />
            <rect class="derive__bg" x="104" y="206" width="24" height="12" />
            <text class="svg-k" x="109" y="215.4">ID</text>
            <text class="derive__id" x="170" y="236.5" text-anchor="middle">Forms/Input</text>

            {{-- The extension picks the renderer --}}
            <path class="ln ln--fine" d="M{{ round($nExtMid, 1) }} 125V172" />
            {!! $arrow($nExtMid, 178, 90, 'derive__arrow--fine') !!}
            <text class="svg-k" x="{{ round($nExtMid + 6, 1) }}" y="194" text-anchor="end">RENDERER · {{ $framework }}</text>
        </svg>
    </div>
</div>
