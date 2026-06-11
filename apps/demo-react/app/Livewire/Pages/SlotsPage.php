<?php

namespace App\Livewire\Pages;

use Livewire\Attributes\Layout;
use Livewire\Attributes\Title;
use Livewire\Component;

#[Layout('components.layouts.demo')]
#[Title('Slots · Mesh Demo')]
class SlotsPage extends Component
{
    public string $name = 'world';

    public function render()
    {
        return view('livewire.pages.slots');
    }
}
