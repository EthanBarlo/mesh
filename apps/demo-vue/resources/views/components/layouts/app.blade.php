<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-framework="{{ config('demo.framework') }}">
    <head>
        <x-demo.head :title="$title ?? null" />
    </head>
    <body class="shell shell--home">
        <a class="skip" href="#main">Skip to content</a>

        <x-nav.masthead />

        {{-- No sidebar on wide screens: the home page carries its own index. Phones still get the drawer. --}}
        <x-nav.sidebar drawer-only />

        <main id="main" class="shell__main sheet">
            {{ $slot }}
        </main>

        <x-demo.footer />

        @livewireScriptConfig
    </body>
</html>
