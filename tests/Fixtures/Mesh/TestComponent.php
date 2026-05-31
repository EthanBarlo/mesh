<?php

declare(strict_types=1);

namespace App\Mesh;

use EthanBarlo\Mesh\MeshComponent;

class TestComponent extends MeshComponent
{
    public string $name = 'world';

    public function props(): array
    {
        return [
            'greeting' => "Hello {$this->name}",
        ];
    }
}
