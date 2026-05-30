<?php

namespace App\Mesh;

use EthanBarlo\Mesh\MeshComponent;

class TestComponent extends MeshComponent
{
    public string $name = 'world';

    public function component(): string
    {
        return 'resources/js/components/Greeter.tsx';
    }

    public function props(): array
    {
        return [
            'greeting' => "Hello {$this->name}",
        ];
    }
}
