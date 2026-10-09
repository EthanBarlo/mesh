<?php

declare(strict_types=1);

use App\Mesh\TestComponent;
use Illuminate\Support\Facades\Blade;

it('rewrites <mesh:...> tags into namespaced livewire mounts', function () {
    $compiled = Blade::compileString('<mesh:test-component :name="$name" />');

    expect($compiled)
        ->toContain("'mesh::test-component'")
        ->toContain("'name' =>");
});

it('rewrites the hyphen variant and paired closing tags', function () {
    $compiled = Blade::compileString('<mesh-test-component></mesh-test-component>');

    expect($compiled)
        ->toContain("'mesh::test-component'")
        ->not->toContain('<mesh-test-component')
        ->not->toContain('</mesh-test-component>');
});

it('rewrites the hyphen variant of a nested class name', function () {
    $compiled = Blade::compileString('<mesh-forms.input />');

    expect($compiled)->toContain("'mesh::forms.input'");
});

it('leaves custom elements with a mesh- prefix untouched when no component matches', function () {
    $markup = '<mesh-gradient colors="cyan magenta"><span>Hi</span></mesh-gradient>';

    expect(Blade::compileString($markup))->toBe($markup);
    expect(Blade::render($markup))->toBe($markup);
});

it('only rewrites the hyphen tags that name a component when both appear', function () {
    $compiled = Blade::compileString(
        '<mesh-gradient><mesh-test-component /></mesh-gradient><mesh-gradient />'
    );

    expect($compiled)
        ->toStartWith('<mesh-gradient>')
        ->toContain("'mesh::test-component'")
        ->toContain('</mesh-gradient><mesh-gradient />')
        ->not->toContain('mesh::gradient');
});

it('always rewrites the colon form, even when no component matches', function () {
    $compiled = Blade::compileString('<mesh:gradient />');

    expect($compiled)->toContain("'mesh::gradient'");
});

it('resolves the mesh:: namespace to the configured class namespace', function () {
    expect(app('livewire.finder')->resolveClassComponentClassName('mesh::test-component'))
        ->toBe(TestComponent::class);
});

it('mounts the resolved App\\Mesh class via the mesh tag', function () {
    $html = Blade::render('<mesh:test-component name="Ethan" />');

    expect($html)
        ->toContain('data-mesh-component="TestComponent"')
        ->toContain('class="mesh-root"')
        ->toContain('Hello Ethan');
});

it('leaves native <livewire:...> tags untouched', function () {
    $compiled = Blade::compileString('<livewire:some-component />');

    expect($compiled)
        ->toContain("'some-component'")
        ->not->toContain('mesh::some-component');
});

it('does not treat <mesh:styles> as the livewire styles helper', function () {
    $compiled = Blade::compileString('<mesh:styles />');

    expect($compiled)
        ->toContain('mesh::styles')
        ->not->toContain('@livewireStyles');
});
