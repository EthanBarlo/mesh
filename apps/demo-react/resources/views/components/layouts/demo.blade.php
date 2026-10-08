<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-framework="{{ config('demo.framework') }}">
    <head>
        <x-demo.head :title="$title ?? null" />
    </head>
    <body class="shell shell--demo">
        <a class="skip" href="#main">Skip to content</a>

        <x-nav.masthead />

        <div class="shell__frame">
            <x-nav.sidebar />

            <main id="main" class="shell__page">
                <div class="shell__sheet sheet">
                    {{ $slot }}

                    <x-demo.pager />
                    <x-demo.title-block />
                </div>
            </main>
        </div>

        @livewireScriptConfig
    </body>
</html>
