<?php

namespace EthanBarlo\Mesh;

use Illuminate\Contracts\View\Factory as ViewFactory;
use Illuminate\Contracts\View\View;
use Livewire\Component as LivewireComponent;

abstract class MeshComponent extends LivewireComponent
{
    /**
     * The frontend component to render, identified by its build path
     * (e.g. 'resources/js/mesh/Counter/index.ts').
     */
    abstract public function component(): string;

    /**
     * The props passed to the frontend component. Must be JSON-serializable.
     *
     * @return array<string, mixed>
     */
    abstract public function props(): array;

    public function render(): View
    {
        return app(ViewFactory::class)->make('mesh::component');
    }
}
