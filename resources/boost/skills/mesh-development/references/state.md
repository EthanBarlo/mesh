# State Synchronization Deep Dive

Mesh shares state between React islands and their Livewire component through three channels: `useEntangle` (two-way), props (server → React, per render), and `wire.$watch` (server → React, callback). This file covers their exact semantics.

## `useEntangle<T>(key, live?)`

```ts
import { useEntangle } from "@mesh/react";

const [value, setValue] = useEntangle<T>("propertyName");        // deferred (default)
const [value, setValue] = useEntangle<T>("propertyName", true);  // live
```

- Returns a `useState`-style pair: `[T, React.Dispatch<React.SetStateAction<T>>]`. Drops into existing React code; functional updates (`setValue(v => v + 1)`) work, and the updater receives the value Livewire currently holds.
- `key` is the name of a **public** property on the Livewire component. Type parameter defaults to `string`.
- Sync is **both directions**:
  - **Out**: only the returned setter writes. It calls `wire.$set(key, next, live)`, and only when `next !== wire.$get(key)`.
  - **In**: the hook registers `wire.$watch(key, …)`, so server-driven changes (e.g. a Livewire action mutating the property) update React state and re-render. The watcher is removed on unmount and when `key` changes.

### Deferred vs. live, mechanically

`live` maps directly to Livewire's `$wire.$set(key, value, live)`:

- **Deferred (default)** — React state updates instantly; the property is marked dirty client-side and is **batched with the next Livewire network request** (any `wire.$call`, a live update, `$refresh`, or an explicit `$commit`). No round-trip happens just from typing.
- **Live (`true`)** — every change triggers its own round-trip immediately. Use when the server must react per change (live validation, dependent fields).

### Behaviour worth knowing (from the hook source)

- **Nothing is sent on mount.** The initial value is read with `wire.$get(key)`; the hook never writes it back. A live binding costs no request until the user changes the value.
- **Server pushes are never echoed.** A `$watch` update goes straight into React state without calling `$set`, so a server-driven change doesn't trigger another request, even in live mode.
- **Writes compare by identity (`!==`).** Setting the value Livewire already holds sends nothing. Replace objects and arrays instead of mutating them in place, or the change is never sent.
- **`key` changes are handled**: the old watcher is removed and state is reseeded from `wire.$get(newKey)`. Still, prefer a fixed `key` per component.
- **`live` is read when the setter runs**, so changing it applies from the next write.

React's StrictMode (on by default in Mesh's React renderer) mounts effects twice in development; the hook cleans up its watcher, so this doesn't stack watchers. Apply the same rule to your own `$watch` calls (see below).

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

    // Return the unwatch function so the effect cleans up after itself.
    useEffect(
        () =>
            wire.$watch("status", (status: string) => {
                if (status === "done") confetti();
            }),
        [wire],
    );

    return null;
}
```

The callback fires whenever the Livewire property changes, including changes the server makes. `$watch` returns an unwatch function (typed `() => void`). Always return it from the effect: Mesh renders React islands in `StrictMode` by default, which runs effects twice in development, so an effect without cleanup registers the watcher twice and the callback fires twice per change. Livewire also removes every watcher when the component is torn down. In Vue, pass the unwatch to `onUnmounted`; in Svelte, to `onDestroy`.

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
