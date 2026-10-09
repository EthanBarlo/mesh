import {
    LazyMeshRenderer,
    MeshRenderer,
    MeshRendererDefinition,
    MeshSlots,
    RenderedComponent,
} from "./types";

export function getComponentName(el: HTMLElement) {
    return el.dataset.meshComponent;
}

export function debugLog(...args: any[]) {
    if (window.Mesh?.config.debug) {
        console.log("Mesh | ", ...args);
    }
}

// Always returns an object: a missing attribute or malformed JSON normalizes
// to {} so downstream consumers (spreads, `"children" in props`) never see
// undefined or a raw string.
export function getProps(el: HTMLElement): Record<string, any> {
    const raw = el.dataset.meshProps;
    if (!raw) {
        return {};
    }
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.error("Failed to parse data-mesh-props:", e);
        return {};
    }
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

// Forget a torn-down island. Only removes the entry if it is still the given
// handle, so a newer island registered under the same id is left alone.
export function removeRenderedComponent(
    livewire_id: string,
    renderedComponent: RenderedComponent
) {
    const rendered = window.Mesh?.renderedComponents;
    if (rendered && rendered[livewire_id] === renderedComponent) {
        delete rendered[livewire_id];
    }
}

// A lazy descriptor has `load` and no `mount`; anything with `mount` is a
// full renderer object.
export function isLazyRenderer(
    renderer: MeshRendererDefinition
): renderer is LazyMeshRenderer {
    return (
        typeof (renderer as MeshRenderer).mount !== "function" &&
        typeof (renderer as LazyMeshRenderer).load === "function"
    );
}

// One load per lazy descriptor, shared by every island of that type. A failed
// load is forgotten so the next island tries again.
const loadedRenderers = new WeakMap<
    LazyMeshRenderer,
    Promise<MeshRenderer<any>>
>();

// Resolve the renderer for a type: a full renderer as-is, or a lazy
// descriptor's loaded renderer (calling `load()` the first time only).
export function getRenderer(type: string): Promise<MeshRenderer<any>> {
    const configured = window.Mesh?.config.renderers[type];
    if (!configured) {
        return Promise.reject(
            new Error(`Mesh renderer for "${type}" not found`)
        );
    }
    if (!isLazyRenderer(configured)) {
        return Promise.resolve(configured);
    }

    let pending = loadedRenderers.get(configured);
    if (!pending) {
        pending = Promise.resolve()
            .then(() => configured.load())
            .then((renderer) => {
                if (!renderer || typeof renderer.mount !== "function") {
                    throw new Error(
                        `Mesh: the "${type}" renderer's load() did not resolve to a renderer.`
                    );
                }
                return renderer;
            })
            .catch((e) => {
                loadedRenderers.delete(configured);
                throw e;
            });
        loadedRenderers.set(configured, pending);
    }
    return pending;
}
