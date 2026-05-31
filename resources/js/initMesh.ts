import { buildRegistry } from "./buildRegistry";
import renderComponent from "./renderComponent";
import { Config } from "./types";
import {
    debugLog,
    getComponentName,
    getProps,
    getRenderedComponent,
    setRenderedComponent,
} from "./utils";

// Resolve (and cache) the default export of a registered component. Each
// component is its own lazy, code-split chunk that is imported on first render.
function loadComponent(id: string): Promise<any> {
    if (!window.Mesh) {
        throw new Error("Mesh is not initialized");
    }

    const entry = window.Mesh.registry[id];
    if (!entry) {
        const known = Object.keys(window.Mesh.registry);
        throw new Error(
            "Mesh: component \"" +
                id +
                "\" is not registered. Known components: " +
                (known.length ? known.join(", ") : "(none)") +
                "."
        );
    }

    const cache = window.Mesh.resolved;
    if (!cache[id]) {
        cache[id] = entry
            .load()
            .then((m) => {
                if (!m || !m.default) {
                    throw new Error(
                        "Mesh: component \"" +
                            id +
                            "\" module has no default export."
                    );
                }
                return m.default;
            })
            .catch((e) => {
                delete cache[id];
                throw e;
            });
    }

    return cache[id];
}

export default async function initMesh(Livewire: any, config: Config) {
    const { renderers, components, debug } = config;

    // Initialize the Mesh global object synchronously (before any await) so the
    // registry is available the moment Livewire begins initializing components.
    window.Mesh = {
        registry: buildRegistry(components ?? {}),
        resolved: {},
        renderedComponents: {},
        config: {
            renderers: Object.fromEntries(
                renderers.map((r) => [r.type, r.renderComponent])
            ),
            debug,
        },
    };

    if (Object.keys(window.Mesh.registry).length === 0) {
        console.warn(
            "Mesh: no components were provided. Did you pass the result of " +
                "import.meta.glob to initMesh?"
        );
    }

    debugLog("Initialized Mesh", window.Mesh.config);

    // Hook into Livewire component initialization
    Livewire.hook("component.init", async ({ component, cleanup }: any) => {
        const id = getComponentName(component.el);

        if (!id) {
            return; // Not a Mesh component
        }
        debugLog("component.init | " + id, { component });

        let resolvedComponent: any;
        try {
            resolvedComponent = await loadComponent(id);
        } catch (e) {
            console.error(e);
            return;
        }

        try {
            const renderedComponent = await renderComponent(
                component,
                id,
                resolvedComponent
            );
            setRenderedComponent(component.id, renderedComponent);
            cleanup(() => renderedComponent.cleanup());
        } catch (e) {
            console.error("Mesh: failed to render \"" + id + "\"", e);
        }
    });

    // Hook into Livewire component updates
    Livewire.hook("morph.updated", ({ component }: any) => {
        try {
            const rendered = getRenderedComponent(component.id);
            let props = getProps(component.el);

            // Return if props have not changed
            if (JSON.stringify(props) === JSON.stringify(rendered.props)) {
                return;
            }

            rendered.updateProps(component, props);
            rendered.props = props;
        } catch (e) {
            return; // Not a Mesh component - silently ignore
        }
    });
}
