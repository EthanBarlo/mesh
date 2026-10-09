// `@mesh/svelte`. The default export is a lazy renderer descriptor: importing
// it (as app.ts does) doesn't pull Svelte's runtime into the entry chunk.
// Svelte and the renderer load the first time a Svelte island mounts.
import { createSvelteRenderer } from "./factory";

const svelteRenderer = /* @__PURE__ */ createSvelteRenderer();

export default svelteRenderer;
export { svelteRenderer, createSvelteRenderer };
export type { SvelteRendererOptions } from "./factory";

export { renderSlotHtml, type SvelteSlot } from "./slot";

export { LivewireComponentKey, useLivewireComponent } from "./context";

export { default as useWire } from "./composables/useWire";
export { useEntangle } from "./composables/useEntangle.svelte";
export {
    useErrorBag,
    type ErrorBagItem,
} from "./composables/useErrorBag.svelte";
