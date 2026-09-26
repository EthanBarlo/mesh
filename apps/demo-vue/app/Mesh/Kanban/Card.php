<?php

namespace App\Mesh\Kanban;

use EthanBarlo\Mesh\Component;
use Livewire\Attributes\Reactive;

/**
 * One island per card, rendered by the Board's Blade @foreach.
 * A pure prop receiver: position and columnId shift as siblings move,
 * and #[Reactive] keeps the mounted React component in sync. The island
 * is deliberately stateless — a cross-column move destroys and remounts
 * it in the new cell.
 */
class Card extends Component
{
    #[Reactive]
    public array $card;

    #[Reactive]
    public string $columnId;

    #[Reactive]
    public int $position;

    public function props(): array
    {
        return [
            'card' => $this->card,
            'columnId' => $this->columnId,
            'position' => $this->position,
        ];
    }
}
