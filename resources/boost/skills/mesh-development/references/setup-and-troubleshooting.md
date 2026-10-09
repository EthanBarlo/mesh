# Setup and Troubleshooting

Host-app installation for Mesh (React/Vue/Svelte islands inside Livewire 4) and the failure → cause → fix matrix. Assumes the SKILL.md mental model (ID matching, props vs entangle) is already known.

## Installation

### 1. Composer + npm

```bash
composer require ethanbarlo/mesh
npm install react react-dom
npm install -D @vitejs/plugin-react
```

The frontend runtime ships inside the Composer package — host apps consume it through a Vite alias, not npm. React is an optional peer dependency, installed in the host app only when using the React renderer.
For Vue, install `vue` and `@vitejs/plugin-vue`, add `vue()` to the Vite plugins, and register the renderer from `@mesh/vue` in `app.ts`.
For Svelte, install `svelte` and `@sveltejs/vite-plugin-svelte`, add `svelte()` to the Vite plugins, and register the renderer from `@mesh/svelte` in `app.ts`.

### 2. Vite alias + React plugin

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    laravel({ input: ['resources/css/app.css', 'resources/js/app.ts'] }),
    react(),
  ],
  resolve: {
    alias: {
      '@mesh': '/vendor/ethanbarlo/mesh/resources/js',
    },
  },
})
```

Mesh components are **not** Vite inputs. They are auto-discovered via `import.meta.glob("/resources/js/mesh/**/index.{tsx,jsx,vue,svelte}")` and each becomes its own lazy code-split chunk, loaded on first render.

### 3. Bootstrap in app.ts

```ts
// resources/js/app.ts
import { Livewire, Alpine } from '../../vendor/livewire/livewire/dist/livewire.esm'
import { initMesh } from '@mesh'
import reactRenderer from '@mesh/react'

initMesh(Livewire, {
  renderers: [reactRenderer],
  debug: true, // turn off in production
})

Livewire.start() // Livewire 4 requires explicit start
```

`initMesh` must run before `Livewire.start()` — it builds the registry synchronously and hooks `component.init` / `morph.updated`. It never throws for configuration mistakes: a bad entry or renderer is logged with a `Mesh:` console error and skipped, so the rest of the page still mounts.

The renderers are **lazy**: `@mesh/react` (and `@mesh/vue`, `@mesh/svelte`) export a small descriptor, so `app.ts` doesn't pull React DOM, Vue or Svelte into the main bundle. A framework's runtime downloads the first time an island of that kind mounts, and pages without islands load none of it.

### 4. Blade layout — the step people miss

Because the host app bundles Livewire itself, the layout **must** emit `@livewireScriptConfig` (and not `@livewireScripts`, which loads a second copy of Livewire). Without it, Livewire's ESM build also starts itself on `DOMContentLoaded`, so together with your `Livewire.start()` it starts twice. With the default `inject_assets` setting, Livewire also injects its own script, so a second copy of Livewire and Alpine runs (`Detected multiple instances of Livewire running`, `Cannot redefine property: $persist`). With `inject_assets` off, the bundle has no update URI, so every request fails.

```blade
{{-- resources/views/components/layouts/app.blade.php --}}
<head>
    @livewireStyles
    @vite(['resources/css/app.css', 'resources/js/app.ts'])
</head>
<body>
    {{ $slot }}

    @livewireScriptConfig
</body>
```

### 5. Create and render a component

```bash
php artisan make:mesh Counter              # app/Mesh/Counter.php + resources/js/mesh/Counter/index.tsx
php artisan make:mesh Forms/Input          # nested: app/Mesh/Forms/Input.php + resources/js/mesh/Forms/Input/index.tsx
php artisan make:mesh Counter --renderer=react   # explicit renderer (default: config('mesh.make.renderer', 'react'))
php artisan make:mesh Counter --renderer=vue     # Vue single-file component
php artisan make:mesh Counter --renderer=svelte  # Svelte 5 component
```

React, Vue, and Svelte stubs ship with Mesh; an unsupported `--renderer` value errors before writing anything. Render with the kebab-cased id as a tag:

```blade
<mesh:counter />
<mesh:forms.input />
```

`<mesh-counter />` also works as an alias. The hyphen form is only rewritten when the name resolves to a Mesh component class, so custom elements that happen to start with `mesh-` (e.g. `<mesh-gradient>`) render untouched; the colon form is always treated as a Mesh tag.

## initMesh options (verified)

The full `Config` type is:

```ts
type Config = {
  renderers: MeshRendererDefinition[] // required; a full MeshRenderer or a lazy { type, load } descriptor, keyed by type
  sources?: MeshSource[]              // extra discovery inputs for package components (see below)
  debug?: boolean                     // enables debugLog output (init, component.init per id)
}

type MeshSource =
  | GlobResult                              // a raw import.meta.glob result
  | { modules: GlobResult; prefix?: string } // same, with every id namespaced under prefix
```

There are no other options. The auto-discovery directory is hardcoded to the host app's `resources/js/mesh` (`MESH_BASE` in buildRegistry.ts).

## App-level renderer setup

To give every island the same providers or plugins, build the renderer with its factory instead of the default export (the result is still lazy):

```ts
// resources/js/app.ts
import { createElement } from 'react'
import { createReactRenderer } from '@mesh/react'

const queryClient = new QueryClient() // long-lived objects go outside the callback

initMesh(Livewire, {
  renderers: [
    createReactRenderer({
      // Runs on every render of each island, inside Mesh's Livewire context.
      wrap: (node) => createElement(QueryClientProvider, { client: queryClient }, node),
    }),
  ],
})
```

- `createReactRenderer({ wrap?, strictMode? })` — `strictMode` defaults to `true`. Whatever `wrap` imports statically (here React and the provider) is imported by `app.ts`, so it lands in the main bundle rather than loading lazily.
- `createVueRenderer({ setup? })` — `setup(app)` runs once per island (each island is its own Vue app) before it mounts: `app.use(...)`, `app.provide(...)`.
- `createSvelteRenderer({ context? })` — `context()` returns a `Map` merged into the context passed to Svelte's `mount()`, for `getContext()`.

## Components from Composer packages (`sources`)

`import.meta.glob` only accepts literal patterns, so the host app writes the glob for the package and hands Mesh the result:

```ts
initMesh(Livewire, {
  renderers: [reactRenderer],
  sources: [
    { modules: import.meta.glob('/vendor/acme/widgets/resources/js/mesh/**/index.{tsx,jsx}'), prefix: 'Acme' },
  ],
})
```

- Source entries must live under a `resources/js/mesh/` directory somewhere in their path — id derivation starts at that marker (`.../resources/js/mesh/Chart/index.tsx` → `Chart`, or `Acme/Chart` with the prefix). An entry without the marker is logged at init (`Mesh: source entry "…" does not live under a "resources/js/mesh/" directory…`) and skipped.
- The package's PHP component class lives outside `App\Mesh`, so it must override `component()` to return the matching frontend id (e.g. `'Acme/Chart'`). In the package service provider's `boot()` method, register it with Livewire, for example `Livewire::component('acme-chart', \Acme\Widgets\Mesh\Chart::class)`, and render `<livewire:acme-chart />`. The `<mesh:...>` shorthand only resolves classes under `App\Mesh`.
- Ids must be unique across the host app and all sources. A duplicate is logged (`Mesh: duplicate component id "…"`) and skipped: the first registration wins, host-app components before sources. Use `prefix` to disambiguate.
- Source components are code-split into lazy chunks exactly like auto-discovered ones.

For Vue or Svelte entries, include their extensions in the glob and configure the matching renderer and Vite plugin in the host app.

## Renderer / extension mapping

Renderer is inferred from the entry file extension — components never declare one, and the PHP side is renderer-agnostic:

| Entry | Inferred renderer |
|---|---|
| `index.tsx` / `index.jsx` | `react` |
| `index.vue` | `vue` |
| `index.svelte` | `svelte` |
| an extension a configured renderer claims in `extensions` | that renderer's `type` |
| anything else | logged (`Mesh: cannot infer renderer ... unknown extension`) and the entry is skipped — no silent default |

The inferred renderer must appear in the `renderers` array. React, Vue, and Svelte all ship built in (`@mesh/react`, `@mesh/vue`, `@mesh/svelte`); custom renderers implement the `MeshRenderer` interface (`type`, `renderSlot`, `mount` returning `{ update, cleanup }`), or a lazy `{ type, load }` descriptor whose `load()` resolves to one, and are added to the same array. A renderer can claim extra entry extensions with `extensions: ['mdx']` (without the dot). Auto-discovery only globs `index.{tsx,jsx,vue,svelte}`, so entries with a custom extension come in through `sources`.

## Troubleshooting matrix

**First diagnostic step: set `debug: true` in `initMesh`.** It logs registry construction and `component.init | <id>` per component, which immediately shows whether discovery and ID matching worked.

| Symptom | Likely cause | Fix |
|---|---|---|
| Island doesn't mount; console: `Mesh: component "X" is not registered. Known components: ...` | No frontend entry derives the id the PHP class uses. Either an ID mismatch (PHP `App\Mesh\Counter` → `Counter` must equal `resources/js/mesh/Counter/index.tsx` → `Counter`), or the entry wasn't discovered (outside `resources/js/mesh`, not named `index.{tsx,jsx,vue,svelte}`, or added after the last production build) | Compare `X` with the "Known components" list character for character; rename/move to `resources/js/mesh/<Name>/index.tsx`; `make:mesh` keeps both halves in sync. Rebuild in production |
| Works on macOS, breaks on Linux/production (same "not registered" error) | Case mismatch (`counter/` vs `Counter`) — macOS filesystem is case-insensitive, Linux is not | Match StudlyCase exactly on both sides |
| Console warning: `no components found under resources/js/mesh` | Directory empty or wrong layout | `php artisan make:mesh <Name>` and follow its structure |
| Console error at init: `Mesh: cannot infer renderer ... unknown extension`; that island never mounts | A `sources` entry has an extension no renderer handles | Narrow the glob to `index.{tsx,jsx,vue,svelte}`, or add a renderer that claims the extension via `extensions` |
| Console: `Mesh: failed to render "X"` with `Error: Mesh renderer for "vue" not found` | Inferred renderer not passed to `initMesh` | Add the matching renderer to `renderers: [...]` and install the framework + its Vite plugin |
| No errors, and no Livewire or Mesh behaviour at all | `Livewire.start()` never called (with `@livewireScriptConfig` present, Livewire waits for it), or the layout doesn't load the bundle | End `app.ts` with `Livewire.start()`, after `initMesh(...)`; load it with `@vite([... 'resources/js/app.ts'])` |
| Console: `Detected multiple instances of Livewire running` plus `Cannot redefine property: $persist`, or (with `inject_assets` off) every request fails | `@livewireScriptConfig` missing: Livewire injects its own script beside the bundle's copy, which also starts itself on `DOMContentLoaded`; without injection the bundle has no update URI | Add `@livewireScriptConfig` before `</body>` in every layout that loads the bundle (not `@livewireScripts`) |
| Console: `Detected multiple instances of Livewire running` | Livewire loaded twice: the bundle plus `@livewireScripts`, or a second import | Import Livewire only from `vendor/livewire/livewire/dist/livewire.esm`; use `@livewireScriptConfig`, not `@livewireScripts` |
| Props look stale / never update | Misconception: props are computed server-side in `props()` and only change when the Livewire component re-renders — they are not client-reactive | Verify a Livewire round-trip happens (action, `wire:poll`, entangle); use `useEntangle` for client-side state |
| Console: dynamic import / chunk load error on first render | `@mesh` alias missing or wrong in `vite.config.ts`, stale build, or the component module has no default export | Verify the alias is `/vendor/ethanbarlo/mesh/resources/js`, restart Vite / rebuild, ensure the entry `export default`s the component |
| Console: `component "X" module has no default export` | Entry uses only named exports | `export default` the component from `index.tsx` |
| Console error at init: `Mesh: duplicate component id "X" derived from "…"` | Two entries derive the same id (e.g. `Counter/index.tsx` and `Counter/index.vue`, or an app and a package component); the first one registered wins and the entry named in the message is ignored | Keep one entry per component folder; give package sources a `prefix` |

If still stuck: confirm both sides derive the same id (`Object.keys(window.Mesh.registry)` in the console lists every discovered id), confirm the entry path/filename, verify the `@mesh` alias resolves, and check the browser console during the first render of the component (that is when its chunk loads). Mesh logs its errors whether or not `debug` is on.
