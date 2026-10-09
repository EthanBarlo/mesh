import type { ReactNode } from "react";
import type {
    Config,
    LazyMeshRenderer,
    MeshRenderer,
} from "../../resources/js/types";
import reactRenderer, { createReactRenderer } from "../../resources/js/react";
import vueRenderer, { createVueRenderer } from "../../resources/js/vue";
import svelteRenderer, { createSvelteRenderer } from "../../resources/js/svelte";

// Type-level checks for Config.renderers. Compiled by `npm run typecheck`;
// never executed.
declare const fullRenderer: MeshRenderer<ReactNode>;

const lazyCustom: LazyMeshRenderer = {
    type: "marko",
    extensions: ["marko"],
    load: () => Promise.resolve(fullRenderer),
};

const config: Config = {
    renderers: [
        // The built-in lazy descriptors and factories.
        reactRenderer,
        vueRenderer,
        svelteRenderer,
        createReactRenderer({
            strictMode: false,
            wrap: (node, { livewireComponent }) => {
                void livewireComponent.id;
                return node;
            },
        }),
        createVueRenderer({
            setup: (app, { livewireComponent }) => {
                app.provide("id", livewireComponent.id);
            },
        }),
        createSvelteRenderer({
            context: ({ livewireComponent }) =>
                new Map([["id", livewireComponent.id]]),
        }),
        // A full renderer object is still accepted, with optional extensions.
        { ...fullRenderer, extensions: ["tsx"] },
        lazyCustom,
    ],
};

// The documented "keep the options lazy" pattern: a descriptor whose load()
// defers to a factory-built descriptor's load().
const lazyOptions: LazyMeshRenderer = {
    type: "react",
    load: () =>
        Promise.resolve({ reactRenderer: createReactRenderer() }).then((m) =>
            m.reactRenderer.load()
        ),
};
void lazyOptions;

// @ts-expect-error A lazy descriptor needs `load`.
const missingLoad: Config["renderers"][number] = { type: "x" };

void config;
void missingLoad;
