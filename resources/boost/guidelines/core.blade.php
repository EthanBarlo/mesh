## Mesh

This project is equipped with Mesh, allowing React or Vue islands to interact directly with Livewire components. Livewire owns the server state; Mesh mounts framework components on the frontend and keeps the two in sync.

@verbatim
When creating or modifying Mesh components (files in `app/Mesh/` or `resources/js/mesh/`, `<mesh:*>` Blade tags, or the `useEntangle`/`useWire` hooks), activate the `mesh-development` skill first — Mesh has strict naming conventions that fail silently when broken.
@endverbatim
