<?php

declare(strict_types=1);

use App\Mesh\TestComponent;
use Illuminate\Support\Facades\Blade;

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
    // rendered with a fragment marker — this lets the slot gain content on a later
    // server render — but there is no real content to forward as children.
    $html = Blade::render('<mesh:test-component></mesh:test-component>');

    expect($html)->toContain('data-mesh-slot="default"');

    $component = new TestComponent;
    $component->setId('test-id');

    expect($component->withSlots(['default' => ''])->meshSlots())->toBe([]);
});

it('renders both named and default slot holders', function () {
    $html = Blade::render('<mesh:test-component><livewire:slot name="title">T</livewire:slot>body</mesh:test-component>');

    expect($html)
        ->toContain('data-mesh-slot="title"')
        ->toContain('data-mesh-slot="default"')
        ->toContain('T')
        ->toContain('body');
});

it('returns real slot content from meshSlots()', function () {
    $component = new TestComponent;
    $component->setId('test-id');

    $slots = $component
        ->withSlots(['default' => 'hello'])
        ->meshSlots();

    expect($slots)->toBe(['default' => 'hello']);
});

it('skips placeholder slots in meshSlots()', function () {
    $slots = (new TestComponent)
        ->withPlaceholderSlots([
            ['name' => 'default', 'componentId' => 'x', 'parentId' => null],
        ])
        ->meshSlots();

    expect($slots)->toBe([]);
});

it('skips whitespace-only slots in meshSlots()', function () {
    $component = new TestComponent;
    $component->setId('test-id');

    $slots = $component
        ->withSlots(['default' => "  \n  "])
        ->meshSlots();

    expect($slots)->toBe([]);
});
