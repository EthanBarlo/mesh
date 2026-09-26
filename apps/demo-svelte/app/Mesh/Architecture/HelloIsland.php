<?php

namespace App\Mesh\Architecture;

use EthanBarlo\Mesh\Component;

class HelloIsland extends Component
{
    public function props(): array
    {
        return [
            'greeting' => 'Hello from a lazy chunk',
            'chunkNote' => 'This component\'s JS was not on the page until you toggled it.',
        ];
    }
}
