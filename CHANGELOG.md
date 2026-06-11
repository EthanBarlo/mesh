# Changelog

All notable changes to `mesh` will be documented in this file.

## 0.2.0 - 2026-06-11

Slot support, plus a much bigger documentation and demo story.

- Slots: inner content of a `<mesh:…>` tag is forwarded to React as `children`, and
  `<livewire:slot name="…">` content arrives on a `slots` prop keyed by name — captured
  automatically, with nothing extra to write on the PHP class. Slot content is reactive
  to parent re-renders; it is rendered from server HTML, so nested interactive
  Livewire/Alpine inside a slot is not supported in v1.
- Simplified renderer API: a framework adapter now implements just `renderSlot` and
  `mount`. The shared bookkeeping — default-vs-named slot splitting, the reserved-prop
  guard, props dirty-checking, and stable slot nodes across props-only updates — lives
  in one tested core.
- The Blade wrapper element now uses `display: contents`, so Mesh's infrastructure
  markup no longer interferes with your layouts (grids, flex parents, etc.).
- New and expanded docs: a "Why Mesh" page, slot guides and API reference, expanded
  renderer documentation, and a rebuilt docs home page.
- The [React demo](https://mesh-demo-react.ebarlow.dev) is now a full multi-page
  showcase: state & props, the `$wire` bridge, forms & validation, slots, file uploads,
  a TanStack data table, ECharts live charts, a dnd-kit board, a Blade-composed kanban
  built from separate column and card islands, and an auto-discovery/code-splitting
  walkthrough — each page with its source in a code viewer.

## 0.1.0 - 2026-05-31

Initial release of Mesh, a fresh rebuild of LivewireMesh.

- Render React components as the frontend of a Livewire component by extending `Component`.
- Pluggable renderer architecture (React adapter included; Vue/Svelte/etc. can be added).
- Auto-discovered components: a single `import.meta.glob` registry in `app.ts` lazy-loads each
  component as its own code-split chunk on first render, identified by a simple id derived
  identically in PHP (`Component::component()`) and JS.
- React hooks: `useWire`, `useEntangle`, `useErrorBag`, and `useLivewireComponent`.
