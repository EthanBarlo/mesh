<?php

use EthanBarlo\Mesh\Tests\Fixtures\TestComponent;
use Livewire\Livewire;

it('renders the mesh mount point with the component path', function () {
    Livewire::test(TestComponent::class)
        ->assertSeeHtml('data-mesh-component="resources/js/components/Greeter.tsx"')
        ->assertSeeHtml('class="mesh-root"')
        ->assertSeeHtml('wire:ignore');
});

it('serializes props into the data-mesh-props attribute', function () {
    Livewire::test(TestComponent::class, ['name' => 'Ethan'])
        ->assertSee('data-mesh-props')
        ->assertSee('Hello Ethan');
});

it('updates serialized props when state changes', function () {
    Livewire::test(TestComponent::class)
        ->assertSee('Hello world')
        ->set('name', 'Mesh')
        ->assertSee('Hello Mesh');
});
