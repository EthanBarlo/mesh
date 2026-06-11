<?php

namespace App\Livewire;

use Livewire\Attributes\Modelable;
use Livewire\Component;

class CounterAlpine extends Component
{
    #[Modelable]
    public int $count = 0;

    public function render()
    {
        return view('livewire.counter-alpine');
    }
}
