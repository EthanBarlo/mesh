import { h, type VNodeChild } from "vue";

// A Mesh slot in Vue is a slot function: a stable closure the core can hold
// onto across props-only updates, returning a fresh vnode per render (vnodes
// are single-use, the closure is not).
export type VueSlot = () => VNodeChild;

// Slot content is mirrored as static HTML. A wrapper element is unavoidable
// (innerHTML needs a host element); `display: contents` drops the wrapper box
// so it doesn't affect layout.
//
// Security: `html` is server-rendered slot content from Blade. Blade escapes
// `{{ }}` interpolation, so it is safe by default; only `{!! … !!}` (or other
// unescaped output) injects raw HTML, which is the caller's responsibility —
// never pass unsanitised user input through a slot.
export const renderSlotHtml = (html: string): VueSlot => () =>
    h("div", { style: "display: contents", innerHTML: html });
