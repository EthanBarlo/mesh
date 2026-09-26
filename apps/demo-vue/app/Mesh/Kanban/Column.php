<?php

namespace App\Mesh\Kanban;

use EthanBarlo\Mesh\Component;
use Livewire\Attributes\Reactive;

/**
 * One island per column header + drop tail. It owns NO state:
 * every property is #[Reactive], so when the parent Board re-renders
 * after a move, the new values flow straight through props() into the
 * already-mounted React component.
 */
class Column extends Component
{
    #[Reactive]
    public string $columnId;

    #[Reactive]
    public string $title;

    #[Reactive]
    public int $count;

    public function props(): array
    {
        return [
            'columnId' => $this->columnId,
            'title' => $this->title,
            'count' => $this->count,
        ];
    }
}
