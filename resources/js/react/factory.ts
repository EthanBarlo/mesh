// The lazy React renderer. This module must not import React or React DOM at
// runtime (types only): it is what app.ts pulls into the entry chunk, and the
// framework should only download on pages that have a React island.
import type { ReactNode } from "react";
import type { LazyMeshRenderer, LivewireComponent } from "../types";

export type ReactRendererOptions = {
    // Wrap every island, e.g. in app-wide providers or an error boundary.
    // Runs on every render of the island, inside Mesh's Livewire context (so
    // the wrapper can use the hooks); create long-lived objects (a query
    // client, a store) outside it.
    wrap?: (
        node: ReactNode,
        ctx: { livewireComponent: LivewireComponent }
    ) => ReactNode;
    // Render inside <React.StrictMode>. Defaults to true.
    strictMode?: boolean;
};

// Build a lazy React renderer with app-level options. React DOM and the
// renderer are fetched the first time a React island mounts.
export function createReactRenderer(
    options: ReactRendererOptions = {}
): LazyMeshRenderer {
    return {
        type: "react",
        load: () =>
            import("./renderer").then((m) => m.buildReactRenderer(options)),
    };
}
