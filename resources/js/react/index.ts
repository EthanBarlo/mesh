// `@mesh/react`. The default export is a lazy renderer descriptor: importing
// it (as app.ts does) doesn't pull React DOM into the entry chunk. React DOM
// and the renderer load the first time a React island mounts.
import { createReactRenderer } from "./factory";

const reactRenderer = /* @__PURE__ */ createReactRenderer();

export default reactRenderer;
export { reactRenderer, createReactRenderer };
export type { ReactRendererOptions } from "./factory";

export { MeshSlot } from "./slot";

export {
    default as LivewireContext,
    useLivewireComponent,
} from "./context";

export { default as useWire } from "./hooks/useWire";
export { useEntangle } from "./hooks/useEntangle";
export { useErrorBag, type ErrorBagItem } from "./hooks/useErrorBag";
