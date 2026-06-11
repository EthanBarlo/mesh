<?php

namespace App\Mesh\Wire;

use EthanBarlo\Mesh\Component;
use Livewire\Attributes\On;

class EventBridge extends Component
{
    public int $received = 0;

    /**
     * Listens for the event dispatched by the Blade button on the page.
     * Each ping re-renders the component, props() re-runs, and the React
     * island receives the fresh count — no remount, local state survives.
     */
    #[On('page.ping')]
    public function onPagePing(): void
    {
        $this->received++;
    }

    public function props(): array
    {
        return [
            'received' => $this->received,
        ];
    }
}
