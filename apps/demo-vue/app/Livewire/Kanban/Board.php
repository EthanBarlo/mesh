<?php

namespace App\Livewire\Kanban;

use Livewire\Attributes\On;
use Livewire\Component;

/**
 * A completely ordinary Livewire component that owns ALL board state.
 * The Mesh islands it composes (kanban.column, kanban.card) never hold
 * state of their own — a drop dispatches `kanban.card-moved` onto
 * Livewire's event bus, this component catches it, mutates the array,
 * and the re-render flows back down to every island as reactive props.
 */
class Board extends Component
{
    public array $columns = [];

    /** How many moves the server has confirmed. */
    public int $syncCount = 0;

    /** Server time of the last confirmed move (HH:MM:SS). */
    public string $lastSyncAt = '';

    public function mount(): void
    {
        $state = session('demo.kanban-blade');

        $this->columns = $state['columns'] ?? self::seedColumns();
        $this->syncCount = $state['syncCount'] ?? 0;
        $this->lastSyncAt = $state['lastSyncAt'] ?? '';
    }

    /**
     * Fired by whichever React island received the drop — a card
     * (insert at its slot) or a column's drop tail (append).
     */
    #[On('kanban.card-moved')]
    public function moveCard(string $cardId, string $fromColumnId, string $toColumnId, int $position, string $title = ''): void
    {
        $targetIndex = null;

        foreach ($this->columns as $i => $column) {
            if (($column['id'] ?? null) === $toColumnId) {
                $targetIndex = $i;
                break;
            }
        }

        if ($targetIndex === null) {
            return;
        }

        // Detach the card from wherever it currently lives, then re-insert —
        // idempotent regardless of what the client thinks the source was.
        $card = null;

        foreach ($this->columns as $i => $column) {
            foreach ($column['cards'] ?? [] as $j => $candidate) {
                if (($candidate['id'] ?? null) === $cardId) {
                    $card = $candidate;
                    array_splice($this->columns[$i]['cards'], $j, 1);
                    break 2;
                }
            }
        }

        if ($card === null) {
            return;
        }

        $position = max(0, min($position, count($this->columns[$targetIndex]['cards'])));
        array_splice($this->columns[$targetIndex]['cards'], $position, 0, [$card]);

        $this->syncCount++;
        $this->lastSyncAt = now()->format('H:i:s');

        $this->persist();
    }

    /** Clear the session copy and restore the seeded board. */
    public function resetBoard(): void
    {
        session()->forget('demo.kanban-blade');

        $this->columns = self::seedColumns();
        $this->syncCount = 0;
        $this->lastSyncAt = '';

        $this->dispatch('kanban.board-reset');
    }

    protected function persist(): void
    {
        session([
            'demo.kanban-blade' => [
                'columns' => $this->columns,
                'syncCount' => $this->syncCount,
                'lastSyncAt' => $this->lastSyncAt,
            ],
        ]);
    }

    protected static function seedColumns(): array
    {
        return [
            [
                'id' => 'backlog',
                'title' => 'Backlog',
                'cards' => [
                    ['id' => 'bk-empty-states', 'title' => 'Design empty states', 'tag' => 'design'],
                    ['id' => 'bk-rate-limit', 'title' => 'Rate-limit the public API', 'tag' => 'api'],
                    ['id' => 'bk-onboarding', 'title' => 'Write onboarding guide', 'tag' => 'docs'],
                    ['id' => 'bk-bundle-audit', 'title' => 'Audit bundle size', 'tag' => 'perf'],
                ],
            ],
            [
                'id' => 'in-progress',
                'title' => 'In Progress',
                'cards' => [
                    ['id' => 'bk-drag-physics', 'title' => 'Kanban drag physics', 'tag' => 'feature'],
                    ['id' => 'bk-flaky-test', 'title' => 'Fix flaky upload test', 'tag' => 'bug'],
                    ['id' => 'bk-dark-palette', 'title' => 'Dark mode palette pass', 'tag' => 'design'],
                ],
            ],
            [
                'id' => 'done',
                'title' => 'Done',
                'cards' => [
                    ['id' => 'bk-code-split', 'title' => 'Per-component code-splitting', 'tag' => 'perf'],
                    ['id' => 'bk-entangle-v2', 'title' => 'useEntangle live mode', 'tag' => 'feature'],
                    ['id' => 'bk-ci-prs', 'title' => 'CI on pull requests', 'tag' => 'infra'],
                ],
            ],
        ];
    }

    public function render()
    {
        return view('livewire.kanban.board');
    }
}
