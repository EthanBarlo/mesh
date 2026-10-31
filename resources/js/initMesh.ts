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
    findRenderedComponent,
    getComponentName,
    getProps,
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
    // Boot once per page. A second call (e.g. Vite HMR re-running app.ts)
    // would register the Livewire hooks again and mount every island twice,
    // so it only warns and keeps the first call's registry and config. The
    // flag is `window.Mesh` rather than module state, which HMR resets.
    if (window.Mesh) {
        console.warn(
            "Mesh: initMesh() was already called on this page; ignoring this call."
        );
        return;
    }

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

    // Livewire components a mount has been started for, so a morph that lands
    // while the chunk is still loading (or after a failed mount) never starts
    // a second one.
    const mounting = new WeakSet<object>();

    // Hook into Livewire component initialization. A lazy or deferred
    // component inits with its placeholder as the root, so it has no
    // data-mesh-component yet; the morphed hook below mounts it once the real
    // markup arrives.
    Livewire.hook("component.init", ({ component }: any) => {
        if (getComponentName(component.el)) {
            return mountIsland(component);
        }
    });

    // Hook into Livewire component updates. `morphed` fires once per full
    // component morph (`morph.updated` fires once per morphed element), and
    // the props live on the root element, which only changes in a full morph.
    Livewire.hook("morphed", ({ component }: any) => {
        const rendered = findRenderedComponent(component.id);
        if (!rendered) {
            // A lazy/deferred placeholder that just became the real markup.
            if (getComponentName(component.el) && !mounting.has(component)) {
                mountIsland(component);
            }
            return; // Not a Mesh component, or still mounting
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

    // Load, mount and wire up the island of a Livewire component whose root
    // has data-mesh-component. Teardown is registered on the component itself
    // (what component.init's `cleanup` does), so this works the same when a
    // later morph triggers the mount.
    async function mountIsland(component: any): Promise<void> {
        const id = getComponentName(component.el)!;
        mounting.add(component);
        debugLog("component.init | " + id, { component });

        // Drop markup left over from a page restored by wire:navigate
        // back/forward now, rather than showing a non-interactive copy while
        // the chunk loads. renderComponent clears it again before mounting.
        component.el.querySelector(".mesh-root")?.replaceChildren();

        // Register teardown before any await: Livewire may remove the component
        // while the lazy chunk is loading or rendering. If that happens, mark the
        // work as disposed so we never mount an orphaned root, and tear down any
        // root that was already created before the dispose was observed.
        let disposed = false;
        let renderedComponent: RenderedComponent | undefined;
        component.addCleanup(() => {
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
                component.addCleanup(() => observer.disconnect());
            }
        } catch (e) {
            console.error("Mesh: failed to render \"" + id + "\"", e);
        }
    }
}
