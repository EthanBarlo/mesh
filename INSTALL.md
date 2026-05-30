# Installing Mesh

This guide is written as explicit, ordered steps. A human or an AI assistant can follow it
top-to-bottom to add Mesh to an existing Laravel + Livewire application. Each step says exactly
what to change and why.

> Assumptions: a working Laravel app with Livewire 3.5+ installed, Vite (the standard Laravel
> setup), and Node available. If Livewire isn't installed yet, run `composer require livewire/livewire`
> first and confirm a Livewire component renders before continuing.

---

## Step 1 — Install the PHP package

```bash
composer require ethanbarlo/mesh
```

The service provider (`EthanBarlo\Mesh\MeshServiceProvider`) is auto-discovered; there is no
config to publish.

## Step 2 — Install React in the host app

```bash
npm install react react-dom
npm install -D @types/react @types/react-dom @vitejs/plugin-react
```

## Step 3 — Add the React plugin and the `@mesh` alias to Vite

Edit `vite.config.js` (or `.ts`). Add `@vitejs/plugin-react` and an alias pointing `@mesh` at
the package's shipped TypeScript source in `vendor/`:

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.ts',
                // Every Mesh component file must also be listed here (see Step 6).
                'resources/js/components/Counter.tsx',
            ],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@mesh': path.resolve(__dirname, 'vendor/ethanbarlo/mesh/resources/js'),
        },
    },
});
```

If you use TypeScript path checking, mirror the alias in `tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "paths": {
      "@mesh": ["vendor/ethanbarlo/mesh/resources/js/index.ts"],
      "@mesh/*": ["vendor/ethanbarlo/mesh/resources/js/*"]
    }
  }
}
```

## Step 4 — Initialize Mesh in your JS entrypoint

Mesh hooks into Livewire's lifecycle, so it must run **before** `Livewire.start()`. That means
you bundle Livewire yourself rather than letting `@livewireScripts` inject it.

Edit `resources/js/app.ts`:

```ts
import { Livewire, Alpine } from '../../vendor/livewire/livewire/dist/livewire.esm';
import { initMesh } from '@mesh';
import reactRenderer from '@mesh/react';

initMesh(Livewire, {
    renderers: [reactRenderer],
    debug: true, // logs "Mesh | ..." during development; remove in production
});

Livewire.start();
```

## Step 5 — Update your layout

In your Blade layout (`<head>`/`<body>`), use `@vite` to load your bundle and
`@livewireScriptConfig` — **not** `@livewireScripts` (that would load and start Livewire before
your `app.ts` runs, so Mesh would never register its hooks).

```blade
<head>
    @livewireStyles
    @vite(['resources/css/app.css', 'resources/js/app.ts'])
</head>
<body>
    {{ $slot }}
    @livewireScriptConfig
</body>
```

## Step 6 — Write a React component and register it

Create `resources/js/components/Counter.tsx`. Each Mesh component file **must** call
`registerComponent(renderer, path, Component)` where `path` is exactly the string the PHP side
returns from `component()`, and the file **must** be listed in the Vite `input` array (Step 3).

```tsx
import { registerComponent } from '@mesh';
import { useEntangle } from '@mesh/react';

function Counter({ initialCount }: { initialCount: number }) {
    const [count, setCount] = useEntangle<number>('count');
    return (
        <div>
            <button onClick={() => setCount(count - 1)}>-</button>
            <span>{count}</span>
            <button onClick={() => setCount(count + 1)}>+</button>
        </div>
    );
}

registerComponent('react', 'resources/js/components/Counter.tsx', Counter);
export default Counter;
```

## Step 7 — Create the Livewire (Mesh) component

```php
<?php

namespace App\Livewire;

use EthanBarlo\Mesh\MeshComponent;
use Livewire\Attributes\Modelable;

class ReactCounter extends MeshComponent
{
    #[Modelable] // enables wire:model two-way binding from a parent
    public int $count = 0;

    public function component(): string
    {
        // Must match the path passed to registerComponent() in the .tsx file.
        return 'resources/js/components/Counter.tsx';
    }

    public function props(): array
    {
        return ['initialCount' => $this->count];
    }
}
```

## Step 8 — Render it and run

```blade
<livewire:react-counter wire:model="count" />
```

```bash
npm run dev      # or: npm run build
php artisan serve
```

Open the page: the React component should mount inside the Livewire component, and
`useEntangle('count')` keeps React state and the `count` Livewire property in sync both ways.

---

## Common pitfalls checklist

- **Used `@livewireScripts`** instead of `@livewireScriptConfig` → Livewire starts before Mesh
  hooks are registered; nothing mounts. Use `@livewireScriptConfig` and `Livewire.start()` in JS.
- **Component file not in Vite `input`** → its asset is never built/registered; the console shows
  `component "<path>" ... did not register`.
- **Forgot `registerComponent(...)`** in the `.tsx` file → same "did not register" error.
- **Path mismatch** → the string in `component()` (PHP) must be byte-for-byte identical to the
  first-after-renderer argument of `registerComponent()`.
- **`@mesh` alias missing/wrong** → Vite can't resolve `@mesh` / `@mesh/react` imports.
- **Missing `@vitejs/plugin-react`** → `.tsx` files fail to compile.
- **Props not JSON-serializable** → `props()` must return values that survive `json_encode`.
