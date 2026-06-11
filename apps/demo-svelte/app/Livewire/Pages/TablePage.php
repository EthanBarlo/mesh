<?php

namespace App\Livewire\Pages;

use Livewire\Attributes\Layout;
use Livewire\Attributes\Title;
use Livewire\Component;

#[Layout('components.layouts.demo')]
#[Title('Data Table · Mesh Demo')]
class TablePage extends Component
{
    public function render()
    {
        return view('livewire.pages.table');
    }
}
