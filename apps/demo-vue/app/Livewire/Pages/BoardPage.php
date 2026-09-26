<?php

namespace App\Livewire\Pages;

use Livewire\Attributes\Layout;
use Livewire\Attributes\Title;
use Livewire\Component;

#[Layout('components.layouts.demo')]
#[Title('Drag & Drop Board · Mesh Demo')]
class BoardPage extends Component
{
    public function render()
    {
        return view('livewire.pages.board');
    }
}
