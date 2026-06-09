<?php

namespace App\Mesh\Board;

use EthanBarlo\Mesh\Component;

class Kanban extends Component
{
    /** Entangled with useEntangle('columns') — the single source of board state. */
    public array $columns = [];

    /** How many moves the server has confirmed. */
    public int $syncCount = 0;

    /** Server time of the last confirmed move (HH:MM:SS). */
    public string $lastSyncAt = '';

    public function mount(): void
    {
        $state = session('demo.board');

        $this->columns = $state['columns'] ?? self::seedColumns();
        $this->syncCount = $state['syncCount'] ?? 0;
        $this->lastSyncAt = $state['lastSyncAt'] ?? '';
    }

    /**
     * Confirm a move server-side. The entangled $columns may already reflect
     * the client-side reorder by the time this call arrives (deferred sets
     * batch with the $call request), so we detach the card from wherever it
     * currently lives and re-insert it — idempotent either way.
     */
    public function moveCard(string $cardId, string $fromCol, string $toCol, int $position): void
    {
        $targetIndex = null;

        foreach ($this->columns as $i => $column) {
            if (($column['id'] ?? null) === $toCol) {
                $targetIndex = $i;
                break;
            }
        }

        if ($targetIndex === null) {
            return;
        }

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
        session()->forget('demo.board');

        $this->columns = self::seedColumns();
        $this->syncCount = 0;
        $this->lastSyncAt = '';
    }

    protected function persist(): void
    {
        session([
            'demo.board' => [
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
                    ['id' => 'card-empty-states', 'title' => 'Design empty states', 'tag' => 'design'],
                    ['id' => 'card-rate-limit', 'title' => 'Rate-limit the public API', 'tag' => 'api'],
                    ['id' => 'card-onboarding', 'title' => 'Write onboarding guide', 'tag' => 'docs'],
                    ['id' => 'card-bundle-audit', 'title' => 'Audit bundle size', 'tag' => 'perf'],
                ],
            ],
            [
                'id' => 'in-progress',
                'title' => 'In Progress',
                'cards' => [
                    ['id' => 'card-drag-physics', 'title' => 'Kanban drag physics', 'tag' => 'feature'],
                    ['id' => 'card-flaky-test', 'title' => 'Fix flaky upload test', 'tag' => 'bug'],
                    ['id' => 'card-dark-palette', 'title' => 'Dark mode palette pass', 'tag' => 'design'],
                    ['id' => 'card-session-sync', 'title' => 'Session persistence layer', 'tag' => 'api'],
                ],
            ],
            [
                'id' => 'done',
                'title' => 'Done',
                'cards' => [
                    ['id' => 'card-code-split', 'title' => 'Per-component code-splitting', 'tag' => 'perf'],
                    ['id' => 'card-entangle-v2', 'title' => 'useEntangle live mode', 'tag' => 'feature'],
                    ['id' => 'card-ci-prs', 'title' => 'CI on pull requests', 'tag' => 'infra'],
                    ['id' => 'card-errorbag-docs', 'title' => 'Document useErrorBag', 'tag' => 'docs'],
                ],
            ],
        ];
    }

    public function props(): array
    {
        return [
            'syncCount' => $this->syncCount,
            'lastSyncAt' => $this->lastSyncAt,
        ];
    }
}
