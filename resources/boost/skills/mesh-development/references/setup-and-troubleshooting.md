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

`initMesh` must run before `Livewire.start()` — it registers the registry synchronously and hooks `component.init` / `morph.updated`.

### 4. Blade layout — the step people miss

Because the host app bundles Livewire itself, the layout **must** emit `@livewireScriptConfig`. Without it, `Livewire.start()` has no config and nothing initializes — no errors, just dead components.

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
```

Only a `react` stub ships today; an unsupported `--renderer` value errors before writing anything. Render with the kebab-cased id as a tag:

```blade
<mesh:counter />
<mesh:forms.input />
```

## initMesh options (verified)

The full `Config` type is:

```ts
type Config = {
  renderers: MeshRenderer<any>[]  // required; keyed internally by renderer.type
  debug?: boolean                 // enables debugLog output (init, component.init per id)
}
```

There are no other options. The component directory is hardcoded to `resources/js/mesh` (`MESH_BASE` in buildRegistry.ts) — it is not configurable.

## Renderer / extension mapping

Renderer is inferred from the entry file extension — components never declare one, and the PHP side is renderer-agnostic:

| Entry | Inferred renderer |
|---|---|
| `index.tsx` / `index.jsx` | `react` |
| `index.vue` | `vue` |
| `index.svelte` | `svelte` |
| anything else | **throws** (`Mesh: cannot infer renderer ... unknown extension`) — no silent default |

The inferred renderer must appear in the `renderers` array. React, Vue, and Svelte all ship built in (`@mesh/react`, `@mesh/vue`, `@mesh/svelte`); custom renderers implement the `MeshRenderer` interface (`type`, `renderSlot`, `mount` returning `{ update, cleanup }`) and are added to the same array. A duplicate component id in the registry also throws at init.

## Troubleshooting matrix

**First diagnostic step: set `debug: true` in `initMesh`.** It logs registry construction and `component.init | <id>` per component, which immediately shows whether discovery and ID matching worked.

| Symptom | Likely cause | Fix |
|---|---|---|
| Component renders nothing, no errors | ID mismatch: PHP `App\Mesh\Counter` → `Counter` must equal JS folder id `resources/js/mesh/Counter/index.tsx` → `Counter` | Rename so class name and folder path match exactly; `make:mesh` keeps them in sync |
| Works on macOS, breaks on Linux/production | Case mismatch (`counter/` vs `Counter`) — macOS filesystem is case-insensitive, Linux is not | Match StudlyCase exactly on both sides |
| Console: `component "X" is not registered. Known components: ...` | Entry not discovered: file lives outside `resources/js/mesh`, or is not named `index.{tsx,jsx,vue,svelte}` | Move/rename to `resources/js/mesh/<Name>/index.tsx`; compare against the "Known components" list in the error |
| Console warning: `no components found under resources/js/mesh` | Directory empty or wrong layout | `php artisan make:mesh <Name>` and follow its structure |
| Throw at init: `cannot infer renderer ... unknown extension` | Entry has an extension other than tsx/jsx/vue/svelte | Rename the entry to a supported extension |
| Mount fails for a `.vue`/`.svelte` component | Inferred renderer not passed to `initMesh` | Add the matching renderer to `renderers: [...]` |
| Nothing on the page initializes at all | `@livewireScriptConfig` missing from the Blade layout, or `Livewire.start()` never called | Add the directive at the end of `<body>`; end `app.ts` with `Livewire.start()` |
| Props look stale / never update | Misconception: props are computed server-side in `props()` and only change when the Livewire component re-renders — they are not client-reactive | Verify a Livewire round-trip happens (action, `wire:poll`, entangle); use `useEntangle` for client-side state |
| Console: dynamic import / chunk load error on first render | `@mesh` alias missing or wrong in `vite.config.ts`, stale build, or the component module has no default export | Verify the alias is `/vendor/ethanbarlo/mesh/resources/js`, restart Vite / rebuild, ensure the entry `export default`s the component |
| Console: `component "X" module has no default export` | Entry uses only named exports | `export default` the component from `index.tsx` |
| Throw at init: `duplicate component id` | Two entries derive the same id (e.g. `Counter/index.tsx` and `Counter/index.vue`) | Keep one entry per component folder |

If still stuck: confirm both sides derive the same id, confirm the entry path/filename, verify the `@mesh` alias resolves, and check the browser console during the first render of the component (that is when its chunk loads).
