import { MeshSlots, RenderedComponent } from "./types";

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

// Livewire wraps slot content in `<!--[if FRAGMENT:...]><![endif]-->` /
// `<!--[if ENDFRAGMENT:...]><![endif]-->` marker comments so it can morph the
// slot in place. We strip them before mirroring the HTML into the React copy so
// the markers don't leak duplicate fragment tokens into the rendered output.
export const FRAGMENT_MARKER =
    /<!--\[if (?:END)?FRAGMENT\b[\s\S]*?\]><!\[endif\]-->/gi;

export function stripFragmentMarkers(html: string): string {
    return html.replace(FRAGMENT_MARKER, "");
}

// Read the current slot content from a Mesh component's hidden slot holders.
// Scoped to the wrapper's DIRECT children so nested mesh holders inside a slot
// aren't mis-read. Returns {} when the component has no slots.
export function getSlots(el: HTMLElement): MeshSlots {
    const slots: MeshSlots = {};
    const wrapper = el.querySelector<HTMLElement>("[data-mesh-slots]");
    if (!wrapper) {
        return slots;
    }

    for (const holder of Array.from(wrapper.children)) {
        if (!(holder instanceof HTMLElement)) {
            continue;
        }
        const name = holder.dataset.meshSlot;
        if (name) {
            slots[name] = stripFragmentMarkers(holder.innerHTML);
        }
    }

    return slots;
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
