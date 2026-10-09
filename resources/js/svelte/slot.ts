import { createRawSnippet, type Snippet } from "svelte";

// A Mesh slot in Svelte is a snippet: a stable reference the core can hold
// onto across props-only updates, re-rendered by the component wherever it
// does `{@render ...}`.
export type SvelteSlot = Snippet;

// Slot content is mirrored as static HTML. A wrapper element is unavoidable
// (createRawSnippet must render a single root element); `display: contents`
// drops the wrapper box so it doesn't affect layout.
//
// Security: `html` is server-rendered slot content from Blade. Blade escapes
// `{{ }}` interpolation, so it is safe by default; only `{!! … !!}` (or other
// unescaped output) injects raw HTML, which is the caller's responsibility —
// never pass unsanitised user input through a slot.
export const renderSlotHtml = (html: string): SvelteSlot =>
    createRawSnippet(() => ({
        render: () => `<div style="display: contents">${html}</div>`,
    }));
