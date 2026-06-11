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
| `$call`, `$refresh`, `$commit`, `$set(key, v, true)`, `$toggle(key, true)`, `$upload`, `$uploadMultiple`, `$removeUpload` | `$get`, `$set(key, v, false)`, `$watch`, `$on` |

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

### `$set(key, value, live): void`

Sets a Livewire property. The third argument controls the commit: `live: true` sends the update to the server immediately; `live: false` defers it — the new value piggybacks on the next request (`$call`, `$commit`, `$refresh`, …). For two-way binding prefer `useEntangle`; `$set` is the imperative form.

```tsx
wire.$set("name", "Ada", false); // deferred — sent with the next request
wire.$set("query", q, true);     // live — network request now
```

### `$toggle(key, live): void`

Boolean flip of a property; same `live` semantics as `$set`.

### `$watch(key, callback): void`

Runs the callback whenever the property changes — including changes the **server** makes. This is the inbound channel for server-owned state (PriceWatcher pattern):

```tsx
// resources/js/mesh/Wire/PriceWatcher/index.tsx
useEffect(() => {
    wire.$watch("price", (value: number) => {
        setHistory((prev) => [...prev, value].slice(-40));
    });
}, [wire]);

// Outbound: React only schedules the server-side tick.
useEffect(() => {
    const id = window.setInterval(() => void wire.$call("tick"), 2000);
    return () => window.clearInterval(id);
}, [wire]);
```

### `$commit(): void`

Sends all deferred property updates to the server now, without calling a method. Use after a batch of `$set(..., false)` calls.

### `$refresh(): Promise<void>`

Forces a server round-trip and re-render. `props()` re-runs and the island receives fresh props (no remount — local React state survives).

### `$dispatch(event, params)` / `$dispatchTo(component, event, params)` / `$dispatchSelf(event, params)`

Dispatch onto Livewire's event bus — any component with a matching listener hears it, React island or plain Livewire alike. Listen on the React side with `wire.$on(event, callback)`.

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

### `$upload(name, file, finish, error, progress)` / `$uploadMultiple(name, files, ...)` / `$removeUpload(name, tmpFilename, finish, error)`

Streams a `File` into a Livewire property (the PHP class needs `use WithFileUploads;`). `finish(response)` fires when the temp upload lands, `error(response)` on transport failure or server-side validation rejection (validation messages also land in the error bag — read via `useErrorBag()`), and `progress(event)` receives `event.detail.progress` as 0–100. `$removeUpload` deletes the temp file server-side.

```tsx
// resources/js/mesh/Uploads/Dropzone/index.tsx (condensed)
wire.$upload(
    "photo",
    file,
    async () => {
        const info = await wire.$call("inspect"); // re-validates, returns metadata
        setMeta(info);
    },
    () => setStatus("error"),
    (event) => setProgress(event.detail.progress),
);

// Later: remove the temp file (tmpFilename came back from the server)
wire.$removeUpload("photo", meta.tmpFilename, () => {}, () => {});
```

```php
// app/Mesh/Uploads/Dropzone.php
use Livewire\WithFileUploads;

#[Validate('image|max:2048')]
public $photo = null; // validated the moment the temp upload lands
```

### Other members

`$parent` (parent component's wire or `null`), `$el` (root element), `$id` (component ID), `$hook(event, callback)` (Livewire lifecycle hooks), `__instance` (the raw `LivewireComponent`).

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
