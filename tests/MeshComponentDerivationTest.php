<?php

declare(strict_types=1);

use App\Mesh\Counter;
use App\Mesh\Forms\Input;
use EthanBarlo\Mesh\Component;

it('derives a top-level component id from the class name', function () {
    expect((new Counter)->component())->toBe('Counter');
});

it('derives a nested component id from the class name', function () {
    expect((new Input)->component())->toBe('Forms/Input');
});

it('returns an empty props array by default', function () {
    expect((new Counter)->props())->toBe([]);
});

it('throws when the component lives outside the App\\Mesh namespace', function () {
    $component = new class extends Component {};

    expect(fn () => $component->component())->toThrow(LogicException::class);
});
