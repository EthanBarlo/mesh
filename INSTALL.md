# Installing Mesh

> React + Livewire 4 islands. This guide gets a host Laravel app rendering a Mesh component.

## 1. Require the package

```bash
composer require ethanbarlo/mesh
```

## 2. Install the frontend runtime

The frontend ships **inside the Composer package**. Host apps consume it through a Vite **alias**, not npm.

Using the React renderer? React is an optional peer dependency — install it (and Vite's React plugin) in your host app:

```bash
npm install react react-dom
npm install -D @vitejs/plugin-react
```

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

Mesh components are **not** individual Vite inputs. Mesh auto-discovers them from
`resources/js/mesh` and code-splits each into its own async chunk.

## 3. Wire up `app.ts`

Register your renderers — that's it. Mesh auto-discovers every component under `resources/js/mesh`,
so there is no per-component registration and nothing to declare for components.

```ts
import { Livewire, Alpine } from '../../vendor/livewire/livewire/dist/livewire.esm'
import { initMesh } from '@mesh'
import reactRenderer from '@mesh/react'

initMesh(Livewire, {
  renderers: [reactRenderer],
  debug: true,
})

// Livewire 4 requires explicit start
Livewire.start()
```

Each discovered component folder's entry becomes a lazy `() => import(...)` chunk. Mesh fetches the
chunk for a component the first time it renders.

Because you bundle Livewire yourself, your **Blade layout** must emit `@livewireScriptConfig` — the
directive that injects the config the bundled Livewire reads on `Livewire.start()`. It's a Blade
directive, so it lives in the layout, not in `app.ts` (see the next step).

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

## 5. Set up your layout and render

Your layout loads the bundle with `@vite` and emits Livewire's runtime config with
`@livewireScriptConfig`:

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

Then render a Mesh component anywhere in a Livewire view with the `<mesh:…>` tag. The tag name
is the component **id** in kebab-case (`Counter` → `counter`), and props pass through as attributes:

```blade
<mesh:counter />
```

## 6. Where to go next

- The component **id** is what links the two sides — a simple string like `Counter` (or `Forms/Input`),
  derived identically from the PHP class name and the folder path. `make:mesh` keeps them in sync.
- Read the [building components guide](docs/guides/building-components.mdx).
- See [renderers](docs/advanced/renderers.mdx) to add Vue or Svelte.
- See [troubleshooting](docs/advanced/troubleshooting.mdx) if a component doesn't mount.

## Notes

- Livewire 4 is required (the `<mesh:…>` tag and `@livewireScriptConfig`).
- The folder name must match the StudlyCase PHP class name exactly. Case matters on Linux even
  though macOS may hide a mismatch.
