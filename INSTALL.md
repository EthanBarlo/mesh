# Installing Mesh

> React + Livewire 4 islands. This guide gets a host Laravel app rendering a Mesh component.

## 1. Require the package

```bash
composer require ethanbarlo/mesh
```

## 2. Install the frontend runtime

The frontend ships **inside the Composer package**. Host apps consume it through a Vite **alias**, not npm.

Add the alias to `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    laravel({
      input: [
        'resources/css/app.css',
        'resources/js/app.ts',
      ],
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@mesh': '/vendor/ethanbarlo/mesh/resources/js',
    },
  },
})
```

Mesh components are **not** individual Vite inputs. They are discovered automatically by a single
`import.meta.glob` in `app.ts` (next step) and code-split into their own async chunks.

## 3. Wire up `app.ts`

Register your renderers and hand Mesh the glob of every component. One line wires up the whole
`resources/js/mesh` directory — there is no per-component registration.

```ts
import { initMesh } from '@mesh/runtime'
import { reactRenderer } from '@mesh/renderers/react'

initMesh({
  renderers: {
    react: reactRenderer,
  },
  // Lazy registry: every component folder's entry, code-split on first render.
  components: import.meta.glob('/resources/js/mesh/**/index.{tsx,jsx}'),
})

// Livewire 4 requires explicit start
import { Livewire } from '../../vendor/livewire/livewire/dist/livewire.esm'
@livewireScriptConfig
Livewire.start()
```

`import.meta.glob(..., { eager: false })` is the default, so each match becomes a lazy
`() => import(...)` chunk. Mesh fetches the chunk for a component the first time it renders.

## 4. Create a component

```bash
php artisan make:mesh Counter
```

This scaffolds:

- `app/Mesh/Counter.php` — the PHP component class
- `resources/js/mesh/Counter/index.tsx` — your React component (its **default export** is the component)

The component directory is fixed at `resources/js/mesh`. A component is a folder whose
`index.{tsx,jsx}` default-exports it. Nested components live in nested folders, e.g.
`resources/js/mesh/Forms/Input/index.tsx`.

## 5. Render it in Blade

```blade
<livewire:mesh :component="\App\Mesh\Counter::class" />
```

## 6. Where to go next

- The component **id** is what links the two sides — a simple string like `Counter` (or `Forms/Input`),
  derived identically from the PHP class name and the folder path. `make:mesh` keeps them in sync.
- Read the [building components guide](docs/guides/building-components.mdx).
- See [renderers](docs/advanced/renderers.mdx) to add Vue or Svelte.
- See [troubleshooting](docs/advanced/troubleshooting.mdx) if a component doesn't mount.

## Notes

- Livewire 4 is required (the `<livewire:mesh>` tag and `@livewireScriptConfig`).
- The folder name must match the StudlyCase PHP class name exactly. Case matters on Linux even
  though macOS may hide a mismatch.
