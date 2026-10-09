// The lazy Vue renderer. This module must not import Vue at runtime (types
// only): it is what app.ts pulls into the entry chunk, and the framework
// should only download on pages that have a Vue island.
import type { App } from "vue";
import type { LazyMeshRenderer, LivewireComponent } from "../types";

export type VueRendererOptions = {
    // App-level setup for every island: `app.use(...)`, `app.component(...)`,
    // `app.provide(...)`. Each island is its own Vue app, so this runs once
    // per island, before it mounts.
    setup?: (
        app: App,
        ctx: { livewireComponent: LivewireComponent }
    ) => void;
};

// Build a lazy Vue renderer with app-level options. Vue and the renderer are
// fetched the first time a Vue island mounts.
export function createVueRenderer(
    options: VueRendererOptions = {}
): LazyMeshRenderer {
    return {
        type: "vue",
        load: () =>
            import("./renderer").then((m) => m.buildVueRenderer(options)),
    };
}
