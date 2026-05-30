# Changelog

All notable changes to `mesh` will be documented in this file.

## 0.1.0 - Unreleased

Initial release of Mesh, a fresh rebuild of LivewireMesh.

- Render React components as the frontend of a Livewire component by extending `MeshComponent`.
- Pluggable renderer architecture (React adapter included; Vue/Svelte/etc. can be added).
- Lazy-loaded frontend assets via `data-mesh-asset` dynamic imports.
- React hooks: `useWire`, `useEntangle`, `useErrorBag`, and `useLivewireComponent`.
