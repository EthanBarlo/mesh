<?php

namespace EthanBarlo\Mesh;

use Livewire\Component as LivewireComponent;
use Livewire\Mechanisms\CompileLivewireTags\LivewireTagPrecompiler;

/**
 * Compiles `<mesh:counter />` tags by rewriting them into namespaced Livewire
 * tags (`<livewire:mesh::counter />`) and delegating to Livewire's own
 * precompiler. Combined with the `mesh` namespace registered in
 * MeshServiceProvider, this resolves to the matching class in App\Mesh.
 *
 * The colon form is always rewritten. The hyphen alias (`<mesh-counter />`)
 * is only rewritten when its name resolves to a component class, so custom
 * elements that happen to start with `mesh-` (`<mesh-gradient>`) pass
 * through untouched.
 */
class MeshTagPrecompiler extends LivewireTagPrecompiler
{
    public function __invoke($value)
    {
        return parent::__invoke($this->rewriteMeshTags($value));
    }

    protected function rewriteMeshTags(string $value): string
    {
        // Opening, self-closing and closing: <mesh:x ...>, </mesh:x>  ->  <livewire:mesh::x ...>
        $value = preg_replace('/(<\s*(?:\/\s*)?)mesh:/', '$1livewire:mesh::', $value) ?? $value;

        // Same for <mesh-x ...> and </mesh-x>, but only when x names a component.
        // The decision depends on the name alone, so a closing tag always
        // follows its opening tag.
        return preg_replace_callback(
            '/(<\s*(?:\/\s*)?)mesh-([\w\-.]+)(?=[\s\/>])/',
            fn (array $matches): string => $this->isMeshComponent($matches[2])
                ? $matches[1].'livewire:mesh::'.$matches[2]
                : $matches[0],
            $value
        ) ?? $value;
    }

    /**
     * Whether `<livewire:mesh::{name}>` would mount a class, resolved through
     * the same Livewire finder (and `mesh` namespace) the mount itself uses.
     */
    protected function isMeshComponent(string $name): bool
    {
        $class = app('livewire.finder')->resolveClassComponentClassName('mesh::'.$name);

        return $class !== null && is_subclass_of($class, LivewireComponent::class);
    }
}
