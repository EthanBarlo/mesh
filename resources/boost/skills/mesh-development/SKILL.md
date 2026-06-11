---
name: mesh-development
description: Build and modify Mesh components — React frontends for Livewire 4 components. Use when creating components in app/Mesh or resources/js/mesh, using <mesh:*> Blade tags, the useEntangle/useWire/useErrorBag hooks, or debugging Mesh mount/sync issues.
---

# Mesh Development

## Mental model

A Mesh component is one logical component with two halves: a Livewire class in `app/Mesh/` that owns all server state, and a React component in `resources/js/mesh/` that renders it. Data crosses the boundary through three channels:

| Channel | Direction | Reactivity | Use for |
| --- | --- | --- | --- |
| `props()` | server → frontend | Snapshot per render — **not reactive** | Initial/server-computed read-only data |
| `useEntangle(key)` | two-way | Reactive | User-editable state, anything both sides read |
| `wire.$call(method, ...args)` | frontend → server | Promise resolves with return value | Actions, form submits, server work |

## Creating a component

Always scaffold with the artisan command — never hand-create the file pair:

```bash
php artisan make:mesh Counter
php artisan make:mesh Forms/Input   # nested: App\Mesh\Forms\Input
```

This generates both halves with guaranteed-matching names (minimal stubs — shown here filled in):

```php
// app/Mesh/Counter.php
namespace App\Mesh;

use EthanBarlo\Mesh\Component;

class Counter extends Component
{
    public int $count = 0;

    public function props(): array
    {
        return ['label' => 'Clicks'];
    }
}
```

```tsx
// resources/js/mesh/Counter/index.tsx
import { useEntangle } from "@mesh/react";

export default function Counter({ label }: { label: string }) {
    const [count, setCount] = useEntangle<number>("count");
    return <button onClick={() => setCount(count + 1)}>{label}: {count}</button>;
}
```

Render it in any Blade view:

```blade
<mesh:counter />
<mesh:forms.input />        {{-- nested components use dots --}}
<mesh:counter :count="5" /> {{-- public properties accept attributes like any Livewire component --}}
```

Only `index.{tsx,jsx,vue,svelte}` is treated as the component entry. Co-located helper files (hooks, types, subcomponents) in the same folder are ignored by discovery — use them freely.

## Pitfall #1: ID matching is exact and case-sensitive

Components are auto-discovered (no registration). The PHP class and the frontend folder must derive the **identical** id:

| PHP class | Frontend entry | Derived id |
| --- | --- | --- |
| `App\Mesh\Counter` | `resources/js/mesh/Counter/index.tsx` | `Counter` |
| `App\Mesh\Forms\Input` | `resources/js/mesh/Forms/Input/index.tsx` | `Forms/Input` |

- `resources/js/mesh` is **hardcoded** — not configurable. Components elsewhere are silently ignored.
- Both sides are StudlyCase. A case mismatch (`counter/` vs `Counter.php`) **works on macOS but breaks on Linux/CI** because macOS filesystems are case-insensitive. When a component fails to mount, compare the namespace path and folder path character-for-character first.

## Pitfall #2: props are snapshots — don't mirror them into state

`props()` runs once per Livewire render. Its values do not update in React unless the Livewire component re-renders, and they are never written back.

- Server-computed, read-only display data → `props()`
- Anything the user edits, or that must stay current → `useEntangle`
- **Anti-pattern:** `const [value] = useState(propValue)` — the prop is already a frozen snapshot; copying it into state guarantees staleness. Entangle the underlying Livewire property instead.

## Pitfall #3: entangle is deferred by default

```tsx
const [name, setName] = useEntangle<string>("name");        // deferred
const [slug, setSlug] = useEntangle<string>("slug", true);  // live
```

- **Deferred** (default): React state updates instantly; the server sees the change bundled with the *next* Livewire request (a `$call`, a live update, etc.). Right for most form fields.
- **Live** (`true`): every change triggers a server round-trip immediately. Use only when the server must react per change — live validation, dependent fields.
- `wire.$commit()` flushes deferred changes to the server right now.

## Server actions, events, validation

```tsx
const wire = useWire();
const errors = useErrorBag(); // validation errors, auto-updates after each request

const result = await wire.$call("save");   // calls the PHP method, resolves with its return value
wire.$dispatch("order-shipped", { id });   // dispatch a Livewire event
```

No routes, controllers, or fetch needed. See `references/wire-api.md` for the full `$wire` surface and `references/forms-and-validation.md` for the complete form pattern.

## Pitfall #4: slots are static HTML

Blade slot content is forwarded into React as `children` (default slot) and `slots.{name}` (named slots, via `<livewire:slot name="...">`):

```blade
<mesh:card>
    <livewire:slot name="title">My Card</livewire:slot>
    Body content here.
</mesh:card>
```

- Slot content renders **statically** from server HTML. Nested interactive Livewire or Alpine inside a slot is **not supported** (v1) — it renders dead. Pass interactive pieces as their own Mesh components or as props instead.
- `children` and `slots` are **reserved**: returning `children` from `props()` throws when any slot is present; returning `slots` throws when named slots are present.

See `references/slots.md` for details.

## Pitfalls checklist

Before debugging anything else, verify:

- [ ] PHP class path and `resources/js/mesh/` folder path match **exactly**, including case
- [ ] Frontend entry is named `index.tsx` (or `.jsx`/`.vue`/`.svelte`) — renderer is inferred from the extension; unknown extensions throw
- [ ] `@livewireScriptConfig` is in the Blade layout (not in app.ts) — without it Livewire never starts
- [ ] Vite config has the `@mesh` alias pointing at `/vendor/ethanbarlo/mesh/resources/js`
- [ ] You're not expecting a prop to be reactive (use entangle) or expecting deferred entangle to hit the server per keystroke (pass `true`)
- [ ] `props()` doesn't return `children` or `slots`
- [ ] Pass `debug: true` to `initMesh()` to get discovery/mount logs in the browser console

## Real-world examples

The Mesh repository ships a demo app at `apps/demo-react` (github.com/EthanBarlo/mesh) covering patterns beyond this skill — consult it rather than inventing an approach:

- `Counter` — minimal two-way binding
- `State/EntangleModes` — deferred vs live sync side by side
- `Wire/ServerActions` — `$call` with loading state
- `Wire/PriceWatcher` — reacting to server pushes with `$watch`
- `Wire/EventBridge` — Livewire events across components
- `Forms/ProjectForm` — validation, error bag, live slug field
- `Uploads/Dropzone` — file uploads via `$upload`
- `Charts/RevenueChart`, `Table/OrdersTable`, `Board/Kanban` — integrating ECharts, TanStack Table, dnd-kit
- `Kanban/Card` + `Kanban/Column` — composing Mesh components
- `Slots/Card` — default + named slots

## References

Read these when the task goes deeper than this file:

- `references/state.md` — full `useEntangle` semantics, `$watch`, `$commit`, props lifecycle
- `references/wire-api.md` — every `$wire` method with examples (`$call`, `$get`, `$set`, `$dispatch`, `$upload`, …)
- `references/forms-and-validation.md` — complete form pattern: entangled fields, live validation, `useErrorBag`, submit
- `references/slots.md` — default/named slots, consuming them in React, limitations
- `references/setup-and-troubleshooting.md` — host-app installation and the failure → cause → fix matrix
