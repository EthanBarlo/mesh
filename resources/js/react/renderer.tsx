import React from "react";
import { createRoot } from "react-dom/client";
import LivewireContext from "./context";
import { MeshSlots, MeshRenderer } from "../types";

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

const reactRenderer: MeshRenderer = {
    type: "react",
    renderComponent: (
        componentName,
        livewireComponent,
        Component,
        props,
        slots = {}
    ) => {
        const root_element = livewireComponent.el.querySelector(".mesh-root");

        if (!root_element) {
            throw new Error("Mesh root element not found");
        }

        const root = createRoot(root_element);

        // Props and slots are tracked in closure variables and re-applied on
        // every render() so a prop update never drops the slot content and a
        // slot update never drops the props.
        let currentProps = props;
        let children: React.ReactNode;
        let namedSlots: Record<string, React.ReactNode> = {};

        const applySlots = (s: MeshSlots) => {
            const { default: def, ...named } = s;
            children = def ? <MeshSlot html={def} /> : undefined;
            namedSlots = Object.fromEntries(
                Object.entries(named).map(([name, html]) => [
                    name,
                    <MeshSlot key={name} html={html} />,
                ])
            );
        };

        applySlots(slots);

        // Creating a function here to allow us to update the props
        // while maintaining the same root element, thus maintaining any state.
        const render = () => {
            const hasNamed = Object.keys(namedSlots).length > 0;

            // Fail fast: `children` and `slots` are reserved for slot content.
            if ((children || hasNamed) && "children" in currentProps) {
                throw new Error(
                    "Mesh: `children` is reserved for slot content — rename the prop from props()."
                );
            }
            if (hasNamed && "slots" in currentProps) {
                throw new Error(
                    "Mesh: `slots` is reserved for named slot content — rename the prop from props()."
                );
            }

            root.render(
                <React.StrictMode>
                    <LivewireContext.Provider value={livewireComponent}>
                        <Component
                            {...currentProps}
                            {...(hasNamed ? { slots: namedSlots } : {})}
                        >
                            {children}
                        </Component>
                    </LivewireContext.Provider>
                </React.StrictMode>
            );
        };

        // Initial render
        render();

        return {
            componentName,
            props,
            updateProps: (_livewireComponent, props) => {
                currentProps = props;
                render();
            },
            updateSlots: (slots) => {
                applySlots(slots);
                render();
            },
            cleanup: () => {
                root.unmount();
            },
        };
    },
};

export default reactRenderer;
