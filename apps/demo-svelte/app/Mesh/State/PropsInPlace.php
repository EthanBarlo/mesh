<?php

namespace App\Mesh\State;

use EthanBarlo\Mesh\Component;
use Livewire\Attributes\Modelable;

class PropsInPlace extends Component
{
    /**
     * #[Modelable] lets a parent bind this property with wire:model —
     * the page's <select> drives this component from the outside.
     */
    #[Modelable]
    public string $theme = 'rose';

    protected const PALETTES = [
        'rose' => [
            'label' => 'Rose',
            'accent' => '#f43f5e',
            'swatches' => [
                ['name' => '300', 'hex' => '#fda4af'],
                ['name' => '400', 'hex' => '#fb7185'],
                ['name' => '500', 'hex' => '#f43f5e'],
                ['name' => '600', 'hex' => '#e11d48'],
            ],
        ],
        'amber' => [
            'label' => 'Amber',
            'accent' => '#f59e0b',
            'swatches' => [
                ['name' => '300', 'hex' => '#fcd34d'],
                ['name' => '400', 'hex' => '#fbbf24'],
                ['name' => '500', 'hex' => '#f59e0b'],
                ['name' => '600', 'hex' => '#d97706'],
            ],
        ],
        'emerald' => [
            'label' => 'Emerald',
            'accent' => '#10b981',
            'swatches' => [
                ['name' => '300', 'hex' => '#6ee7b7'],
                ['name' => '400', 'hex' => '#34d399'],
                ['name' => '500', 'hex' => '#10b981'],
                ['name' => '600', 'hex' => '#059669'],
            ],
        ],
        'cyan' => [
            'label' => 'Cyan',
            'accent' => '#06b6d4',
            'swatches' => [
                ['name' => '300', 'hex' => '#67e8f9'],
                ['name' => '400', 'hex' => '#22d3ee'],
                ['name' => '500', 'hex' => '#06b6d4'],
                ['name' => '600', 'hex' => '#0891b2'],
            ],
        ],
        'violet' => [
            'label' => 'Violet',
            'accent' => '#8b5cf6',
            'swatches' => [
                ['name' => '300', 'hex' => '#c4b5fd'],
                ['name' => '400', 'hex' => '#a78bfa'],
                ['name' => '500', 'hex' => '#8b5cf6'],
                ['name' => '600', 'hex' => '#7c3aed'],
            ],
        ],
    ];

    public function props(): array
    {
        // Computed fresh on every server render. When $theme changes, Mesh
        // hands the new palette to the mounted Svelte component in place —
        // it never remounts, so local Svelte state survives.
        return [
            'theme' => $this->theme,
            'palette' => self::PALETTES[$this->theme] ?? self::PALETTES['rose'],
        ];
    }
}
