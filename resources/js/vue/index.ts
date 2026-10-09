// `@mesh/vue`. The default export is a lazy renderer descriptor: importing it
// (as app.ts does) doesn't pull Vue into the entry chunk. Vue and the
// renderer load the first time a Vue island mounts.
import { createVueRenderer } from "./factory";

const vueRenderer = /* @__PURE__ */ createVueRenderer();

export default vueRenderer;
export { vueRenderer, createVueRenderer };
export type { VueRendererOptions } from "./factory";

export { renderSlotHtml, type VueSlot } from "./slot";

export { LivewireComponentKey, useLivewireComponent } from "./context";

export { default as useWire } from "./composables/useWire";
export { useEntangle } from "./composables/useEntangle";
export { useErrorBag, type ErrorBagItem } from "./composables/useErrorBag";
