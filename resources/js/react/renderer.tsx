import React from "react";
import { createRoot } from "react-dom/client";
import LivewireContext from "./context";
import { LivewireComponent, MeshRenderer } from "../types";

const reactRenderer: MeshRenderer = {
    type: "react",
    renderComponent: (componentName, livewireComponent, Component, props) => {
        const root_element = livewireComponent.el.querySelector(".mesh-root");

        if (!root_element) {
            throw new Error("Mesh root element not found");
        }

        const root = createRoot(root_element);

        // Creating a function here to allow us to update the props
        // while maintaining the same root element, thus maintaining any state.
        const render = (livewireComponent: LivewireComponent, props: any) => {
            root.render(
                <React.StrictMode>
                    <LivewireContext.Provider value={livewireComponent}>
                        <Component {...props} />
                    </LivewireContext.Provider>
                </React.StrictMode>
            );
        };

        // Initial render
        render(livewireComponent, props);

        return {
            componentName,
            props,
            updateProps: render,
            cleanup: () => {
                root.unmount();
            },
        };
    },
};

export default reactRenderer;
