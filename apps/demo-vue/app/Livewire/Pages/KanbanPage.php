<?php

namespace App\Livewire\Pages;

use Livewire\Attributes\Layout;
use Livewire\Attributes\Title;
use Livewire\Component;

#[Layout('components.layouts.demo')]
#[Title('Blade-Composed Kanban · Mesh Demo')]
class KanbanPage extends Component
{
    public function render()
    {
        return view('livewire.pages.kanban');
    }
}
