<?php

namespace App\Livewire\Pages;

use Livewire\Attributes\Layout;
use Livewire\Attributes\Title;
use Livewire\Component;

#[Layout('components.layouts.demo')]
#[Title('The $wire Bridge · Mesh Demo')]
class WirePage extends Component
{
    /**
     * Triggered by a plain Blade button — the EventBridge Svelte island
     * listens for this event via #[On('page.ping')] on its PHP class.
     */
    public function pingIslands(): void
    {
        $this->dispatch('page.ping');
    }

    public function render()
    {
        return view('livewire.pages.wire');
    }
}
