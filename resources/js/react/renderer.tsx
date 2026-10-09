import React from "react";
import { createRoot } from "react-dom/client";
import LivewireContext from "./context";
import { MeshSlot } from "./slot";
import type { ReactRendererOptions } from "./factory";
import { MeshRenderer, RenderContext } from "../types";

// The full (eager) React renderer. Apps normally get it through the lazy
// descriptor in ./factory, which imports this module on the first mount.
//
// The core owns all slot/props bookkeeping; this renderer supplies only the
// two React-specific pieces: HTML string -> React node, and mount/update.
export function buildReactRenderer(
    options: ReactRendererOptions = {}
): MeshRenderer<React.ReactNode> {
    const { wrap, strictMode = true } = options;

    return {
        type: "react",

        // `name` becomes the React key for named slots so they keep a stable
        // identity across re-renders; the default slot is passed as a single
        // `children` node and takes no key.
        renderSlot: (html, name) => (
            <MeshSlot key={name === "default" ? undefined : name} html={html} />
        ),

        mount: ({ el, livewireComponent, Component, ctx }) => {
            const root = createRoot(el);

            const render = ({
                props,
                slots,
            }: RenderContext<React.ReactNode>) => {
                const island = (
                    <Component
                        {...props}
                        {...(slots.hasNamed ? { slots: slots.named } : {})}
                    >
                        {slots.children}
                    </Component>
                );

                const tree = (
                    <LivewireContext.Provider value={livewireComponent}>
                        {wrap ? wrap(island, { livewireComponent }) : island}
                    </LivewireContext.Provider>
                );

                root.render(
                    strictMode ? <React.StrictMode>{tree}</React.StrictMode> : tree
                );
            };

            render(ctx);

            return { update: render, cleanup: () => root.unmount() };
        },
    };
}

const reactRenderer = /* @__PURE__ */ buildReactRenderer();

export default reactRenderer;
export { MeshSlot };
