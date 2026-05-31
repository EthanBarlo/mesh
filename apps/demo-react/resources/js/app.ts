import { Livewire, Alpine } from '../../vendor/livewire/livewire/dist/livewire.esm';
import { initMesh } from '@mesh';
import reactRenderer from '@mesh/react';

// Initialize Mesh with the React renderer
initMesh(Livewire, {
    renderers: [reactRenderer],
    components: import.meta.glob('/resources/js/mesh/**/index.{tsx,jsx}'),
    debug: true,
});

// Start Livewire (which also starts Alpine)
Livewire.start();
