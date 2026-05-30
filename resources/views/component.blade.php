@php
    $meshComponentPath = $this->component();

    // Resolve the built asset URL so the frontend can lazily import it. When Vite
    // can't resolve it (e.g. no dev server / manifest), fall back to null and let
    // the consuming app's bundling handle registration.
    try {
        $meshAssetUrl = app(\Illuminate\Foundation\Vite::class)->asset($meshComponentPath);
    } catch (\Throwable $e) {
        $meshAssetUrl = null;
    }
@endphp

<div
    data-mesh-component="{{ $meshComponentPath }}"
    data-mesh-props="{{ json_encode($this->props()) }}"
    @if ($meshAssetUrl) data-mesh-asset="{{ $meshAssetUrl }}" @endif
>
    <div wire:ignore class="mesh-root"></div>
</div>
