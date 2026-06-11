# Forms and Validation

The Mesh form pattern: Livewire owns the data and the validation rules; React owns the UI. Fields are entangled properties, submit is `await wire.$call('save')`, and errors flow back through `useErrorBag()`.

## The full recipe

```php
<?php
// app/Mesh/Forms/ProjectForm.php

namespace App\Mesh\Forms;

use EthanBarlo\Mesh\Component;
use Livewire\Attributes\Validate;

class ProjectForm extends Component
{
    #[Validate('required|min:3')]
    public string $name = '';

    #[Validate('required|regex:/^[a-z0-9-]+$/|min:3')]
    public string $slug = '';

    #[Validate('required|email')]
    public string $email = '';

    // Live-entangled on the React side, so this hook runs per keystroke.
    public function updatedSlug(): void
    {
        $this->validateOnly('slug');
    }

    public function save(): array
    {
        $this->validate(); // throws ValidationException on failure

        $project = Project::create([/* ... */]);

        // The returned payload resolves the $call promise in React.
        return ['ok' => true, 'project' => $project->only(['id', 'name', 'slug'])];
    }
}
```

```tsx
// resources/js/mesh/Forms/ProjectForm/index.tsx
import React, { useState } from "react";
import { useEntangle, useErrorBag, useWire } from "@mesh/react";

interface SaveResult {
    ok: boolean;
    project: { id: string; name: string; slug: string };
}

export default function ProjectForm() {
    // Deferred (default): batched into the next request — i.e. the submit.
    const [name, setName] = useEntangle<string>("name");
    const [email, setEmail] = useEntangle<string>("email");
    // Live: every change round-trips, so updatedSlug() validates per keystroke.
    const [slug, setSlug] = useEntangle<string>("slug", true);

    const errors = useErrorBag();
    const wire = useWire();
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // never let the browser submit
        setSubmitting(true);
        try {
            // Resolves with null/undefined when server validation fails;
            // rejects only on transport/server errors (network, 5xx).
            const res = (await wire.$call("save")) as SaveResult | null | undefined;
            if (res?.ok) {
                // success — errors is now {} and useErrorBag re-rendered
            }
        } catch {
            // transport failure — validation messages still come via useErrorBag()
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <input value={name} onChange={(e) => setName(e.target.value)} />
            {errors.name && <p role="alert">{errors.name[0]}</p>}

            <input value={slug} onChange={(e) => setSlug(e.target.value)} />
            {errors.slug && <p role="alert">{errors.slug[0]}</p>}

            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <p role="alert">{errors.email[0]}</p>}

            <button type="submit" disabled={submitting}>Save</button>
        </form>
    );
}
```

## `useErrorBag()` — exact semantics

```ts
const errors = useErrorBag(); // Record<string, string[]>
```

- **Shape**: a plain object keyed by property name; each value is an **array of message strings** (`{ slug: ["The slug field format is invalid."] }`). Keys with no error are **absent** (`errors.slug` is `undefined`), so render with `errors.slug && errors.slug[0]` or `errors.slug?.[0]`.
- **Source**: Livewire's snapshot (`memo.errors`). Only errors attached to real component properties survive dehydration — errors from ad-hoc `Validator::make` keys that aren't properties are dropped.
- **When it updates**: after **every** completed Livewire request (the hook listens to the `commit` → `succeed` hook). A request whose action failed validation is still a *succeeded commit* (HTTP 200), so failed `$call`s populate the bag immediately. Initial value is seeded from the first snapshot, so server-rendered errors show on mount.
- **How errors clear**: the bag is replaced wholesale each request. The next request in which a property passes validation (e.g. `validateOnly` on a fixed field, or a successful `save()`) returns a snapshot without that key, and the component re-renders with it gone. There is no client-side `clear` API — clearing happens by re-validating server-side.

## Live per-field validation

Two pieces, one per side:

1. **React**: entangle the field live — `useEntangle<string>("slug", true)`. Every change triggers its own request.
2. **PHP**: add an `updatedSlug()` hook that calls `$this->validateOnly('slug')`. Livewire runs `updated{Property}` after the client value is applied, so each keystroke validates *only* that field — other fields' errors are untouched, and the slug's error appears/disappears as the user types.

Deferred fields also fire their `updatedFoo()` hooks, but only when the change is actually committed (i.e. alongside the submit) — so per-keystroke validation requires `live = true`.

## Deferred fields + submit: no manual commit

Deferred entangled values are marked dirty client-side and **batched into the next Livewire request, whichever it is** — and `wire.$call('save')` is such a request. Server-side, Livewire applies property updates *before* invoking the method, so `save()` always sees the latest typed values. Do **not** call `wire.$commit()` before `$call`; that's an extra wasted round-trip.

## What `$call` does on validation failure (verified)

For a normal component method, `$this->validate()` throwing `ValidationException` is caught by Livewire on the server: the error bag is set, the request completes normally, and the call's return slot is `null`. Client-side the promise **resolves with `null`/`undefined` — it does not reject**. So:

- Branch on the resolved value (`if (res?.ok)`), not on try/catch, to detect validation failure.
- Keep a `try/catch/finally` anyway: the promise **does** reject on network failures and non-200 responses, and you must reset `submitting` in `finally` either way.
- Returning an explicit payload like `['ok' => true, ...]` from the action makes the success branch unambiguous.

## Common mistakes

- **Validating only in React.** Client checks are UX sugar; the entangled values land on Livewire properties and must be validated there (`#[Validate]` + `$this->validate()`). Always send `noValidate` on the form if you render your own messages.
- **Assuming `$call` rejects on validation failure.** It resolves with `null` (see above). Code that only has a `catch` branch will treat failed validation as success.
- **Forgetting `event.preventDefault()`** in the submit handler — the browser performs a full-page form submission and the Livewire request never finishes.
- **Mirroring entangled values into `useState`.** `useEntangle` *is* React state already. A second copy desyncs from server-driven changes and skips the dirty-tracking that makes deferred submit work. Derive, don't duplicate.
- **Calling `wire.$commit()` before `$call`.** Redundant; deferred updates ride along with the call request.
- **Validating everything on keystroke.** `updatedSlug()` + `validateOnly('slug')` keeps live validation scoped; calling `$this->validate()` in an `updated` hook flags untouched fields as the user types the first one.
