<?php

namespace App\Mesh;

use EthanBarlo\Mesh\Component;
use Livewire\Attributes\Modelable;

class Counter extends Component
{
    #[Modelable]
    public int $count = 0;

    public int $initialCount = 0;

    public function mount(): void
    {
        // Captured once — props() runs on every render, so returning
        // $this->count there would make Reset a no-op.
        $this->initialCount = $this->count;
    }

    public function props(): array
    {
        return [
            'initialCount' => $this->initialCount,
        ];
    }
}
