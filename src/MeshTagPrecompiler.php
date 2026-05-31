<?php

namespace EthanBarlo\Mesh;

use Livewire\Mechanisms\CompileLivewireTags\LivewireTagPrecompiler;

/**
 * Compiles `<mesh:counter />` tags by rewriting them into namespaced Livewire
 * tags (`<livewire:mesh::counter />`) and delegating to Livewire's own
 * precompiler. Combined with the `mesh` namespace registered in
 * MeshServiceProvider, this resolves to the matching class in App\Mesh.
 */
class MeshTagPrecompiler extends LivewireTagPrecompiler
{
    public function __invoke($value)
    {
        return parent::__invoke($this->rewriteMeshTags($value));
    }

    protected function rewriteMeshTags($value)
    {
        // Opening / self-closing: <mesh:x ...> and <mesh-x ...>  ->  <livewire:mesh::x ...>
        $value = preg_replace('/(<\s*)mesh[-:]/', '$1livewire:mesh::', $value);

        // Closing: </mesh:x> and </mesh-x>  ->  </livewire:mesh::x>
        $value = preg_replace('/(<\s*\/\s*)mesh[-:]/', '$1livewire:mesh::', $value);

        return $value;
    }
}
