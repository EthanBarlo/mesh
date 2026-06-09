import React from "react";
import { createRoot } from "react-dom/client";
import LivewireContext from "./context";
import { MeshRenderer, RenderContext } from "../types";

// Slot content is mirrored as static HTML. A wrapper element is unavoidable
// (React Fragments can't take dangerouslySetInnerHTML); `display: contents`
// drops the wrapper box so it doesn't affect layout.
//
// Security: `html` is server-rendered slot content from Blade. Blade escapes
// `{{ }}` interpolation, so it is safe by default; only `{!! … !!}` (or other
// unescaped output) injects raw HTML, which is the caller's responsibility —
// never pass unsanitised user input through a slot.
export function MeshSlot({ html }: { html: string }) {
    return (
        <div
            style={{ display: "contents" }}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

// The core owns all slot/props bookkeeping; this renderer supplies only the
// two React-specific pieces: HTML string -> React node, and mount/update.
const reactRenderer: MeshRenderer<React.ReactNode> = {
    type: "react",

    // `name` becomes the React key for named slots so they keep a stable
    // identity across re-renders; the default slot is passed as a single
    // `children` node and takes no key.
    renderSlot: (html, name) => (
        <MeshSlot key={name === "default" ? undefined : name} html={html} />
    ),

    mount: ({ el, livewireComponent, Component, ctx }) => {
        const root = createRoot(el);

        const render = ({ props, slots }: RenderContext<React.ReactNode>) => {
            root.render(
                <React.StrictMode>
                    <LivewireContext.Provider value={livewireComponent}>
                        <Component
                            {...props}
                            {...(slots.hasNamed ? { slots: slots.named } : {})}
                        >
                            {slots.children}
                        </Component>
                    </LivewireContext.Provider>
                </React.StrictMode>
            );
        };

        render(ctx);

        return { update: render, cleanup: () => root.unmount() };
    },
};

export default reactRenderer;
