# Changelog

All notable changes to `mesh` will be documented in this file.

## Unreleased

- Laravel 13 support. CI now tests Laravel 11, 12 and 13 on PHP 8.3 and 8.4.

## 0.3.0 - 2026-10-23

Vue and Svelte support, lazy framework runtimes, and fixes from the post-revamp follow-up list.

- Vue support: a Vue 3.3+ renderer with `useWire`, `useEntangle` and `useErrorBag`
  composables, Blade slots passed as native Vue slots, and a Vue demo app.
- Svelte support: a Svelte 5 renderer with the same composables, Blade slots passed as
  snippets, and a Svelte demo app.
- `php artisan make:mesh --renderer=vue` (or `svelte`) scaffolds Vue and Svelte components.
  Set the default with `make.renderer` in `config/mesh.php`.
- Discovery sources: `initMesh`'s `sources` option registers components that live outside
  `resources/js/mesh`, such as inside a Composer package, optionally under a `prefix`.
- Laravel Boost support: Mesh ships a Boost guideline and a `mesh-development` skill in
  `resources/boost/`.
- Framework runtimes load lazily. `@mesh/react`, `@mesh/vue` and `@mesh/svelte` now export
  small descriptors; React DOM, Vue or Svelte downloads with the first island that needs it,
  so pages without islands load none of it. Full renderer objects are still accepted.
- New renderer factories for app-level setup: `createReactRenderer({ wrap, strictMode })`,
  `createVueRenderer({ setup })` and `createSvelteRenderer({ context })`.
- Custom renderers can claim file extensions with `extensions`; components with those
  extensions come in through `sources`.
- `initMesh` is synchronous and never throws. A duplicate id, an unknown extension or a
  source entry outside `resources/js/mesh/` is logged and skipped; the first registration
  of an id wins, and the other islands still mount.
- React `useEntangle` no longer writes on mount or echoes server-driven values, matching
  Vue and Svelte. Its `$watch` and `useErrorBag`'s commit hook are removed on unmount, so
  StrictMode and key changes don't stack listeners.
- `window.Mesh.renderedComponents` entries are removed when an island is torn down.
- A whitespace-only default slot no longer becomes `children` / a default slot. Named slots
  are always passed. `Component::meshSlots()`, which was never used, is removed.
- `<mesh-x>` tags are rewritten only when `x` names a Mesh component, so unrelated custom
  elements such as `<mesh-gradient>` are left alone. `<mesh:x>` is unchanged.
- The `Wire` type matches Livewire 4.3: `$set`, `$toggle` and `$commit` return promises,
  `live` and dispatch `params` are optional, upload callbacks are optional, `$upload`
  returns `void`, `$removeUpload` no longer takes an `error` callback, `$cancelUpload` and
  the `cancelled` callback are added, and `$parent` may be `undefined`.
- The package's `package.json` declares `"sideEffects": false`.
- `/apps` and `/docs` are excluded from the Composer archive.
- The docs are rewritten, and the React, Vue and Svelte demos are redrawn.

### Upgrading from 0.2

- Change your Composer constraint to `^0.3.0`.
- `@mesh/react`'s default export is now a lazy descriptor. Passing it to `initMesh` needs no
  change. Code that called its `mount` or `renderSlot` directly should get the renderer from
  `createReactRenderer().load()`.
- `initMesh` returns `void` instead of a promise. `await initMesh(...)` still works; `.then()`
  does not.
- `Component::meshSlots()` is removed.
- A whitespace-only default slot is no longer passed as `children`.
- The `Wire` type changes above can surface new TypeScript errors, for example where
  `$parent` is used without a check or `$removeUpload` is given an `error` callback.

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
