<?php

namespace App\Mesh;

use EthanBarlo\Mesh\MeshComponent;
use Livewire\Attributes\Modelable;

class ReactCounter extends MeshComponent
{
    #[Modelable]
    public int $count = 0;

    public function component(): string
    {
        return 'resources/js/components/Counter.tsx';
    }

    public function props(): array
    {
        return [
            'initialCount' => $this->count,
        ];
    }
}
