<?php

namespace App\Livewire;

use Livewire\Attributes\On;
use Livewire\Component;

/**
 * A completely ordinary Livewire component — no Mesh, no Svelte.
 * It hears events dispatched from the Svelte island via wire.$dispatch().
 */
class EventToast extends Component
{
    public int $count = 0;

    public string $message = '';

    #[On('mesh.ping')]
    public function onMeshPing(string $message = ''): void
    {
        $this->count++;
        $this->message = $message;
    }

    public function render()
    {
        return view('livewire.event-toast');
    }
}
