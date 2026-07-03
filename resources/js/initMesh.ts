import { buildRegistry } from "./buildRegistry";
import renderComponent from "./renderComponent";
import { Config, RenderedComponent } from "./types";
import {
    debugLog,
    getComponentName,
    getProps,
    getRenderedComponent,
    getSlots,
    setRenderedComponent,
} from "./utils";

// Auto-discover every Mesh component. Each `resources/js/mesh/<Name>/index.{ext}`
// becomes its own lazy, code-split chunk, keyed by its derived id. The pattern is a
// root-absolute literal so Vite resolves it against the host app root even though
// this module is loaded through the `@mesh` alias into the package's vendored source.
const componentModules = import.meta.glob<{ default: unknown }>(
    "/resources/js/mesh/**/index.{tsx,jsx,vue,svelte}"
);

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
    const { renderers, debug, sources } = config;

    // Initialize the Mesh global object synchronously (before any await) so the
    // registry is available the moment Livewire begins initializing components.
    window.Mesh = {
        registry: buildRegistry(componentModules, sources),
        resolved: {},
        renderedComponents: {},
        config: {
            renderers: Object.fromEntries(renderers.map((r) => [r.type, r])),
            debug,
        },
    };

    if (Object.keys(window.Mesh.registry).length === 0) {
        console.warn(
            "Mesh: no components found under resources/js/mesh. " +
                "Create one with `php artisan make:mesh <Name>`."
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

        // Register teardown before any await: Livewire may remove the component
        // while the lazy chunk is loading or rendering. If that happens, mark the
        // work as disposed so we never mount an orphaned root, and tear down any
        // root that was already created before the dispose was observed.
        let disposed = false;
        let renderedComponent: RenderedComponent | undefined;
        cleanup(() => {
            disposed = true;
            renderedComponent?.cleanup();
        });

        let resolvedComponent: any;
        try {
            resolvedComponent = await loadComponent(id);
        } catch (e) {
            console.error(e);
            return;
        }
        if (disposed) {
            return;
        }

        try {
            const rendered = renderComponent(component, id, resolvedComponent);
            renderedComponent = rendered;
            if (disposed) {
                rendered.cleanup();
                return;
            }
            setRenderedComponent(component.id, rendered);

            // Mirror server-driven slot changes into the rendered component.
            // Livewire keeps the hidden [data-mesh-slots] holders current via
            // fragment morphing; observe them (never .mesh-root, which React
            // owns) and replace the slot content when the server sends new HTML.
            const slotsRoot = component.el.querySelector("[data-mesh-slots]");
            if (slotsRoot) {
                let last = JSON.stringify(getSlots(component.el));
                const observer = new MutationObserver(() => {
                    const next = getSlots(component.el);
                    const serialized = JSON.stringify(next);
                    if (serialized === last) {
                        return; // skip-morph / no-op
                    }
                    last = serialized;
                    // Server sent new slot content → replace children. Mirror the
                    // mount path's error handling so a reactive-only failure (e.g. a
                    // late prop/slot collision) is logged, not thrown uncaught.
                    try {
                        rendered.updateSlots(next);
                    } catch (e) {
                        console.error("Mesh: failed to update slots", e);
                    }
                });
                observer.observe(slotsRoot, {
                    childList: true,
                    subtree: true,
                    characterData: true,
                });
                cleanup(() => observer.disconnect());
            }
        } catch (e) {
            console.error("Mesh: failed to render \"" + id + "\"", e);
        }
    });

    // Hook into Livewire component updates
    Livewire.hook("morph.updated", ({ component }: any) => {
        let rendered: RenderedComponent;
        try {
            rendered = getRenderedComponent(component.id);
        } catch {
            return; // Not a Mesh component - silently ignore
        }

        // The handle dirty-checks the props itself, so a morph that didn't
        // touch them is a no-op. Real update failures (e.g. a late
        // reserved-prop collision) are logged, mirroring the slot path.
        try {
            rendered.updateProps(getProps(component.el));
        } catch (e) {
            console.error("Mesh: failed to update props", e);
        }
    });
}
