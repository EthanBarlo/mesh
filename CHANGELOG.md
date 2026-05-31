# Changelog

All notable changes to `mesh` will be documented in this file.

## 0.1.0 - 2026-05-31

Initial release of Mesh, a fresh rebuild of LivewireMesh.

- Render React components as the frontend of a Livewire component by extending `Component`.
- Pluggable renderer architecture (React adapter included; Vue/Svelte/etc. can be added).
- Auto-discovered components: a single `import.meta.glob` registry in `app.ts` lazy-loads each
  component as its own code-split chunk on first render, identified by a simple id derived
  identically in PHP (`Component::component()`) and JS.
- React hooks: `useWire`, `useEntangle`, `useErrorBag`, and `useLivewireComponent`.
