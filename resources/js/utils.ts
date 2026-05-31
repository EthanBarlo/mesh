import { RenderedComponent } from "./types";

export function getComponentName(el: HTMLElement) {
    return el.dataset.meshComponent;
}

export function debugLog(...args: any[]) {
    if (window.Mesh?.config.debug) {
        console.log("Mesh | ", ...args);
    }
}

export function getProps(el: HTMLElement) {
    let props = el.dataset.meshProps;
    if (props) {
        try {
            props = JSON.parse(props);
        } catch (e) {
            console.error("Failed to parse data-mesh-props:", e);
        }
    }
    return props;
}

export function setRenderedComponent(
    livewire_id: string,
    renderedComponent: RenderedComponent
) {
    if (!window.Mesh) {
        throw new Error("Mesh is not initialized");
    }
    window.Mesh.renderedComponents[livewire_id] = renderedComponent;
}

export function getRenderedComponent(livewire_id: string) {
    const renderedComponent = window.Mesh?.renderedComponents[livewire_id];
    if (!renderedComponent) {
        throw new Error(`Mesh rendered component "${livewire_id}" not found`);
    }
    return renderedComponent;
}

export function getRenderer(type: string) {
    const renderer = window.Mesh?.config.renderers[type];
    if (!renderer) {
        throw new Error(`Mesh renderer for "${type}" not found`);
    }
    return renderer;
}
