import { Livewire, Alpine } from '../../vendor/livewire/livewire/dist/livewire.esm';
import { initMesh } from '@mesh';
import reactRenderer from '@mesh/react';

// Mesh auto-discovers components from resources/js/mesh — no registration needed.
initMesh(Livewire, {
    renderers: [reactRenderer],
    debug: true,
});

// Start Livewire (which also starts Alpine)
Livewire.start();
