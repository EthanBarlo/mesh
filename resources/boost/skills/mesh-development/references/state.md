# State Synchronization Deep Dive

Mesh shares state between React islands and their Livewire component through three channels: `useEntangle` (two-way), props (server → React, per render), and `wire.$watch` (server → React, callback). This file covers their exact semantics.

## `useEntangle<T>(key, live?)`

```ts
import { useEntangle } from "@mesh/react";

const [value, setValue] = useEntangle<T>("propertyName");        // deferred (default)
const [value, setValue] = useEntangle<T>("propertyName", true);  // live
```

- Returns an exact `useState` pair: `[T, React.Dispatch<React.SetStateAction<T>>]`. Drops into existing React code; functional updates (`setValue(v => v + 1)`) work.
- `key` is the name of a **public** property on the Livewire component. Type parameter defaults to `string`.
- Sync is **both directions**:
  - **Out**: an effect calls `wire.$set(key, value, live)` whenever the React value changes.
  - **In**: the hook registers `wire.$watch(key, setValue)`, so server-driven changes (e.g. a Livewire action mutating the property) update React state and re-render.

### Deferred vs. live, mechanically

`live` maps directly to Livewire's `$wire.$set(key, value, live)`:

- **Deferred (default)** — React state updates instantly; the property is marked dirty client-side and is **batched with the next Livewire network request** (any `wire.$call`, a live update, `$refresh`, or an explicit `$commit`). No round-trip happens just from typing.
- **Live (`true`)** — every change triggers its own round-trip immediately. Use when the server must react per change (live validation, dependent fields).

### Gotchas (from the hook source)

- **Mount echo**: the `$set` effect also runs on mount, writing the seeded value back. Harmless — Livewire builds the commit payload by diffing client state against the server's canonical state, so echoing the unchanged value sends nothing extra.
- **`key` must be stable**: the initial value comes from a `useState(wire.$get(key))` initializer (runs once). Changing `key` after mount will not reseed state — React keeps the old key's value, and subsequent writes target the new key. Don't compute `key` dynamically.
- **Changing `live` after mount** is not reliably applied — it is not in the effect dependency array, so the new flag only takes effect on the next value change. Treat it as fixed at mount.
- **The watch effect has no cleanup**: the hook registers `$watch` without unwatching when the effect re-runs, so a changed `key` stacks an extra watcher. Livewire tears all watchers down when the component is removed. Fine for normal use; another reason to keep `key` fixed.
- **Server echoes count as changes**: a server-driven `$watch` update sets React state, which re-runs the `$set` effect (a no-op write of the same value).

## `wire.$commit()` — flush deferred changes

Pushes all dirty (deferred) properties to the server right now, without calling an action.

```tsx
// resources/js/mesh/SettingsForm/index.tsx
import { useEntangle, useWire } from "@mesh/react";

export default function SettingsForm() {
    const [name, setName] = useEntangle<string>("name"); // deferred
    const wire = useWire();

    return (
        <form onSubmit={(e) => { e.preventDefault(); wire.$commit(); }}>
            <input value={name ?? ""} onChange={(e) => setName(e.target.value)} />
            <button type="submit">Save</button>
        </form>
    );
}
```

Use it for explicit "save now" UX, or to force server `updated()` hooks to fire at a moment you choose instead of piggybacking on the next request. (Calling any server action via `wire.$call(...)` also flushes deferred changes as part of that request.)

## `wire.$watch(key, cb)` — react to server changes without entangling

When you only need to *observe* a server property (no client writes), skip `useEntangle` and watch directly:

```tsx
// resources/js/mesh/JobMonitor/index.tsx
import { useEffect } from "react";
import { useWire } from "@mesh/react";

export default function JobMonitor() {
    const wire = useWire();

    useEffect(() => {
        wire.$watch("status", (status: string) => {
            if (status === "done") confetti();
        });
    }, [wire]);

    return null;
}
```

The callback fires whenever the Livewire property changes server-side. `$watch` returns an unwatch function (Mesh's `Wire` type declares `void`, so cast if you need it), and Livewire cleans all watchers up when the component is removed — registering once in a mount effect is the normal pattern.

## Props lifecycle

- `props()` runs server-side **on every Livewire render** (mount and every subsequent request that re-renders the component). Each result is a serialized snapshot — values are plain JSON, not reactive references.
- Across Livewire requests the React island is **updated in place, not remounted**. All local React state — including entangled values and plain `useState` — persists.
- Server-side updates *do* reach React: a Livewire re-render re-runs `props()` and Mesh re-renders the island with the new props. So a prop like `'requests' => $this->requests` stays current after every round-trip, while sibling `useState` values survive untouched.
- Props are one-way. Mutating a prop-derived value in React never reaches the server — use `useEntangle` or `wire.$call` for that.

## Server hooks on entangled updates: `updated()` / `updatedFoo()`

Livewire's standard property hooks fire when an entangled value is **committed**, which depends on the mode (verified by the `State/EntangleModes` demo):

- **Live** binding: hooks fire on every change — each keystroke is its own request, so `updatedLiveMessage()` runs immediately per change.
- **Deferred** binding: hooks fire only when the dirty value reaches the server — on the next request (`$commit`, an action call, or a live update on a *sibling* property, which carries deferred changes along with it).

```php
<?php
// app/Mesh/State/EntangleModes.php (abridged from the demo)
namespace App\Mesh\State;

use EthanBarlo\Mesh\Component;

class EntangleModes extends Component
{
    public string $message = '';      // useEntangle("message")        — deferred
    public string $liveMessage = '';  // useEntangle("liveMessage", true) — live
    public int $requests = 0;

    public function updated(string $property): void
    {
        // Fires for any committed property — deferred ones only on the
        // request that actually delivers them.
        $this->requests++;
    }

    public function updatedLiveMessage(): void
    {
        // Fires per keystroke, because live updates commit immediately.
    }

    public function props(): array
    {
        return ['requests' => $this->requests];
    }
}
```

Note from the demo: one request can deliver several deferred properties at once — `updated()` then fires once per property within the same request. Use a non-persisted (`protected`) flag if you need per-request-once logic, since protected props reset every request.

## Decision table

| State kind | Channel |
|---|---|
| Server data React only displays, recomputed per render | `props()` |
| Value edited in React that the server needs eventually (form fields) | `useEntangle(key)` (deferred) + `wire.$commit()` or an action to save |
| Value edited in React the server must see per change (live validation, dependent queries) | `useEntangle(key, true)` |
| Server-driven value React only reacts to (side effects, not rendering) | `wire.$watch(key, cb)` |
| Ephemeral UI state (open/closed, hover, drafts the server never sees) | plain `useState` — persists across Livewire requests |
| Trigger server behavior with a result | `wire.$call("method", ...args)` (also flushes deferred props) |
