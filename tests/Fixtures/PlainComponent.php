<?php

declare(strict_types=1);

namespace EthanBarlo\Mesh\Tests\Fixtures;

use Livewire\Component;

// A plain Livewire component (not a Mesh one) with methods that share Mesh's
// reserved names, to prove the browser-call guard only applies to Mesh components.
class PlainComponent extends Component
{
    public int $calls = 0;

    /** @return array<string, mixed> */
    public function props(): array
    {
        $this->calls++;

        return [];
    }

    public function component(): string
    {
        $this->calls++;

        return 'plain';
    }

    public function render(): string
    {
        return '<div></div>';
    }
}
