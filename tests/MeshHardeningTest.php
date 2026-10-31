<?php

declare(strict_types=1);

use App\Mesh\Counter;
use EthanBarlo\Mesh\Tests\Fixtures\PlainComponent;
use EthanBarlo\Mesh\Tests\Fixtures\TestComponent;
use EthanBarlo\Mesh\Tests\Fixtures\UnencodableComponent;
use Livewire\Exceptions\MethodNotFoundException;
use Livewire\Livewire;

it('refuses browser calls to props() and component() on mesh components', function (string $class, string $method) {
    expect(fn () => Livewire::test($class)->call($method))
        ->toThrow(MethodNotFoundException::class);
})->with([
    'Counter' => Counter::class,
    'TestComponent' => TestComponent::class,
])->with([
    'props',
    'component',
    // Livewire's own public-method check is case-sensitive and already refuses this; the
    // guard lowercases anyway because PHP method names are not, so it can't rely on that.
    'Props',
]);

it('still allows ordinary public actions on mesh components', function () {
    Livewire::test(TestComponent::class)
        ->call('rename', 'Mesh')
        ->assertSet('name', 'Mesh')
        ->assertSee('Hello Mesh');
});

it('leaves plain livewire components with the same method names alone', function () {
    Livewire::test(PlainComponent::class)
        ->call('props')
        ->call('component')
        ->assertSet('calls', 2);
});

it('throws when props cannot be json encoded', function (string $value) {
    $thrown = null;

    try {
        Livewire::test(UnencodableComponent::class, ['value' => $value]);
    } catch (Throwable $e) {
        $thrown = $e;
    }

    // Blade may wrap the JsonException in a ViewException; look down the chain.
    while ($thrown !== null && ! $thrown instanceof JsonException) {
        $thrown = $thrown->getPrevious();
    }

    expect($thrown)->toBeInstanceOf(JsonException::class);
})->with(['inf', 'invalid utf-8']);
