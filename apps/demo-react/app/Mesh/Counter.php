<?php

namespace App\Mesh;

use EthanBarlo\Mesh\MeshComponent;
use Livewire\Attributes\Modelable;

class Counter extends MeshComponent
{
    #[Modelable]
    public int $count = 0;

    public function props(): array
    {
        return [
            'initialCount' => $this->count,
        ];
    }
}
