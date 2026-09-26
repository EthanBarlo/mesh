<?php

namespace App\Livewire\Pages;

use Livewire\Attributes\Layout;
use Livewire\Attributes\Title;
use Livewire\Component;

#[Layout('components.layouts.demo')]
#[Title('Live Charts · Mesh Demo')]
class ChartsPage extends Component
{
    public function render()
    {
        return view('livewire.pages.charts');
    }
}
