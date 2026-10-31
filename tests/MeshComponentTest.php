<?php

declare(strict_types=1);

use EthanBarlo\Mesh\Tests\Fixtures\TestComponent;
use Livewire\Livewire;

it('renders the mesh mount point with the component id', function () {
    Livewire::test(TestComponent::class)
        ->assertSeeHtml('data-mesh-component="Greeter"')
        ->assertSeeHtml('class="mesh-root"')
        ->assertSeeHtml('wire:ignore');
});

it('marks the mesh mount point x-ignore so Alpine skips the mirrored slot copy', function () {
    Livewire::test(TestComponent::class)
        ->assertSeeHtml('<div wire:ignore x-ignore class="mesh-root"');
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
