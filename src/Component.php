<?php

declare(strict_types=1);

namespace EthanBarlo\Mesh;

use Livewire\Component as LivewireComponent;
use Livewire\Features\SupportSlots\Slot;
use LogicException;

abstract class Component extends LivewireComponent
{
    /**
     * The namespace under which conventional Mesh components live.
     *
     * A component whose class sits under this namespace derives its id
     * automatically; anything outside it must override component().
     */
    protected const MESH_NAMESPACE = 'App\\Mesh';

    /**
     * The simple id of this component's frontend entry.
     *
     * Matches the JS-side glob id (e.g. App\Mesh\Counter -> 'Counter',
     * App\Mesh\Forms\Input -> 'Forms/Input'). Override to return an
     * explicit id when the class lives outside the App\Mesh namespace.
     */
    public function component(): string
    {
        $prefix = self::MESH_NAMESPACE.'\\';
        $class = static::class;

        if (! str_starts_with($class, $prefix)) {
            throw new LogicException(sprintf(
                'Mesh component [%s] lives outside the [%s] namespace; override component() to return an explicit id.',
                $class,
                self::MESH_NAMESPACE
            ));
        }

        return str_replace('\\', '/', substr($class, strlen($prefix)));
    }

    /**
     * Props passed to the frontend component as JSON.
     *
     * @return array<string, mixed>
     */
    public function props(): array
    {
        return [];
    }

    /**
     * Real slot content keyed by name (the default slot is named 'default').
     *
     * Only populated on the mount render; on the component's own re-render the
     * slots become content-less placeholders, so this returns []. Skips
     * placeholder and whitespace-only slots.
     *
     * @internal
     *
     * @return array<string, string>
     */
    public function meshSlots(): array
    {
        $slots = [];

        foreach ($this->getSlots() as $slot) {
            if ($slot instanceof Slot && trim($slot->content) !== '') {
                $slots[$slot->getName()] = $slot->content;
            }
        }

        return $slots;
    }

    public function render()
    {
        return view('mesh::component');
    }
}
