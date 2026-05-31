<?php

declare(strict_types=1);

namespace EthanBarlo\Mesh\Tests\Fixtures;

use EthanBarlo\Mesh\Component;

class TestComponent extends Component
{
    public string $name = 'world';

    public function component(): string
    {
        return 'Greeter';
    }

    public function props(): array
    {
        return [
            'greeting' => "Hello {$this->name}",
        ];
    }
}
