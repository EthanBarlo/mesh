import renderComponent from "./renderComponent";
import { Config } from "./types";
import {
    debugLog,
    getComponentAsset,
    getComponentName,
    getProps,
    getRenderedComponent,
    setRenderedComponent,
} from "./utils";

// Tracks in-flight dynamic imports per asset URL so multiple instances of the
// same mesh component don't trigger redundant network work.
const assetLoaders: Record<string, Promise<unknown>> = {};

async function ensureComponentRegistered(
    componentName: string,
    assetUrl: string | undefined
): Promise<void> {
    if (window.Mesh?.components[componentName]) {
        return;
    }

    if (!assetUrl) {
        throw new Error(
            `Mesh: component "${componentName}" is not registered and no data-mesh-asset URL was provided to load it dynamically.`
        );
    }

    if (!assetLoaders[assetUrl]) {
        debugLog("component.init | " + componentName, "Importing asset", assetUrl);
        assetLoaders[assetUrl] = import(/* @vite-ignore */ assetUrl).catch((e) => {
            delete assetLoaders[assetUrl];
            throw e;
        });
    }

    await assetLoaders[assetUrl];

    if (!window.Mesh?.components[componentName]) {
        throw new Error(
            `Mesh: asset at "${assetUrl}" finished loading but did not register component "${componentName}".`
        );
    }
}

export default async function initMesh(Livewire: any, config: Config) {
    const { renderers, debug } = config;

    // Initialize the Mesh global object, which tracks the registered components,
    // the actively rendered components, and their props.
    window.Mesh = {
        components: {},
        renderedComponents: {},
        config: {
            renderers: Object.fromEntries(
                renderers.map((r) => [r.type, r.renderComponent])
            ),
            debug,
        },
    };

    debugLog("Initialized Mesh", window.Mesh.config);

    // Hook into Livewire component initialization
    Livewire.hook("component.init", async ({ component, cleanup }: any) => {
        const componentName = getComponentName(component.el);

        if (!componentName) {
            return; // Not a Mesh component
        }
        debugLog("component.init | " + componentName, { component });

        try {
            await ensureComponentRegistered(
                componentName,
                getComponentAsset(component.el)
            );
        } catch (e) {
            console.error(e);
            return;
        }

        try {
            const renderedComponent = await renderComponent(
                component,
                componentName
            );
            setRenderedComponent(component.id, renderedComponent);
            cleanup(() => renderedComponent.cleanup());
        } catch (e) {
            console.error(`Mesh: failed to render "${componentName}"`, e);
        }
    });

    // Hook into Livewire component updates
    Livewire.hook("morph.updated", ({ el, component }: any) => {
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
