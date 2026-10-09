# useWire() / $wire API Reference

`useWire()` hands you the Livewire `$wire` object for the island's backing component — direct access to server methods, properties, events, and uploads from inside React.

## Getting the wire

```tsx
// resources/js/mesh/Example/index.tsx
import { useWire } from "@mesh/react";

// Type parameter extends $wire with your component's own methods/properties.
const wire = useWire<{ save: () => Promise<void>; name: string }>();
```

Must be called inside a component mounted by Mesh (reads the Livewire instance from React context; throws outside one).

Low-level escape hatch: `useLivewireComponent()` returns the raw Livewire component instance (`el`, `id`, `snapshot`, `$wire`, …) — prefer `useWire` unless you need the instance itself.

## Network vs local

| Triggers a server request | Local (no request) |
| --- | --- |
| `$call`, `$refresh`, `$commit`, `$set(key, v, true)`, `$toggle(key, true)`, `$upload`, `$uploadMultiple`, `$removeUpload` | `$get`, `$set(key, v, false)`, `$toggle(key, false)`, `$watch`, `$on`, `$hook` |

`$dispatch` / `$dispatchTo` / `$dispatchSelf` fire on the client-side event bus immediately; a round-trip happens only for components with a server-side `#[On]` listener.

## Methods

### `$call(method, ...args): Promise<any>`

Calls a public method on the PHP class and resolves with its return value — no route, no controller, no fetch. Arguments arrive as ordinary method parameters. The promise **rejects** on transport failures and non-200 responses (network errors, uncaught server exceptions), so wrap in try/catch when the call can fail. A **validation failure does not reject**: Livewire catches the `ValidationException`, the request completes normally, and the promise resolves with `null`/`undefined` while the messages land in `useErrorBag()` — see `references/forms-and-validation.md`.

```tsx
const result = (await wire.$call("analyze", text)) as AnalysisResult;
```

```php
// app/Mesh/Wire/ServerActions.php
public function analyze(string $text): array
{
    return ['words' => str_word_count($text), 'analyzedAt' => now()->format('H:i:s')];
}
```

### `$get(key): any`

Reads a Livewire property's current (client-side) value. Local, synchronous.

```tsx
const name = wire.$get("name");
```

### `$set(key, value, live = true): Promise<void>`

Sets a Livewire property. The third argument controls the commit: `live: true` sends the update to the server immediately; `live: false` defers it — the new value piggybacks on the next request (`$call`, `$commit`, `$refresh`, …). **Livewire defaults `live` to `true`**, so `$set(key, value)` without the third argument sends a request; pass it explicitly. The returned promise settles when that request completes (deferred: immediately). For two-way binding prefer `useEntangle`; `$set` is the imperative form.

```tsx
wire.$set("name", "Ada", false); // deferred — sent with the next request
wire.$set("query", q, true);     // live — network request now
```

### `$toggle(key, live = true): Promise<void>`

Boolean flip of a property; same `live` semantics (and default) as `$set`.

### `$watch(key, callback): () => void`

Runs the callback whenever the property changes — including changes the **server** makes — and returns an unwatch function. This is the inbound channel for server-owned state (PriceWatcher pattern). In React, return the unwatch from the effect: Mesh mounts React islands in `StrictMode` by default, so in development an effect without cleanup registers the watcher twice.

```tsx
// resources/js/mesh/Wire/PriceWatcher/index.tsx
useEffect(() => {
    return wire.$watch("price", (value: number) => {
        setHistory((prev) => [...prev, value].slice(-40));
    });
}, [wire]);

// Outbound: React only schedules the server-side tick.
useEffect(() => {
    const id = window.setInterval(() => void wire.$call("tick"), 2000);
    return () => window.clearInterval(id);
}, [wire]);
```

### `$commit(): Promise<void>`

Sends all deferred property updates to the server now, without calling a method. Use after a batch of `$set(..., false)` calls. The promise settles when the request completes.

### `$refresh(): Promise<void>`

Forces a server round-trip and re-render. `props()` re-runs and the island receives fresh props (no remount — local React state survives).

### `$dispatch(event, params?)` / `$dispatchTo(component, event, params?)` / `$dispatchSelf(event, params?)`

Dispatch a Livewire event. The params object's keys become the PHP listener's named arguments.

| Method | Heard by |
| --- | --- |
| `$dispatch` | Bubbles from this component's element up to `window`: every `#[On]` listener on the page, and `window` listeners |
| `$dispatchTo` | Only components with that Livewire name |
| `$dispatchSelf` | Only this component |

EventBridge pattern — both directions:

```tsx
// resources/js/mesh/Wire/EventBridge/index.tsx
// Outbound: React -> any Livewire component with #[On('mesh.ping')]
wire.$dispatch("mesh.ping", { message });
```

```php
// app/Mesh/Wire/EventBridge.php — inbound: page event -> PHP -> props -> React
#[On('page.ping')]
public function onPagePing(): void
{
    $this->received++; // re-render; props() re-runs; island gets fresh `received` prop
}

public function props(): array
{
    return ['received' => $this->received];
}
```

This is the default way to push something into an island: dispatch an event, handle it with `#[On]` on the island's own PHP class, and let `props()` carry the result.

### `$on(event, callback)`

Listens for a Livewire event in the browser; `callback` receives the event's params. It listens on **this component's own element**, so it only hears events that reach that element:

- events the component's PHP class dispatches (`$this->dispatch('saved')` in an action);
- `$dispatchSelf`, and `$dispatchTo` aimed at this component;
- the island's own `$dispatch` calls, and events bubbling up from components nested inside it.

It does **not** hear a `$dispatch` from a sibling or parent component: that event starts at the other component's element and bubbles to `window` without passing through this one. For those, add an `#[On]` method to the PHP class (above), or listen on `window`:

```tsx
useEffect(() => {
    const onMoved = (event: Event) => setLastMove((event as CustomEvent).detail);
    window.addEventListener("kanban.card-moved", onMoved);
    return () => window.removeEventListener("kanban.card-moved", onMoved);
}, []);
```

`$on` returns nothing, so its listener can't be removed. In Vue and Svelte (setup runs once) that's fine. In React, StrictMode runs effects twice in development, so instead of `$on` inside `useEffect`, add the listener to `wire.$el` yourself and remove it in the cleanup. `$dispatchTo` and `$dispatchSelf` events don't bubble, so they never reach `window`.

### `$upload(name, file, finish?, error?, progress?)` / `$uploadMultiple(name, files, ...)` / `$removeUpload(name, tmpFilename, finish?)`

Streams a `File` into a Livewire property (the PHP class needs `use WithFileUploads;`). The callbacks are optional (Livewire defaults them to no-ops):

- `finish(tmpFilename)` fires when the temp upload lands and the property is set (`$uploadMultiple` passes an array of filenames).
- `error()` fires only when the upload itself fails: a network error, an error response from the temporary-upload endpoint, or Livewire's own temporary-upload rules (`livewire.temporary_file_upload.rules`) rejecting the file. A rejection's message also lands in the error bag.
- **Your `#[Validate]` rules are not part of `error`.** They run when the property is set, in the same request that triggers `finish`. A file that fails them still calls `finish`; the message lands in `useErrorBag()` under the property name. Check the bag, or call an action that runs `$this->validate()`, before using the file (the Dropzone below does the latter).
- `progress(event)` receives `event.detail.progress` as 0–100.

Livewire's `$upload` returns nothing, so `await wire.$upload(...)` doesn't wait for the upload; do follow-up work in `finish`. `$removeUpload(name, tmpFilename, finish)` deletes the temp file server-side and clears it from the property; Livewire never calls an `error` callback for it.

```tsx
// resources/js/mesh/Uploads/Dropzone/index.tsx (condensed)
wire.$upload(
    "photo",
    file,
    async () => {
        // finish doesn't mean valid: inspect() runs $this->validate() and
        // resolves with null when the file breaks the rules.
        const info = await wire.$call("inspect");
        if (info) setMeta(info);
        else setStatus("error"); // errors.photo explains why
    },
    () => setStatus("error"),
    (event) => setProgress(event.detail.progress),
);

// Later: remove the temp file (tmpFilename came back from the server)
wire.$removeUpload("photo", meta.tmpFilename);
```

```php
// app/Mesh/Uploads/Dropzone.php
use Livewire\WithFileUploads;

#[Validate('image|max:2048')]
public $photo = null; // checked when the temp upload sets it; failures go to the error bag, not error()
```

### Other members

`$parent` (the closest parent component's wire, or `undefined` when there is none), `$el` (root element), `$id` (component ID), `$hook(event, callback)` (Livewire lifecycle hooks; returns an unhook function), `__instance` (the raw `LivewireComponent`). `$cancelUpload(name)` aborts an upload in progress.

## Pattern: server action with loading state

```tsx
// resources/js/mesh/Wire/ServerActions/index.tsx (condensed)
import { useState } from "react";
import { useWire } from "@mesh/react";

export default function ServerActions() {
    const wire = useWire();
    const [rolling, setRolling] = useState(false);
    const [roll, setRoll] = useState<{ dice: number[]; total: number } | null>(null);

    const handleRoll = async () => {
        if (rolling) return;          // guard double-fires
        setRolling(true);
        try {
            setRoll(await wire.$call("rollDice")); // PHP return value, typed by you
        } finally {
            setRolling(false);        // always clear loading, even on rejection
        }
    };

    return <button disabled={rolling} onClick={handleRoll}>{rolling ? "Rolling…" : "Roll dice"}</button>;
}
```
