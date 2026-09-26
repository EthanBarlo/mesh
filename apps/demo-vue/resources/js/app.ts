import { Livewire, Alpine } from '../../vendor/livewire/livewire/dist/livewire.esm';
import { initMesh } from '@mesh';
import vueRenderer from '@mesh/vue';

// Mesh auto-discovers components from resources/js/mesh — no registration needed.
initMesh(Livewire, {
    renderers: [vueRenderer],
    debug: true,
});

// Start Livewire (which also starts Alpine)
Livewire.start();
