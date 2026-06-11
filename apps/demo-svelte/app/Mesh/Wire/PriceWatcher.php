<?php

namespace App\Mesh\Wire;

use EthanBarlo\Mesh\Component;

class PriceWatcher extends Component
{
    public float $price = 142.50;

    /**
     * Random-walk the price server-side. Svelte only schedules the tick —
     * the server owns the value, and wire.$watch('price', …) streams every
     * change back into the island.
     */
    public function tick(): void
    {
        $drift = random_int(-220, 240) / 100;
        $this->price = round(max(5.0, $this->price + $drift), 2);
    }

    public function props(): array
    {
        return [
            'symbol' => 'MESH',
            'initialPrice' => $this->price,
        ];
    }
}
