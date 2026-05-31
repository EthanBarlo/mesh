<?php

namespace App\Mesh;

use EthanBarlo\Mesh\Component;
use Livewire\Attributes\Modelable;

class Counter extends Component
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
