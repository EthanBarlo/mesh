<?php

namespace App\Livewire\Kanban;

use Livewire\Attributes\On;
use Livewire\Component;

/**
 * A second, completely ordinary Livewire listener. It hears the same
 * `kanban.card-moved` event the Board consumes — proof that a Svelte
 * island's dispatch is just a regular Livewire event anyone can catch.
 */
class ActivityLog extends Component
{
    /** Newest-first, capped — lives in component state, resets on reload. */
    public array $entries = [];

    public int $seq = 0;

    #[On('kanban.card-moved')]
    public function onCardMoved(string $cardId, string $fromColumnId, string $toColumnId, int $position, string $title = ''): void
    {
        $this->push(sprintf(
            '"%s" moved %s → %s (slot %d)',
            $title !== '' ? $title : $cardId,
            $fromColumnId,
            $toColumnId,
            $position + 1,
        ));
    }

    #[On('kanban.board-reset')]
    public function onBoardReset(): void
    {
        $this->push('Board reset to the seeded layout');
    }

    protected function push(string $text): void
    {
        array_unshift($this->entries, [
            'id' => ++$this->seq,
            'time' => now()->format('H:i:s'),
            'text' => $text,
        ]);

        $this->entries = array_slice($this->entries, 0, 8);
    }

    public function render()
    {
        return view('livewire.kanban.activity-log');
    }
}
