<?php

namespace App\Livewire\Pages;

use Livewire\Attributes\Layout;
use Livewire\Attributes\Title;
use Livewire\Component;

#[Layout('components.layouts.demo')]
#[Title('Forms & Validation · Mesh Demo')]
class FormsPage extends Component
{
    public function render()
    {
        return view('livewire.pages.forms');
    }
}
