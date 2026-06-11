# Mesh

> A React + Livewire 4 islands bridge. Render interactive framework components inside Livewire, with props flowing across the boundary.

## What it does

Mesh lets you drop a React (or Vue/Svelte) component into a Livewire view and treat it as an island. Livewire owns the server state; Mesh hands props across the bridge and mounts the component.

## Install

```bash
composer require ethanbarlo/mesh
```

See [INSTALL.md](INSTALL.md) for the full host-app setup (Vite alias, `app.ts`, Livewire start).

## Quick example

### 1. The PHP component

```php
<?php

namespace App\Mesh;

use EthanBarlo\Mesh\Component;

class Counter extends Component
{
    public function props(): array
    {
        return [
            'start' => 0,
        ];
    }
}
```

### 2. The React component

A component is a folder whose `index.{tsx,jsx}` default-exports it.

```tsx
// resources/js/mesh/Counter/index.tsx
import { useState } from 'react'

export default function Counter({ start }: { start: number }) {
  const [count, setCount] = useState(start)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### 3. Wire up `app.ts`

There is no per-component registration and nothing to declare for components. Mesh auto-discovers
every component under `resources/js/mesh` and code-splits each into its own async chunk, loaded on
first render. You only register your renderers:

```ts
// resources/js/app.ts
import { Livewire, Alpine } from '../../vendor/livewire/livewire/dist/livewire.esm'
import { initMesh } from '@mesh'
import reactRenderer from '@mesh/react'

initMesh(Livewire, {
  renderers: [reactRenderer],
  debug: true,
})

Livewire.start()
```

### 4. Render in Blade

```blade
<mesh:counter />
```

## Documentation

- [Installation](docs/installation.mdx)
- [Building components](docs/guides/building-components.mdx)
- [`Mesh\Component` API](docs/api/mesh-component.mdx)
- [Renderers (React/Vue/Svelte)](docs/advanced/renderers.mdx)
- [Troubleshooting](docs/advanced/troubleshooting.mdx)

## Laravel Boost

Mesh ships AI guidelines and a `mesh-development` agent skill for [Laravel Boost](https://github.com/laravel/boost). If your app has Boost installed, `php artisan boost:install` (or `boost:update --discover`) picks them up automatically, teaching AI coding agents Mesh's conventions — component scaffolding, ID matching, entangle modes, and slots.

## Requirements

- PHP 8.2+, Laravel 11+
- Livewire 4
- Node with Vite (host app)

## License

MIT

## Why an alias instead of npm?

The frontend lives in the Composer package so the PHP and JS ship together and can never drift in version. The `@mesh` alias points Vite at `vendor/ethanbarlo/mesh/resources/js`. There is no separate npm install step for the runtime.

## Component ids

A component's **id** is a simple string, derived identically on both sides. The PHP `component()`
method derives it from the class name relative to `App\Mesh` (`App\Mesh\Counter` → `Counter`,
`App\Mesh\Forms\Input` → `Forms/Input`), and the JS registry derives the same id from the folder
path under the fixed `resources/js/mesh` directory. Because `make:mesh` StudlyCases both the class
segments and the folder names, the two always agree. See [building components](docs/guides/building-components.mdx) for details.
