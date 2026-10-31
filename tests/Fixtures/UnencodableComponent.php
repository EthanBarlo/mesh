<?php

declare(strict_types=1);

namespace EthanBarlo\Mesh\Tests\Fixtures;

use EthanBarlo\Mesh\Component;

// Returns props json_encode() cannot represent, to prove rendering fails loudly.
class UnencodableComponent extends Component
{
    public string $value = 'inf';

    public function component(): string
    {
        return 'Unencodable';
    }

    public function props(): array
    {
        return [
            'value' => $this->value === 'inf' ? INF : "\xB1\x31",
        ];
    }
}
