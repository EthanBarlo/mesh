<?php

namespace App\Mesh\Slots;

use EthanBarlo\Mesh\Component;

class Card extends Component
{
    public string $variant = 'default';

    public function props(): array
    {
        return [
            'variant' => $this->variant,
        ];
    }
}
