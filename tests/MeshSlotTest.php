<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Blade;
use Livewire\Mechanisms\HandleComponents\HandleComponents;

it('renders the default slot into a hidden holder', function () {
    $html = Blade::render('<mesh:test-component>inner</mesh:test-component>');

    expect($html)
        ->toContain('data-mesh-slots')
        ->toContain('data-mesh-slot="default"')
        ->toContain('inner');
});

it('preserves slot markup without double-escaping it', function () {
    $html = Blade::render('<mesh:test-component>Hello <strong>x</strong></mesh:test-component>');

    expect(html_entity_decode($html))
        ->toContain('Hello <strong>x</strong>');
});

it('renders no slots wrapper for a self-closing tag', function () {
    $html = Blade::render('<mesh:test-component />');

    expect($html)->not->toContain('data-mesh-slots');
});

it('still renders a default holder for an empty body so it can gain content later', function () {
    // Livewire captures an (empty) default slot for a paired tag, so the holder is
    // rendered with its fragment markers. That lets the slot gain content on a later
    // server render; the JS side leaves an empty default slot out of `children`.
    $html = Blade::render('<mesh:test-component></mesh:test-component>');

    expect($html)
        ->toContain('data-mesh-slot="default"')
        ->toContain('FRAGMENT:name=default|type=slot');
});

it('renders a holder for a whitespace-only default slot too', function () {
    // A tag with only named slots still has a whitespace-only default slot (the
    // indentation between them). The holder is kept for morphing; dropping it is
    // the JS side's job, which re-checks on every slot update.
    $html = Blade::render(<<<'BLADE'
        <mesh:test-component>
            <livewire:slot name="title">T</livewire:slot>
        </mesh:test-component>
        BLADE);

    expect($html)
        ->toContain('data-mesh-slot="title"')
        ->toContain('data-mesh-slot="default"');
});

it('renders both named and default slot holders', function () {
    $html = Blade::render('<mesh:test-component><livewire:slot name="title">T</livewire:slot>body</mesh:test-component>');

    expect($html)
        ->toContain('data-mesh-slot="title"')
        ->toContain('data-mesh-slot="default"')
        ->toContain('T')
        ->toContain('body');
});

it('keeps the holders, as skip markers, on the component\'s own re-render', function () {
    // On a self-render Livewire swaps the slots for placeholders. The holders must
    // still render, or the morph would drop the slot content already in the page.
    $html = Blade::render('<mesh:test-component>inner</mesh:test-component>');

    preg_match('/wire:snapshot="([^"]+)"/', $html, $matches);
    $snapshot = json_decode(htmlspecialchars_decode($matches[1]), true);

    [, $effects] = app(HandleComponents::class)->update($snapshot, [], []);

    expect($effects['html'])
        ->toContain('data-mesh-slot="default"')
        ->toContain('mode=skip')
        ->not->toContain('inner');
});
