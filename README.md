# Mesh

Render React (and, in future, other frameworks) as the frontend of your Livewire components.

Mesh is a thin bridge: a Livewire component declares which frontend component to render and
what props to pass, and Mesh mounts that component into the page, keeping React state and
Livewire state in sync. State stays on the server with Livewire; the view layer is React.

```php
// app/Livewire/ReactCounter.php
use EthanBarlo\Mesh\MeshComponent;
use Livewire\Attributes\Modelable;

class ReactCounter extends MeshComponent
{
    #[Modelable]
    public int $count = 0;

    public function component(): string
    {
        return 'resources/js/components/Counter.tsx';
    }

    public function props(): array
    {
        return ['initialCount' => $this->count];
    }
}
```

```tsx
// resources/js/components/Counter.tsx
import { registerComponent } from "@mesh";
import { useEntangle } from "@mesh/react";

function Counter({ initialCount }: { initialCount: number }) {
    const [count, setCount] = useEntangle<number>("count");
    return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

registerComponent("react", "resources/js/components/Counter.tsx", Counter);
export default Counter;
```

```blade
<livewire:react-counter wire:model="count" />
```

## Documentation

Full documentation lives in [`docs/`](docs) as Markdown, served by the Fumadocs site in
[`apps/docs/`](apps/docs) (`cd apps/docs && npm install && npm run dev`).

## Installation

> Requires Livewire 4.

See **[INSTALL.md](INSTALL.md)** for full, copy-pasteable setup steps (it doubles as a guide an
AI assistant can follow to wire Mesh into a host app). In short:

```bash
composer require ethanbarlo/mesh
```

Then add the `@mesh` Vite alias, initialize Mesh in your `app.ts`, and register your components.

## How it works

1. A `MeshComponent` renders a small mount point carrying `data-mesh-component` (the build
   path), `data-mesh-props` (JSON props), and `data-mesh-asset` (the Vite-resolved asset URL).
2. `initMesh` hooks Livewire's `component.init` and `morph.updated` lifecycle. On init it lazily
   `import()`s the component's asset (which calls `registerComponent`), then mounts it into the
   `.mesh-root` element via the matching renderer.
3. On every Livewire update, changed props are pushed into the mounted component without
   remounting, so local component state is preserved.

## React hooks

All exported from `@mesh/react`:

- `useWire<T>()` — the Livewire `$wire` object (`$set`, `$get`, `$call`, `$watch`, `$dispatch`, …).
- `useEntangle<T>(key, live = false)` — two-way binding between React state and a Livewire property.
- `useErrorBag()` — the current validation error bag, updated after each Livewire request.
- `useLivewireComponent()` — the raw Livewire component instance.

## Renderers

Mesh is renderer-agnostic. `initMesh` takes a list of renderers; the React renderer is the
default export of `@mesh/react`. Additional renderers (Vue, Svelte, …) can implement the same
`MeshRenderer` contract and be added to the list.

## Demo

A runnable demo lives in [`apps/demo-react/`](apps/demo-react) — a small Laravel app rendering a React counter
two-way bound to a Livewire property.

## License

The MIT License (MIT). See [LICENSE.md](LICENSE.md).
