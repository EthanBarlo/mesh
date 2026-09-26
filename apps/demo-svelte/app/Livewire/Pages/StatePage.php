<?php

namespace App\Livewire\Pages;

use Livewire\Attributes\Layout;
use Livewire\Attributes\Title;
use Livewire\Component;

#[Layout('components.layouts.demo')]
#[Title('State & Reactive Props · Mesh Demo')]
class StatePage extends Component
{
    /**
     * Bound to the Blade <select wire:model.live="theme"> on the page and
     * forwarded into the PropsInPlace Mesh component via wire:model +
     * #[Modelable] — one property driving two components.
     */
    public string $theme = 'rose';

    public function render()
    {
        return view('livewire.pages.state');
    }
}
