# Slots

Blade content placed inside a `<mesh:…>` tag flows into the React component: the default slot as `children`, named slots on a `slots` prop. The PHP class needs nothing extra — capturing slots is automatic.

## Default slot → `children`

Everything between the opening and closing tags (not wrapped in a named slot) becomes the React `children` prop:

```blade
{{-- resources/views/livewire/pages/example.blade.php --}}
<mesh:card>Hello <strong>{{ $name }}</strong></mesh:card>
```

```tsx
// resources/js/mesh/Card/index.tsx
export default function Card({ children }: { children?: React.ReactNode }) {
    return <div className="card">{children}</div>;
}
```

## Named slots → `slots.<name>`

Wrap content in `<livewire:slot name="…">`. Named slots arrive together on a `slots` prop, keyed by name; the rest stays in `children`. Use the `name="title"` form — Livewire 4 has no `:title` slot shorthand.

Full pair from the demo app's Card:

```blade
{{-- resources/views/livewire/pages/slots.blade.php --}}
<mesh:slots.card variant="cyan">
    <livewire:slot name="title">{{ strtoupper($name) }}</livewire:slot>

    <p>Hello <span class="font-semibold">{{ $name }}</span></p>

    <livewire:slot name="footer">
        Rendered for &ldquo;{{ $name }}&rdquo; by the server.
    </livewire:slot>
</mesh:slots.card>
```

```php
<?php
// app/Mesh/Slots/Card.php

namespace App\Mesh\Slots;

use EthanBarlo\Mesh\Component;

class Card extends Component
{
    public string $variant = 'default';

    public function props(): array
    {
        return [
            'variant' => $this->variant,
        ];
    }
}
```

```tsx
// resources/js/mesh/Slots/Card/index.tsx
import React from "react";

const Card = ({
    variant,
    children,
    slots,
}: {
    variant: string;
    children?: React.ReactNode;
    slots?: { title?: React.ReactNode; footer?: React.ReactNode };
}) => (
    <section className={`card card-${variant}`}>
        {slots?.title && (
            <header>
                <h3>{slots.title}</h3>
            </header>
        )}
        <div>{children}</div>
        {slots?.footer && <footer>{slots.footer}</footer>}
    </section>
);

export default Card;
```

Guard named slots with `slots?.title && …` — Mesh only passes named slots that were actually provided (and skips whitespace-only ones), so each entry is optional.

## How it works

The Blade view renders slot content into a hidden `[data-mesh-slots]` holder that Livewire keeps current via normal morphing; Mesh observes that holder and mirrors each slot's HTML into the React tree with `dangerouslySetInnerHTML`. Slot content is therefore **reactive to the server**: when a Livewire re-render changes a slot (e.g. a slot interpolating parent state via `wire:model.live`), Mesh replaces the mirrored HTML in place — the island itself never remounts. Props-only updates leave slot node references stable, so React skips unchanged slot subtrees.

## Limitations (v1)

- Slot content is **static server HTML** — mirrored markup, not hydrated components. It updates on server re-renders but carries no client behaviour of its own.
- **Nested interactive Livewire or Alpine inside a slot is NOT supported.** It would run in the hidden holder and render dead in the React copy. Decision rule: anything interactive inside a Mesh component goes in as **its own Mesh component** or as **props** — never inside a slot.
- **Security:** slots are injected with `dangerouslySetInnerHTML`. Blade-escaped `{{ }}` content is safe; `{!! !!}` (or any unescaped output) lands as raw HTML — never put unsanitised user input in a slot.

## Reserved prop names: `children` and `slots`

Mesh throws (fail-fast, on every render) when `props()` collides with slot content:

- `props()` returns a `children` key while **any** slot is present →
  ``Mesh: `children` is reserved for slot content — rename the prop from props().``
- `props()` returns a `slots` key while **named** slots are present →
  ``Mesh: `slots` is reserved for named slot content — rename the prop from props().``

A `slots` prop is fine when only the default slot is used — Mesh only passes the `slots` prop for named slots.

```php
// THROWS at render time — `children` collides with the slot content:
public function props(): array
{
    return ['children' => $this->items]; // rename to e.g. 'items'
}
```

```blade
<mesh:card>This default slot makes the props() above throw.</mesh:card>
```

## Typing the React side

Always type slots as optional `React.ReactNode`:

```tsx
type CardProps = {
    children?: React.ReactNode;
    slots?: {
        title?: React.ReactNode;
        footer?: React.ReactNode;
    };
};
```
