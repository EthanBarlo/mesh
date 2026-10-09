// The lazy Svelte renderer. This module must not import Svelte at runtime
// (types only): it is what app.ts pulls into the entry chunk, and the
// framework should only download on pages that have a Svelte island.
import type { LazyMeshRenderer, LivewireComponent } from "../types";

export type SvelteRendererOptions = {
    // Extra context for every island, merged into the context Map passed to
    // Svelte's mount(), so components can getContext() it. Each island is its
    // own component tree, so this runs once per island, before it mounts.
    context?: (ctx: { livewireComponent: LivewireComponent }) => Map<any, any>;
};

// Build a lazy Svelte renderer with app-level options. Svelte's runtime and
// the renderer are fetched the first time a Svelte island mounts.
export function createSvelteRenderer(
    options: SvelteRendererOptions = {}
): LazyMeshRenderer {
    return {
        type: "svelte",
        load: () =>
            import("./renderer.svelte").then((m) =>
                m.buildSvelteRenderer(options)
            ),
    };
}
