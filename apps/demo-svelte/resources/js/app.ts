import { Livewire, Alpine } from '../../vendor/livewire/livewire/dist/livewire.esm';
import { initMesh } from '@mesh';
import svelteRenderer from '@mesh/svelte';

// Mesh auto-discovers components from resources/js/mesh — no registration needed.
initMesh(Livewire, {
    renderers: [svelteRenderer],
    debug: true,
});

// Start Livewire (which also starts Alpine)
Livewire.start();
