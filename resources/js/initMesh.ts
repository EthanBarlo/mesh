import { buildRegistry } from "./buildRegistry";
import renderComponent from "./renderComponent";
import {
    ComponentRegistry,
    Config,
    MeshRenderer,
    MeshRendererDefinition,
    RenderedComponent,
} from "./types";
import {
    debugLog,
    getComponentName,
    getProps,
    getRenderedComponent,
    getRenderer,
    getSlots,
    removeRenderedComponent,
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
                if (
                    !m ||
                    typeof m !== "object" ||
                    !("default" in m) ||
                    !m.default
                ) {
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

// Key the configured renderers by type. Anything that is neither a full
// renderer (`mount`) nor a lazy descriptor (`load`) is logged and skipped
// rather than thrown, so app.ts still reaches Livewire.start(). Two renderers
// with the same type: the last one wins.
function indexRenderers(
    renderers: unknown
): Record<string, MeshRendererDefinition> {
    const byType: Record<string, MeshRendererDefinition> = {};
    if (!Array.isArray(renderers)) {
        console.error("Mesh: `renderers` must be an array.");
        return byType;
    }

    for (const renderer of renderers) {
        if (
            !renderer ||
            typeof renderer.type !== "string" ||
            (typeof renderer.mount !== "function" &&
                typeof renderer.load !== "function")
        ) {
            console.error(
                "Mesh: ignoring an invalid renderer (it needs a `type` and either `mount` or `load`).",
                renderer
            );
            continue;
        }
        byType[renderer.type] = renderer;
    }

    return byType;
}

// Boot Mesh: build the registry, set `window.Mesh` and hook into Livewire.
// Synchronous and non-throwing for configuration mistakes: a bad registry
// entry or renderer is logged with console.error and skipped, so the rest of
// the page's islands still mount. (`await initMesh(...)` still works.)
export default function initMesh(Livewire: any, config: Config): void {
    const { debug, sources } = config;
    const renderers = indexRenderers(config.renderers);

    let registry: ComponentRegistry = {};
    try {
        registry = buildRegistry(
            componentModules,
            sources,
            Object.values(renderers)
        );
    } catch (e) {
        // buildRegistry logs bad entries itself; this only catches a
        // malformed `sources` value.
        console.error("Mesh: failed to build the component registry", e);
    }

    // Initialize the Mesh global object synchronously so the registry is
    // available the moment Livewire begins initializing components.
    window.Mesh = {
        registry,
        resolved: {},
        renderedComponents: {},
        config: {
            renderers,
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
            if (renderedComponent) {
                removeRenderedComponent(component.id, renderedComponent);
                renderedComponent.cleanup();
            }
        });

        // Fetch the component's chunk and its renderer (for a lazy renderer,
        // the framework runtime) in parallel. Both are cached, so only the
        // first island of a kind waits on the network.
        let componentLoad: Promise<any>;
        try {
            componentLoad = loadComponent(id);
        } catch (e) {
            console.error(e);
            return;
        }
        const [loadedComponent, loadedRenderer] = await Promise.allSettled([
            componentLoad,
            getRenderer(window.Mesh!.registry[id].renderer),
        ]);
        if (loadedComponent.status === "rejected") {
            console.error(loadedComponent.reason);
            return;
        }
        if (loadedRenderer.status === "rejected") {
            console.error(
                "Mesh: failed to render \"" + id + "\"",
                loadedRenderer.reason
            );
            return;
        }
        if (disposed) {
            return;
        }
        const resolvedComponent = loadedComponent.value;
        const renderer: MeshRenderer<any> = loadedRenderer.value;

        try {
            const rendered = renderComponent(
                component,
                renderer,
                resolvedComponent
            );
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
